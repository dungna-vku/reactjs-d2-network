import React, { useState, useEffect } from "react";
import "../css/Profile.css";
import { useParams } from "react-router-dom";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import Post from "../components/home/feed/Post";

function Profile({ currentUser }) {
  const { uid } = useParams();
  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);

  // Lấy thông tin của người dùng
  useEffect(() => {
    let isSubcribed = true;

    if (uid !== currentUser.uid) {
      onSnapshot(
        query(collection(db, "users"), where("uid", "==", uid)),
        (snapshot) => {
          if (isSubcribed && snapshot) {
            let list = [];
            snapshot.docs.forEach((doc) =>
              list.push({
                id: doc.id,
                data: doc.data(),
              })
            );
            setUser(list[0]);
          }
        }
      );
    } else {
      setUser({ id: auth.currentUser.email, data: currentUser });
    }

    return () => {
      isSubcribed = false;
    };
  }, [uid, currentUser]);

  // Lấy danh sách bài viết của người dùng
  useEffect(() => {
    let isSubcribed = true;

    if (
      user?.id === auth.currentUser.email ||
      currentUser?.following.includes(user?.id)
    ) {
      onSnapshot(collection(db, `/users/${user.id}/posts`), (snapshot) => {
        if (isSubcribed) {
          setPosts(
            snapshot.docs.map((doc) => {
              return {
                id: doc.id,
                data: doc.data(),
              };
            })
          );
        }
      });
    } else {
      setPosts([]);
    }

    return () => {
      isSubcribed = false;
    };
  }, [currentUser, user, uid]);

  const handleClickBtnFollow = (e) => {
    e.preventDefault();

    // Bỏ theo dõi
    if (currentUser.following.includes(user.id)) {
      // Xoá người được chọn ra khỏi danh sách đang theo dõi của người dùng
      updateDoc(doc(db, `/users/${auth.currentUser.email}`), {
        following: arrayRemove(user.id),
      }).then(() => {
        // Xoá người dùng ra khỏi danh sách người theo dõi của người được chọn
        updateDoc(doc(db, `/users/${user.id}`), {
          followers: arrayRemove(auth.currentUser.email),
        }).then(async () => {
          // Nếu chưa từng nhắn tin thì xoá đoạn chat
          const docRef = doc(
            db,
            `/users/${auth.currentUser.email}/chats/${user.id}`
          );
          const docSnap = await getDoc(docRef);
          if (!docSnap.data().lastMsg) {
            deleteDoc(docRef).then(() => {
              deleteDoc(
                doc(db, `/users/${user.id}/chats/${auth.currentUser.email}`)
              );
            });
          }
        });
      });
    } else {
      // Theo dõi
      // Thêm người được chọn vào danh sách đang theo dõi của người dùng
      updateDoc(doc(db, `/users/${auth.currentUser.email}`), {
        following: arrayUnion(user.id),
      })
        .then(() => {
          // Thêm người dùng vào danh sách người theo dõi của người được chọn
          updateDoc(doc(db, `/users/${user.id}`), {
            followers: arrayUnion(auth.currentUser.email),
          });
        })
        .then(async () => {
          // Thêm đoạn chat rỗng nếu chưa từng chat
          const docRef = doc(
            db,
            `/users/${auth.currentUser.email}/chats/${user.id}`
          );
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            setDoc(docRef, {
              inChat: false,
              newMsg: 0,
            }).then(() => {
              setDoc(
                doc(db, `/users/${user.id}/chats/${auth.currentUser.email}`),
                {
                  inChat: false,
                  newMsg: 0,
                }
              );
            });
          }
        });
    }
  };

  return (
    <div className="profile">
      <div className="profile__header shadow">
        <div className="profile__headerImage">
          <div
            className="profile__background"
            style={{
              backgroundImage: `url(${user?.data.background})`,
            }}
          />
          <div className="profile__avatarContainer">
            <div
              className="profile__avatar"
              style={{
                backgroundImage: `url(${user?.data.profilePicture})`,
              }}
            />
          </div>
        </div>
        <h1 className="profile__username">{user?.data.username}</h1>
        <p className="profile__biography">{user?.data.biography}</p>
        <div className="profile__info">
          <div className="profile__number">
            <span>{user?.data.followers.length}</span>
            <span>Người theo dõi</span>
          </div>
          <div className="profile__number">
            <span>{user?.data.posts}</span>
            <span>Bài viết</span>
          </div>
          <div className="profile__number">
            <span>{user?.data.following.length}</span>
            <span>Đang theo dõi</span>
          </div>
        </div>
        {user?.data.uid !== currentUser.uid && (
          <div
            className="profile__btnFollow p-15 br-10"
            onClick={handleClickBtnFollow}
          >
            {currentUser.following.includes(user?.id)
              ? "Bỏ theo dõi"
              : "Theo dõi"}
          </div>
        )}
      </div>

      <div className="profile__body">
        {posts.map((post, index) => (
          <Post currentUser={currentUser} post={post} key={index} />
        ))}
      </div>
    </div>
  );
}

export default Profile;
