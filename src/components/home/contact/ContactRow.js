import React, { useState, useEffect } from "react";
import "../../../css/home/contact/ContactRow.css";
import { auth, db } from "../../../utils/firebase";
import { doc, onSnapshot } from "firebase/firestore";

function ContactRow({ contactUser }) {
  const [contact, setContact] = useState();
  // const [hasChat, setHasChat] = useState(false);
  const [amountNewMsg, setAmountNewMsg] = useState(0);

  // Lấy thông tin của người liên hệ
  useEffect(() => {
    let isSubcribed = true;

    onSnapshot(doc(db, `/users/${contactUser}`), (snapshot) => {
      if (isSubcribed) {
        setContact(snapshot.data());
      }
    });
    return () => {
      isSubcribed = false;
    };
  }, [contactUser]);

  // Lấy số lượng tin nhắn mới của người liên hệ
  useEffect(() => {
    if (contactUser) {
      const subcribe = onSnapshot(
        doc(db, `/users/${auth.currentUser.email}/chats/${contactUser}`),
        (snapshot) => {
          setAmountNewMsg(snapshot.data().newMsg);
        }
      );

      return () => {
        subcribe();
      };
    }
  }, [contactUser]);

  return (
    <div className="contact__row">
      <div className="contact__avatar">
        <div
          // className={`${
          //   contact && contact.hasStory ? "avatar-hasStory" : "avatar"
          // }`}
          className="avatar"
          style={{
            backgroundImage: `url(${contact && contact.profilePicture})`,
          }}
        />
        {contact && contact.online && (
          <div className="contact__online-icon">
            <div></div>
          </div>
        )}
      </div>
      <p className="contact__username">{contact && contact.username}</p>
      <span
        className="contact__message"
        style={{
          visibility: `${
            amountNewMsg && amountNewMsg > 0 ? "visible" : "hidden"
          }`,
        }}
      >
        {amountNewMsg && amountNewMsg > 9 ? "9+" : amountNewMsg}
      </span>
    </div>
  );
}

export default ContactRow;
