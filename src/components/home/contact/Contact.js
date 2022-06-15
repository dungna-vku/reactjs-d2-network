import { useState } from "react";
import "../../../css/home/contact/Contact.css";
import MiniChat from "./MiniChat";
import ContactRow from "./ContactRow";
import $ from "jquery";
import { updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../../../utils/firebase";

function Contact({ currentUser }) {
  const [selected, setSelected] = useState();

  const handleSelectUser = async (event, user) => {
    event.preventDefault();

    if (selected && user !== selected) {
      // Người dùng không còn trong đoạn chat với người được chọn trước đó
      await updateDoc(
        doc(db, "users", auth.currentUser.email, "chats", selected),
        {
          inChat: false,
        }
      );

      $("miniChat__content").empty();
    }

    setSelected(user);

    await updateDoc(doc(db, "users", auth.currentUser.email, "chats", user), {
      inChat: true,
      newMsg: 0,
    });
    document.getElementsByClassName("miniChat")[0].style.display = "flex";
  };

  return (
    <>
      <div className="contact br-10 shadow">
        <div className="contact__header">
          <span className="contact__header-text">Người liên hệ</span>
          <span className="contact__header-amount br-10">
            {currentUser.following ? currentUser.following.length : 0}
          </span>
        </div>
        {currentUser?.following.map((contactUser, index) => (
          <div key={index} onClick={(e) => handleSelectUser(e, contactUser)}>
            <ContactRow contactUser={contactUser} />
          </div>
        ))}
      </div>
      <MiniChat selected={selected} />
    </>
  );
}

export default Contact;
