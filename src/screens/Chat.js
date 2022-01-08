import React, { useEffect, useState } from "react";
import "../css/chat/Chat.css";
import ChatContent from "../components/chat/ChatContent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSearch,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  collection,
  orderBy,
  onSnapshot,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import ChatItem from "../components/chat/ChatItem";

function Chat({ currentUser }) {
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [searchChat, setSearchChat] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState();

  // Lấy thông tin của tất cả người liên hệ
  useEffect(() => {
    let isSubcribed = true;

    onSnapshot(collection(db, "users"), (snapshot) => {
      if (isSubcribed && currentUser.following) {
        let newContacts = [];

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (currentUser.following.includes(doc.id)) {
            newContacts.push({ id: doc.id, data: data });
          }
        });

        setContacts(newContacts);
      }
    });

    return () => {
      isSubcribed = false;
    };
  }, [currentUser.following]);

  // Lấy danh sách người liên hệ cần tìm
  useEffect(() => {
    if (contacts) {
      if (searchChat.length >= 1) {
        setFilteredChats(
          contacts.filter((contact) => {
            return (
              contact.data.username
                .toLowerCase()
                .indexOf(searchChat.toLocaleLowerCase()) !== -1
            );
          })
        );
      } else {
        setFilteredChats([]);
      }
    }
  }, [contacts, searchChat]);

  // Lấy danh sách người liên hệ đang online
  useEffect(() => {
    if (contacts) {
      setOnlineUsers(
        contacts.filter((contact) => {
          return contact.data.online === true;
        })
      );
    }
  }, [contacts]);

  // Lấy danh sách các đoạn chat sắp xếp theo số lượng tin nhắn mới và thời gian của tin nhắn cuối cùng
  useEffect(() => {
    let isSubcribed = true;

    onSnapshot(
      query(
        collection(db, `/users/${auth.currentUser.email}/chats`),
        orderBy("newMsg", "desc"),
        orderBy("lastMsgAt", "desc")
      ),
      (snapshot) => {
        if (isSubcribed) {
          setChats(
            snapshot.docs.map((doc) => {
              return { id: doc.id, data: doc.data() };
            })
          );
        }
      }
    );

    return () => {
      isSubcribed = false;
    };
  }, []);

  // Hàm thu gọn tìm kiếm
  const collapseSearchChat = (e) => {
    e.preventDefault();

    setSearchChat("");

    document.getElementsByClassName(
      "chatList__headerSearchBack"
    )[0].style.display = "none";
    document.getElementsByClassName("chatList__dropdown")[0].style.display =
      "none";
    document.getElementsByClassName("chatList__headerOnline")[0].style.display =
      "flex";
    document.getElementsByClassName("chatList__main")[0].style.display = "flex";

    document.getElementsByClassName(
      "chatList__headerSearchInput"
    )[0].style.display = window.innerWidth <= 890 ? "none" : "block";
  };

  // Hàm mở rộng tìm kiếm
  const expandSearchChat = (e) => {
    e.preventDefault();

    document.getElementsByClassName(
      "chatList__headerSearchBack"
    )[0].style.display = "flex";
    document.getElementsByClassName("chatList__main")[0].style.display = "none";
    document.getElementsByClassName("chatList__headerOnline")[0].style.display =
      "none";
    document.getElementsByClassName("chatList__dropdown")[0].style.display =
      "block";

    document.getElementsByClassName(
      "chatList__headerSearchInput"
    )[0].style.display = window.innerWidth <= 890 ? "block" : "initial";
  };

  // Hàm cập nhật nội dung tìm kiếm
  const updateSearchChat = (e) => {
    e.preventDefault();
    setSearchChat(e.target.value);
  };

  // Hàm click vào đoạn chat
  const handleSelectChat = async (e, user) => {
    e.preventDefault();

    // Cập nhật trạng thái rời khỏi đoạn chat trước đó
    if (selectedChat) {
      await updateDoc(
        doc(db, `/users/${auth.currentUser.email}/chats/${selectedChat}`),
        {
          inChat: false,
        }
      );
    }

    setSelectedChat(user);
    collapseSearchChat(e);

    // Cập nhật trạng thái trong đoạn chat và xem tất cả tin nhắn mới
    updateDoc(doc(db, `/users/${auth.currentUser.email}/chats/${user}`), {
      inChat: true,
      newMsg: 0,
    });
  };

  return (
    <div className="chat">
      <div className="chatList">
        <div className="chatList__header">
          <div className="chatList__headerTop">
            <span>Tin nhắn</span>
            <div className="chatList__newIconContainer">
              <FontAwesomeIcon icon={faEdit} className="chatList__newIcon" />
            </div>
          </div>

          <div className="chatList__headerSearchBar">
            <div
              className="chatList__headerSearchBack"
              onClick={collapseSearchChat}
            >
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="chatList__headerSearchIcon"
              />
            </div>

            <label
              className="chatList__headerSearch br-10"
              htmlFor="search-chat-input"
              onClick={expandSearchChat}
            >
              <FontAwesomeIcon
                icon={faSearch}
                className="chatList__headerSearchIcon"
              />
              <input
                className="chatList__headerSearchInput"
                type="text"
                name="search-chat-input"
                id="search-chat-input"
                placeholder="Tìm kiếm đoạn chat"
                value={searchChat}
                onChange={updateSearchChat}
              />
            </label>
          </div>

          <div className="chatList__headerOnline">
            {onlineUsers.map((user, index) => (
              <div
                key={index}
                className="chatList__headerOnlineUser"
                onClick={(e) => handleSelectChat(e, user.id)}
              >
                <div
                  className="avatar"
                  style={{
                    backgroundImage: `url(${user.data.profilePicture})`,
                  }}
                />
                <div className="chatList__onlineIcon">
                  <div></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chatList__dropdown">
          {filteredChats.length > 0 &&
            filteredChats.map((user, index) => (
              <div
                key={index}
                className="chatList__searchItem br-10"
                onClick={(e) => handleSelectChat(e, user.id)}
              >
                <div
                  className="avatar"
                  style={{
                    backgroundImage: `url(${user.data.profilePicture})`,
                  }}
                />
                <p className="chatList__searchItemText">{user.data.username}</p>
              </div>
            ))}
        </div>

        <div className="chatList__main">
          {chats.map((item, index) => (
            <div
              key={index}
              className="chatList__chatItemContainer br-10"
              onClick={(e) => handleSelectChat(e, item.id)}
              style={{
                backgroundColor:
                  item.id === selectedChat ? "#eaeef8" : "initial",
              }}
            >
              <ChatItem item={item} />
            </div>
          ))}
        </div>
      </div>
      {selectedChat && (
        <div className="chatContent">
          <ChatContent selectedChat={selectedChat} />
        </div>
      )}
    </div>
  );
}

export default Chat;
