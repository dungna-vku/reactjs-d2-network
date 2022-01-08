import React, { useState, useEffect } from "react";
import "../../../css/home/sidebar/Menu.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  // faUserFriends,
  // faBookmark,
  faPaperPlane,
  faSignOutAlt,
  // faPhotoVideo,
  faBell,
  // faCog,
} from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "../../../utils/firebase";
import { signOut } from "firebase/auth";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

function Menu() {
  const [newMsg, setNewMsg] = useState(0);

  useEffect(() => {
    let isSubcribed = true;

    onSnapshot(
      collection(db, "users", auth.currentUser.email, "chats"),
      (snapshot) => {
        if (isSubcribed) {
          let count = 0;
          snapshot.docs.forEach((doc) => (count += doc.data().newMsg));
          setNewMsg(count);
        }
      }
    );
    return () => {
      isSubcribed = false;
    };
  }, []);

  const signOutHandler = async (event) => {
    event.preventDefault();

    await updateDoc(doc(db, "users", auth.currentUser.email), {
      online: false,
    })
      .then(() => signOut(auth))
      .catch((err) => console.log(err.message));
  };

  return (
    <ul className="menu br-10 shadow">
      <li className="menu__item active">
        <a href="/">
          <FontAwesomeIcon icon={faHome} className="menu__item-icon" />
          <span className="menu__item-name">Trang chủ</span>
        </a>
      </li>

      {/* <li className="menu__item">
        <a href="/">
          <FontAwesomeIcon icon={faUserFriends} className="menu__item-icon" />
          <span className="menu__item-name">Tin của bạn bè</span>
          <span className="badge-blue">9+</span>
        </a>
      </li> */}

      <li className="menu__item">
        <Link to="/chat">
          <FontAwesomeIcon icon={faPaperPlane} className="menu__item-icon" />
          <span className="menu__item-name">Tin nhắn</span>
          {newMsg > 0 && (
            <span className="badge-red">{newMsg > 9 ? "9+" : newMsg}</span>
          )}
        </Link>
      </li>

      {/* <li className="menu__item">
        <a href="/">
          <FontAwesomeIcon icon={faPhotoVideo} className="menu__item-icon" />
          <span className="menu__item-name">Kho ảnh / video</span>
        </a>
      </li> */}

      {/* <li className="menu__item">
        <a href="/">
          <FontAwesomeIcon icon={faBookmark} className="menu__item-icon" />
          <span className="menu__item-name">Đã lưu</span>
        </a>
      </li> */}

      <li className="menu__item">
        <a href="/">
          <FontAwesomeIcon icon={faBell} className="menu__item-icon" />
          <span className="menu__item-name">Thông báo</span>
          <span className="badge-blue">9+</span>
        </a>
      </li>

      {/* <li className="menu__item">
        <a href="/">
          <FontAwesomeIcon icon={faCog} className="menu__item-icon" />
          <span className="menu__item-name">Cài đặt</span>
        </a>
      </li> */}

      <li className="menu__item">
        <a href="/" onClick={(e) => signOutHandler(e)}>
          <FontAwesomeIcon icon={faSignOutAlt} className="menu__item-icon" />
          <span className="menu__item-name">Đăng xuất</span>
        </a>
      </li>
    </ul>
  );
}

export default Menu;
