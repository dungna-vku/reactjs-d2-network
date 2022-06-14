import React, { useState, useEffect } from "react";
import "../css/Profile.css";
import { useParams } from "react-router-dom";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { auth, db, storage } from "../utils/firebase";
import Post from "../components/home/feed/Post";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

function Profile({ currentUser }) {
  const { uid } = useParams();
  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState(currentUser.username);
  const [biography, setBiography] = useState(currentUser.biography);
  const authEmail = auth.currentUser.email;

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
      setUser({ id: authEmail, data: currentUser });
    }

    return () => {
      isSubcribed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, currentUser]);

  // Lấy danh sách bài viết của người dùng
  useEffect(() => {
    let isSubcribed = true;

    if (user?.id === authEmail || currentUser?.following.includes(user?.id)) {
      onSnapshot(
        query(
          collection(db, `/users/${user.id}/posts`),
          orderBy("createdAt", "desc")
        ),
        (snapshot) => {
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
        }
      );
    } else {
      setPosts([]);
    }

    return () => {
      isSubcribed = false;
    };
  }, [currentUser, user, uid, authEmail]);

  const handleClickBtnFollow = (e) => {
    e.preventDefault();

    // Bỏ theo dõi
    if (currentUser.following.includes(user.id)) {
      // Xoá người được chọn ra khỏi danh sách đang theo dõi của người dùng
      updateDoc(doc(db, `/users/${authEmail}`), {
        following: arrayRemove(user.id),
      }).then(() => {
        // Xoá người dùng ra khỏi danh sách người theo dõi của người được chọn
        updateDoc(doc(db, `/users/${user.id}`), {
          followers: arrayRemove(authEmail),
        }).then(() => {
          // Thông báo bỏ theo dõi người dùng
          addDoc(collection(db, `/users/${user.id}/notifications`), {
            userEmail: authEmail,
            time: new Date().getTime(),
            type: "unfollow",
            relatedId: authEmail,
            seen: false,
          }).then(() => {
            // Tăng số thông báo mới của người dùng lên 1
            updateDoc(doc(db, `/users/${user.id}`), {
              newNotifications: increment(1),
            }).then(async () => {
              // Nếu chưa từng nhắn tin thì xoá đoạn chat
              const docRef = doc(db, `/users/${authEmail}/chats/${user.id}`);
              const docSnap = await getDoc(docRef);

              if (!docSnap.data().lastMsg) {
                deleteDoc(docRef).then(() => {
                  deleteDoc(
                    doc(db, `/users/${user.id}/chats/${authEmail}`)
                  ).then(() => {});
                });
              }
            });
          });
        });
      });
    } else {
      // Theo dõi
      // Thêm người được chọn vào danh sách đang theo dõi của người dùng
      updateDoc(doc(db, `/users/${authEmail}`), {
        following: arrayUnion(user.id),
      }).then(() => {
        // Thêm người dùng vào danh sách người theo dõi của người được chọn
        updateDoc(doc(db, `/users/${user.id}`), {
          followers: arrayUnion(authEmail),
        }).then(() => {
          // Thông báo bỏ theo dõi người dùng
          addDoc(collection(db, `/users/${user.id}/notifications`), {
            userEmail: authEmail,
            time: new Date().getTime(),
            type: "follow",
            relatedId: authEmail,
            seen: false,
          }).then(() => {
            // Tăng số thông báo mới của người dùng lên 1
            updateDoc(doc(db, `/users/${user.id}`), {
              newNotifications: increment(1),
            }).then(async () => {
              // Thêm đoạn chat rỗng nếu chưa từng chat
              const docRef = doc(db, `/users/${authEmail}/chats/${user.id}`);
              const docSnap = await getDoc(docRef);

              if (!docSnap.exists()) {
                setDoc(docRef, {
                  inChat: false,
                  newMsg: 0,
                }).then(() => {
                  setDoc(doc(db, `/users/${user.id}/chats/${authEmail}`), {
                    inChat: false,
                    newMsg: 0,
                  });
                });
              }
            });
          });
        });
      });
    }
  };

  const changeImage = async (e, option) => {
    e.preventDefault();

    const image = e.target.files[0];
    if (!image) return;

    await uploadBytesResumable(
      ref(storage, `/users/${authEmail}/${option}/${image.name}`),
      image
    ).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        updateDoc(doc(db, `/users/${authEmail}/`), {
          [option]: url,
        });
      });
    });
  };

  const handleClickBtnEdit = (e) => {
    e.preventDefault();

    document.getElementById("profile__btnEdit").style.display = "none";
    document.getElementsByClassName("profile__username")[0].style.display =
      "none";
    document.getElementsByClassName("profile__biography")[0].style.display =
      "none";
    document.getElementById("infoForm").style.display = "flex";
  };

  const changeUsername = (e) => {
    e.preventDefault();

    setUsername(e.target.value);
  };

  const changeBiography = (e) => {
    e.preventDefault();

    setBiography(e.target.value);
  };

  const submitChange = (e) => {
    e.preventDefault();

    console.log(e.target.username.value);
    updateDoc(doc(db, `/users/${authEmail}`), {
      username: e.target.username.value,
      biography: e.target.biography.value,
    }).then(reset);
  };

  const cancelChange = (e) => {
    e.preventDefault();

    setUsername(currentUser.username);
    setBiography(currentUser.biography);

    reset();
  };

  const reset = () => {
    document.getElementById("infoForm").style.display = "none";
    document.getElementsByClassName("profile__username")[0].style.display =
      "block";
    document.getElementsByClassName("profile__biography")[0].style.display =
      "block";
    document.getElementById("profile__btnEdit").style.display = "block";
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
          >
            {uid === currentUser.uid && (
              <label
                className="profile__btnChangeBackground br-10"
                htmlFor="myBackground"
              >
                <FontAwesomeIcon
                  icon={faCamera}
                  className="profile__changeIcon"
                />
                <input
                  style={{ display: "none" }}
                  type="file"
                  name="myBackground"
                  id="myBackground"
                  accept="image/*"
                  onChange={(e) => changeImage(e, "background")}
                />
                <span>Đổi ảnh bìa</span>
              </label>
            )}
          </div>
          <div className="profile__avatarContainer">
            <div
              className="profile__avatar"
              style={{
                backgroundImage: `url(${user?.data.profilePicture})`,
              }}
            >
              {uid === currentUser.uid && (
                <label htmlFor="myAvatar" className="profile__btnChangeAvatar">
                  <FontAwesomeIcon
                    icon={faCamera}
                    className="profile__changeIcon"
                  />
                  <input
                    style={{ display: "none" }}
                    type="file"
                    name="myAvatar"
                    id="myAvatar"
                    accept="image/*"
                    onChange={(e) => changeImage(e, "profilePicture")}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
        <p className="profile__username">{user?.data.username}</p>
        <p className="profile__biography">{user?.data.biography}</p>

        <form id="infoForm" onSubmit={submitChange}>
          <input
            className="profile__inputUsername"
            type={"text"}
            id={"username"}
            placeholder={"Tên hiển thị"}
            onChange={changeUsername}
            value={username}
          />
          <input
            className="profile__inputBiography"
            type={"text"}
            id={"biography"}
            placeholder={"Tiểu sử"}
            onChange={changeBiography}
            value={biography}
          />
          <div>
            <input
              type={"submit"}
              className={"profile__formBtn br-10"}
              value={"Thay đổi"}
            />
            <input
              type={"button"}
              className={"profile__formBtn br-10"}
              value={"Huỷ"}
              onClick={cancelChange}
            />
          </div>
        </form>

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
        {user?.data.uid !== currentUser.uid ? (
          <div
            className="profile__btnFollow p-15 br-10"
            onClick={handleClickBtnFollow}
          >
            {currentUser.following.includes(user?.id)
              ? "Bỏ theo dõi"
              : "Theo dõi"}
          </div>
        ) : (
          <div
            id="profile__btnEdit"
            className="profile__btnFollow p-15 br-10"
            onClick={handleClickBtnEdit}
          >
            Chỉnh sửa
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
