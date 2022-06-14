import {
  addDoc,
  arrayUnion,
  collection,
  collectionGroup,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/StoryDetail.css";
import { auth, db } from "../utils/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

function StoryDetail({ currentUser }) {
  const [stories, setStories] = useState([]);
  const [users, setUsers] = useState([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState(0);

  // Lấy danh sách tin
  useEffect(() => {
    const subcribe = onSnapshot(
      query(collectionGroup(db, "stories"), orderBy("createdAt", "desc")),
      (snapshot) => {
        if (currentUser?.following) {
          let newStories = [];
          let newUsers = [];

          snapshot.docs.forEach(async (story) => {
            const data = story.data();

            if (
              currentUser.following.includes(data.email) ||
              data.email === auth.currentUser.email
            ) {
              newStories.push({
                id: story.id,
                data: data,
              });

              const docSnap = await getDoc(doc(db, `/users/${data.email}`));

              if (docSnap.exists()) {
                newUsers.push(docSnap.data());
              }
            }
          });

          setStories(newStories);
          setUsers(newUsers);
        }
      }
    );

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((oldValue) => {
        const newValue = oldValue + 10;

        if (newValue === 100) {
          if (index <= stories?.length) {
            setValue(0);
            setIndex(index + 1);
          } else {
            clearInterval(interval);
          }
        }

        return newValue;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  let arr = [],
    date = "";
  if (index < stories.length) {
    arr = new Date(stories[index].data.createdAt)
      .toLocaleDateString()
      .split("/");
    date = `${arr[1]}/${arr[0]}/${arr[2]}`;
  }

  const likeStory = (e) => {
    e.preventDefault();

    updateDoc(
      doc(
        db,
        `/users/${stories[index].data.email}/stories/${stories[index].id}`
      ),
      {
        likes: arrayUnion(auth.currentUser.email),
      }
    ).then(() => {
      if (stories[index].data.email !== auth.currentUser.email) {
        addDoc(
          collection(db, `/users/${stories[index].data.email}/notifications`),
          {
            userEmail: auth.currentUser.email,
            time: new Date().getTime(),
            type: "like story",
            relatedId: stories[index].id,
            seen: false,
          }
        ).then(() => {
          updateDoc(doc(db, `/users/${stories[index].data.email}`), {
            newNotifications: increment(1),
          });
        });
      }
    });
  };

  return (
    <div className="storyDetail">
      <Link to="/" className="storeyDetail__left">
        <div className="storeyDetail__logo">D2 Network</div>
      </Link>

      {index < stories?.length ? (
        <div
          className="storyDetail__main"
          style={
            stories[index]?.data.imageURL !== ""
              ? {
                  backgroundImage: `url(${stories[index]?.data.imageURL})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center center",
                }
              : {
                  background: `linear-gradient(to right, #a770ef 0%, #cf8bf3 50%, #fdb99b 100%)`,
                }
          }
        >
          <progress value={value} max={100} style={{ width: "100%" }} />

          <div className="storyDetail__info">
            <Link to={`/${users[index]?.uid}`}>
              <div
                className="avatar"
                style={{
                  backgroundImage: `url(${users[index]?.profilePicture})`,
                }}
              />
            </Link>

            <div className="post__info">
              <Link to={`/${users[index]?.uid}`} className="post__username">
                {users[index]?.username}
              </Link>
              <p className="storyDetail__time">
                {`${new Date(
                  stories[index].data.createdAt
                ).toLocaleTimeString()}, ${date}`}
              </p>
            </div>
          </div>

          <div className="storyDetail__captionContainer">
            <p className="storyDetail__caption">
              {stories[index].data.caption}
            </p>
          </div>

          {index > 0 && (
            <div
              className="storyDetail__previous"
              onClick={() => {
                setIndex(index - 1);
                setValue(0);
              }}
            >
              {"<"}
            </div>
          )}
          {index < stories.length - 1 && (
            <div
              className="storyDetail__next"
              onClick={() => {
                setIndex(index + 1);
                setValue(0);
              }}
            >
              {">"}
            </div>
          )}

          <div
            className="storyDetail__like"
            style={
              stories[index]?.data.likes.includes(auth.currentUser.email)
                ? { color: "red" }
                : { color: "black" }
            }
            onClick={likeStory}
          >
            <FontAwesomeIcon icon={faHeart} className="storyDetail__likeIcon" />
          </div>
        </div>
      ) : (
        <Link to={"/"} className="storyDetail__goBack p-15 br-10">
          Quay lại trang chủ
        </Link>
      )}
    </div>
  );
}

export default StoryDetail;
