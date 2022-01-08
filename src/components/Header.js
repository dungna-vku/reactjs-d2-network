import React, { useState, useEffect } from "react";
import "../css/Header.css";
import logoImage from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";
import { auth, db } from "../utils/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import NewPostModal from "./NewPostModal";
// import IncomingCall from "./IncomingCall";
import Validator from "email-validator";

function Header({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Lắng nghe cuộc gọi đến
  useEffect(() => {
    if (Validator.validate(currentUser?.inCall)) {
      if (
        window.confirm(
          `Bạn có muốn nhận cuộc gọi từ ${currentUser.inCall} hay không?`
        )
      ) {
        const url = `https://d2-videocall.herokuapp.com/?auth=${auth.currentUser.email}&user=${currentUser.inCall}`;
        window.open(url, "Video call", "width=200,height=200");
      } else {
        updateDoc(doc(db, `/users/${auth.currentUser.email}`), {
          inCall: "reject",
        });
      }
    }
  }, [currentUser.inCall]);

  // Hiện modal
  const handleOpenModal = (e) => {
    e.preventDefault();
    document.getElementsByClassName("modal")[0].style.display = "flex";
  };

  // Lấy ra những user cần tìm
  useEffect(() => {
    let isSubcribed = true;

    onSnapshot(collection(db, "users"), (snapshot) => {
      if (isSubcribed) {
        // Danh sách user hiện có
        setUsers(
          snapshot.docs.map((user) => {
            return { id: user.id, data: user.data() };
          })
        );
      }
    });

    // Lấy danh sách người dùng cần tìm
    if (users) {
      if (searchTerm.length >= 1) {
        setFilteredUsers(
          users.filter((user) => {
            return (
              user.data.username
                .toLowerCase()
                .indexOf(searchTerm.toLocaleLowerCase()) !== -1
            );
          })
        );
      } else {
        setFilteredUsers([]);
      }
    }

    return () => {
      isSubcribed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Hàm cập nhật cụm từ tìm kiếm mỗi khi nhập
  const updateSearchResults = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
  };

  // Hàm xử lý khi ấn nút thoát tìm kiếm
  const collapseSearch = () => {
    document.getElementsByClassName("header__logo")[0].style.display = "block";
    document.getElementsByClassName("header__searchBack")[0].style.display =
      "none";
    document.getElementsByClassName("header__search")[0].style.display = "flex";
    document.getElementsByClassName("header__search-input")[0].style.display =
      "none";
    document.getElementById("search-input").value = "";
    document.getElementsByClassName("header__dropdown")[0].style.display =
      "none";
  };

  // Hàm xử lý khi ấn nút tìm kiếm
  const expandSearch = () => {
    document.getElementsByClassName("header__logo")[0].style.display = "none";
    document.getElementsByClassName("header__searchBack")[0].style.display =
      "flex";
    document.getElementsByClassName("header__search")[0].style.display = "none";
    document.getElementsByClassName("header__search-input")[0].style.display =
      "block";
    document.getElementsByClassName("header__dropdown")[0].style.display =
      "block";
  };

  return (
    <>
      <div className="header shadow">
        <div className="header__left">
          <div className="header__left-row">
            <Link to="/" className="header__logo">
              <img height="100%" src={logoImage} alt="Logo" />
            </Link>

            <div className="header__searchBack" onClick={collapseSearch}>
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="header__search-icon"
              />
            </div>

            <label
              className="header__search"
              onClick={expandSearch}
              htmlFor="search-input"
            >
              <FontAwesomeIcon
                icon={faSearch}
                className="header__search-icon"
              />
            </label>

            <label
              className="header__search-input br-10"
              htmlFor="search-input"
            >
              <input
                type="text"
                name="search-input"
                id="search-input"
                placeholder="Tìm kiếm"
                onChange={updateSearchResults}
              />
            </label>
          </div>

          <div className="header__dropdown">
            <ul className="header__search-list">
              {users &&
                filteredUsers.map((user, index) => (
                  <Link
                    to={`/${user.data.uid}`}
                    key={index}
                    className="header__search-item br-10"
                    onClick={collapseSearch}
                  >
                    <div
                      className="avatar"
                      style={{
                        backgroundImage: `url(${user.data.profilePicture})`,
                      }}
                    />
                    <p>{user.data.username}</p>
                  </Link>
                ))}
            </ul>
          </div>
        </div>

        <div className="header__right">
          <div className="header__create br-10" onClick={handleOpenModal}>
            <FontAwesomeIcon
              icon={faPlusSquare}
              className="header__create-icon"
            />
            <span>Tạo mới</span>
          </div>

          <Link to={`/${currentUser.uid}`}>
            <div
              className="avatar"
              style={{
                backgroundImage: `url(${
                  currentUser && currentUser.profilePicture
                })`,
              }}
            />
          </Link>
        </div>
      </div>
      <NewPostModal currentUser={currentUser} />
    </>
  );
}

export default Header;
