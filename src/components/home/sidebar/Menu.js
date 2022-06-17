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
  const authEmail = auth.currentUser.email;
  const [newMsg, setNewMsg] = useState(0);
  const [newNotif, setNewNotif] = useState(0);

  // Lấy số lượng tin nhắn mới
  useEffect(() => {
    const subcribe = onSnapshot(
      collection(db, "users", authEmail, "chats"),
      (snapshot) => {
        let count = 0;
        snapshot.docs.forEach((doc) => (count += doc.data().newMsg));
        setNewMsg(count);
      }
    );
    return () => {
      subcribe();
    };
  }, [authEmail]);

  // Lấy số lượng thông báo mới
  useEffect(() => {
    const subcribe = onSnapshot(doc(db, `/users/${authEmail}`), (snapshot) => {
      setNewNotif(snapshot.data().newNotifications);
    });

    return () => {
      subcribe();
    };
  }, [authEmail]);

  // Hiển thị / Ẩn thông báo
  const toggleNotif = (e) => {
    e.preventDefault();

    const notif = document.getElementById("notification");
    const notifStyle = window.getComputedStyle(notif);

    notif.style.display = notifStyle.display === "none" ? "flex" : "none";
  };

  const signOutHandler = async (event) => {
    event.preventDefault();

    await updateDoc(doc(db, "users", authEmail), {
      online: false,
    })
      .then(() => signOut(auth))
      .catch((err) => console.log(err.message));
  };

  return (
    <ul className="menu br-10 shadow">
      <li className="menu__item active">
        <Link to="/">
          <FontAwesomeIcon icon={faHome} className="menu__item-icon" />
          <span className="menu__item-name">Trang chủ</span>
        </Link>
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
          <FontAwesomeIcon icon={faBookmark} className="menu__item-icon" />
          <span className="menu__item-name">Đã lưu</span>
        </a>
      </li> */}

      <li className="menu__item">
        <p onClick={toggleNotif} href="#">
          <FontAwesomeIcon icon={faBell} className="menu__item-icon" />
          <span className="menu__item-name">Thông báo</span>
          {newNotif > 0 && (
            <span className="badge-red">{newNotif > 9 ? "9+" : newNotif}</span>
          )}
        </p>
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
