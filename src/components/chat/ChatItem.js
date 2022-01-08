import "../../css/chat/ChatItem.css";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../utils/firebase";

function ChatItem({ item }) {
  const datetime = new Date(item.data.lastMsgAt);
  const newDatetime = new Date();
  const date = datetime.getDate();
  const month = datetime.getMonth() + 1;
  const year = datetime.getFullYear();
  const lastMsgAt =
    date === newDatetime.getDate() &&
    month === newDatetime.getMonth() + 1 &&
    year === newDatetime.getFullYear()
      ? `${datetime.getHours()}:${
          datetime.getMinutes() < 10 ? "0" : ""
        }${datetime.getMinutes()}`
      : `${date}/${month}/${year}`;
  const [itemUser, setItemUser] = useState();

  // Lấy thông tin của người trong đoạn chat
  useEffect(() => {
    let isSubcribed = true;

    onSnapshot(doc(db, `/users/${item.id}`), (snapshot) => {
      if (isSubcribed) {
        setItemUser(snapshot.data());
      }
    });

    return () => {
      isSubcribed = false;
    };
  }, [item.id]);

  return (
    <div className="chatItem">
      <div className="chatItem__avatarContainer">
        <div
          className="avatar"
          style={{
            backgroundImage: `url(${itemUser && itemUser.profilePicture})`,
          }}
        />
        {itemUser && itemUser.online && (
          <div className="chatList__onlineIcon">
            <div></div>
          </div>
        )}
        {item.data.newMsg > 0 && (
          <span className="badge-red">
            {item.data.newMsg > 9 ? "9+" : item.data.newMsg}
          </span>
        )}
      </div>
      <div className="chatItem__info">
        <span
          className="chatItem__username"
          style={{ fontWeight: item.data.newMsg > 0 ? "700" : "normal" }}
        >
          {itemUser && itemUser.username}
        </span>
        <div className="chatItem__infoRow">
          <p
            className="chatItem__lastMsg"
            style={{
              color: item.data.newMsg > 0 ? "#1978f2" : "#888888",
              fontWeight: item.data.newMsg > 0 ? "700" : "normal",
            }}
          >
            {item.data.lastSender === auth.currentUser.uid && "Bạn: "}
            {item.data.imageURL === true ? "Đã gửi 1 ảnh" : item.data.lastMsg}
          </p>
          <span className="chatItem__lastMsgAt">- {lastMsgAt}</span>
        </div>
      </div>
    </div>
  );
}

export default ChatItem;
