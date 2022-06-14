import React, { useState, useEffect } from "react";
import { doc, increment, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../utils/firebase";
import { Link } from "react-router-dom";
import "../../../css/home/feed/NotifItem.css";

function NotifItem({ id, data }) {
  const [user, setUser] = useState();
  const authEmail = auth.currentUser.email;

  let content = "";
  switch (data.type) {
    case "follow":
      content = "đã bắt đầu theo dõi bạn";
      break;
    case "unfollow":
      content = "đã bỏ theo dõi bạn";
      break;
    case "like post":
      content = "đã thích bài viết của bạn";
      break;
    case "comment post":
      content = "đã bình luận về bài viết của bạn";
      break;
    case "like story":
      content = "đã thích tin của bạn";
      break;
    default:
      break;
  }

  const arr = new Date(data.time).toLocaleDateString().split("/");
  const date = `${arr[1]}/${arr[0]}/${arr[2]}`;

  useEffect(() => {
    const subcribe = onSnapshot(
      doc(db, `/users/${data.userEmail}`),
      (snapshot) => {
        setUser(snapshot.data());
      }
    );

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clickHandler = (e) => {
    e.preventDefault();

    if (!data.seen) {
      updateDoc(doc(db, `/users/${authEmail}/notifications/${id}`), {
        seen: true,
      }).then(() => {
        updateDoc(doc(db, `/users/${authEmail}`), {
          newNotifications: increment(-1),
        });
      });
    }
  };

  let link = "";
  if (data.type.includes("post")) {
    link = `../post/${data.relatedId}`;
  } else if (data.type.includes("follow")) {
    link = `../${user?.uid}`;
  } else {
    link = `../stories`;
  }

  return (
    <div onClick={clickHandler}>
      <Link to={link}>
        <div className={data.seen ? "notif__container" : "notif__containerNew"}>
          <div
            className="avatar"
            style={{ backgroundImage: `url(${user?.profilePicture})` }}
          />
          <div className="notif__main">
            <p className="notif__content">
              <span className="notif__username">{user?.username}</span>{" "}
              {content}
            </p>
            <p className="notif__time">{`${new Date(
              data.time
            ).toLocaleTimeString()}, ${date}`}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default NotifItem;
