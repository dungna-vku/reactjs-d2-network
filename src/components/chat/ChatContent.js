import {
  faImage,
  faPaperPlane,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/chat/ChatContent.css";
import { auth, db, storage } from "../../utils/firebase";
import "../../css/chat/ChatContent.css";

function ChatContent({ selectedChat }) {
  const [user, setUser] = useState();
  const [messages, setMessages] = useState();
  const [msgContent, setMsgContent] = useState("");

  // Lấy thông tin người đang chat
  useEffect(() => {
    let isSubcribed = true;

    if (selectedChat) {
      onSnapshot(doc(db, `/users/${selectedChat}`), (snapshot) => {
        if (isSubcribed && snapshot) {
          setUser(snapshot.data());
        }
      });
    }
    return () => {
      isSubcribed = false;
    };
  }, [selectedChat]);

  // Lấy danh sách tin nhắn trong đoạn chat
  useEffect(() => {
    let isSubcribed = true;

    onSnapshot(
      query(
        collection(
          db,
          `/users/${auth.currentUser.email}/chats/${selectedChat}/messages`
        ),
        orderBy("sentAt", "desc")
      ),
      (snapshot) => {
        if (isSubcribed && snapshot) {
          setMessages(
            snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
          );
        }
      }
    );

    return () => {
      isSubcribed = false;
    };
  }, [selectedChat]);

  // Hàm gửi tin nhắn văn bản
  const handleSendMsg = async () => {
    const time = new Date().getTime();

    // Thêm tin nhắn mới vào messages của người gửi
    await addDoc(
      collection(
        db,
        `/users/${auth.currentUser.email}/chats/${selectedChat}/messages`
      ),
      {
        content: msgContent,
        sender: auth.currentUser.uid,
        sentAt: time,
        imageURL: "",
        imageWidth: 0,
        imageHeight: 0,
      }
    )
      .then(async (docRef) => {
        // Thêm tin nhắn mới vào messages của người nhận
        await setDoc(
          doc(
            db,
            `/users/${selectedChat}/chats/${auth.currentUser.email}/messages/${docRef.id}`
          ),
          {
            content: msgContent,
            sender: auth.currentUser.uid,
            sentAt: time,
            imageURL: "",
            imageWidth: 0,
            imageHeight: 0,
          }
        );

        // Cập nhật lại phần tin nhắn mới nhất của người gửi
        await updateDoc(
          doc(db, `/users/${auth.currentUser.email}/chats/${selectedChat}`),
          {
            imageURL: false,
            lastMsg: msgContent,
            lastMsgAt: time,
            lastSender: auth.currentUser.uid,
          }
        );

        // Cập nhật lại phần tin nhắn mới nhất của người nhận
        await getDoc(
          doc(db, `/users/${selectedChat}/chats/${auth.currentUser.email}`)
        ).then((snapshot) => {
          updateDoc(
            doc(db, `/users/${selectedChat}/chats/${auth.currentUser.email}`),
            {
              imageURL: false,
              lastMsg: msgContent,
              lastMsgAt: time,
              lastSender: auth.currentUser.uid,
              // Nếu người nhận đang trong đoạn chat thì số tin nhắn mới sẽ bằng 0
              newMsg: snapshot.data().inChat ? 0 : snapshot.data().newMsg + 1,
            }
          ).then(() => {
            console.log("Sent a message!");
            setMsgContent("");
          });
        });
      })
      .catch((err) => console.log(err.message));
  };

  // Gửi hình ảnh
  const handleSengImg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(
      storage,
      `/users/${auth.currentUser.email}/chats/${selectedChat}/${file.name}`
    );
    uploadBytesResumable(storageRef, file).then((snapshot) =>
      getDownloadURL(snapshot.ref).then((url) => {
        // Lấy kích thước hình ảnh được upload lên storage
        const img = new Image();
        img.src = url;
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          const time = new Date().getTime();

          // Thêm tin nhắn mới vào messages của người gửi
          addDoc(
            collection(
              db,
              `/users/${auth.currentUser.email}/chats/${selectedChat}/messages`
            ),
            {
              content: "",
              sender: auth.currentUser.uid,
              sentAt: time,
              imageURL: url,
              imageWidth: width,
              imageHeight: height,
            }
          )
            .then(async (docRef) => {
              // Thêm tin nhắn mới vào messages của người nhận
              await setDoc(
                doc(
                  db,
                  `/users/${selectedChat}/chats/${auth.currentUser.email}/messages/${docRef.id}`
                ),
                {
                  content: "",
                  sender: auth.currentUser.uid,
                  sentAt: time,
                  imageURL: url,
                  imageWidth: width,
                  imageHeight: height,
                }
              );

              // Cập nhật lại phần tin nhắn mới nhất của người gửi
              await updateDoc(
                doc(
                  db,
                  `/users/${auth.currentUser.email}/chats/${selectedChat}`
                ),
                {
                  imageURL: true,
                  lastMsg: "",
                  lastMsgAt: time,
                  lastSender: auth.currentUser.uid,
                }
              );

              // Cập nhật lại phần tin nhắn mới nhất của người nhận
              await getDoc(
                doc(
                  db,
                  `/users/${selectedChat}/chats/${auth.currentUser.email}`
                )
              ).then((snapshot) => {
                updateDoc(
                  doc(
                    db,
                    `/users/${selectedChat}/chats/${auth.currentUser.email}`
                  ),
                  {
                    imageURL: true,
                    lastMsg: "",
                    lastMsgAt: time,
                    lastSender: auth.currentUser.uid,
                    // Nếu người nhận đang trong đoạn chat thì số tin nhắn mới sẽ bằng 0
                    newMsg: snapshot.data().inChat
                      ? 0
                      : snapshot.data().newMsg + 1,
                  }
                ).then(() => console.log("Sent an image!"));
              });
            })
            .catch((err) => console.log(err.message));
        };
      })
    );
  };

  // Hàm gọi video
  const videoCall = (event) => {
    event.preventDefault();
    console.log("Video call");
  };

  // Hàm hiển thị tin nhắn
  const renderItem = (item, index) => {
    // Điều chỉnh kích thước ảnh cho phù hợp
    const imageWidth =
      item.data.imageWidth >= item.data.imageHeight ? 240 : 180;
    const imageHeight = Math.round(
      (imageWidth * item.data.imageHeight) / item.data.imageWidth
    );
    // Lấy ra ngày và thời gian của tin nhắn
    const datetime = new Date(item.data.sentAt);
    const newDatetime = new Date();
    const date = datetime.getDate();
    const month = datetime.getMonth() + 1;
    const year = datetime.getFullYear();
    const sentDate =
      date === newDatetime.getDate() &&
      month === newDatetime.getMonth() + 1 &&
      year === newDatetime.getFullYear()
        ? ""
        : `${date}/${month}/${year}`;
    const sentTime = `${datetime.getHours()}:${
      datetime.getMinutes() < 10 ? "0" : ""
    }${datetime.getMinutes()}`;

    // Nếu là tin nhắn cuộc gọi
    if (item.data.type) {
      // Nếu là cuộc gọi nhỡ
      if (item.data.content === "Cuộc gọi nhỡ") {
        // Cuộc gọi nhỡ từ người gửi
        if (item.data.sender === auth.currentUser.uid) {
          return (
            <div key={index} className="chatContent__rowMsgRight">
              <div
                className="chatContent__msgTimeContainer"
                style={{ alignItems: "flex-end" }}
              >
                {sentDate !== "" && (
                  <span className="chatContent__msgTime">{sentDate}</span>
                )}
                <span className="chatContent__msgTime">{sentTime}</span>
              </div>

              <div className="chatContent__leftMsg">
                <div className="chatContent__missedVideoCall">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="chatContent__videoCallIcon"
                  />
                </div>
                <span className="chatContent__videoCallText">
                  {item.data.content}
                </span>
              </div>
            </div>
          );
        } else {
          // Cuộc gọi nhỡ từ người nhận
          return (
            <div key={index} className="chatContent__rowMsgLeft">
              <div className="chatContent__avatarContainer">
                <div
                  className="chatContent__avatarImage"
                  style={{
                    backgroundImage: `url(${user && user.profilePicture})`,
                  }}
                />
              </div>

              <div className="chatContent__leftMsg">
                <div className="chatContent__missedVideoCall">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="chatContent__videoCallIcon"
                  />
                </div>
                <span className="chatContent__videoCallText">
                  {item.data.content}
                </span>
              </div>

              <div className="chatContent__msgTimeContainer">
                {sentDate !== "" && (
                  <span className="chatContent__msgTime">{sentDate}</span>
                )}
                <span className="chatContent__msgTime">{sentTime}</span>
              </div>
            </div>
          );
        }
      } else {
        // Thời lượng cuộc gọi
        const hour = Math.floor(item.data.length / 3600);
        const minute = Math.floor((item.data.length - hour * 3600) / 60);
        const second = item.data.length - hour * 3600 - minute * 60;
        let length;
        if (hour > 0) {
          length =
            hour +
            (hour === 1 ? " hr" : " hrs") +
            minute +
            (minute <= 1 ? " min" : " mins");
        } else if (minute > 0) {
          length = minute + (minute <= 1 ? " min" : " mins");
        } else {
          length = second + (second <= 1 ? " sec" : " secs");
        }

        // Chat video từ người gửi
        if (item.data.sender === auth.currentUser.uid) {
          return (
            <div key={index} className="chatContent__rowMsgRight">
              <div
                className="chatContent__msgTimeContainer"
                style={{ alignItems: "flex-end" }}
              >
                {sentDate !== "" && (
                  <span className="chatContent__msgTime">{sentDate}</span>
                )}
                <span className="chatContent__msgTime">{sentTime}</span>
              </div>

              <div className="chatContent__leftMsg">
                <div className="chatContent__acceptedVideoCall">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="chatContent__videoCallIcon"
                  />
                </div>
                <div className="chatContent__acceptedText">
                  <span className="chatContent__videoCallText">
                    {item.data.content}
                  </span>
                  <span className="chatContent__videoCallLength">{length}</span>
                </div>
              </div>
            </div>
          );
        } else {
          // Chat video từ người nhận
          return (
            <div key={index} className="chatContent__rowMsgLeft">
              <div className="chatContent__avatarContainer">
                <div
                  className="chatContent__avatarImage"
                  style={{
                    backgroundImage: `url(${user && user.profilePicture})`,
                  }}
                />
              </div>

              <div className="chatContent__leftMsg">
                <div className="chatContent__acceptedVideoCall">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="chatContent__videoCallIcon"
                  />
                </div>
                <div className="chatContent__acceptedText">
                  <span className="chatContent__videoCallText">
                    {item.data.content}
                  </span>
                  <span className="chatContent__videoCallLength">{length}</span>
                </div>
              </div>

              <div className="chatContent__msgTimeContainer">
                {sentDate !== "" && (
                  <span className="chatContent__msgTime">{sentDate}</span>
                )}
                <span className="chatContent__msgTime">{sentTime}</span>
              </div>
            </div>
          );
        }
      }
    } else {
      // Hiển thị tin nhắn của người nhận
      return item.data.sender !== auth.currentUser.uid ? (
        <div key={index} className="chatContent__rowMsgLeft">
          <div className="chatContent__avatarContainer">
            <div
              className="chatContent__avatarImage"
              style={{
                backgroundImage: `url(${user && user.profilePicture})`,
              }}
            />
          </div>
          {item.data.imageURL !== "" ? (
            <div className="chatContent__leftImage">
              <img
                src={item.data.imageURL}
                alt="Hình ảnh"
                className="chatContent__msgImage"
                style={{
                  width: imageWidth,
                  height: imageHeight,
                }}
              />
            </div>
          ) : (
            <div className="chatContent__leftMsg">
              <p className="chatContent__leftMsgText">{item.data.content}</p>
            </div>
          )}
          <div className="chatContent__msgTimeContainer">
            {sentDate !== "" && (
              <span className="chatContent__msgTime">{sentDate}</span>
            )}
            <span className="chatContent__msgTime">{sentTime}</span>
          </div>
        </div>
      ) : (
        // Hiển thị tin nhắn của người gửi
        <div key={index} className="chatContent__rowMsgRight">
          <div
            className="chatContent__msgTimeContainer"
            style={{ alignItems: "flex-end" }}
          >
            {sentDate !== "" && (
              <span className="chatContent__msgTime">{sentDate}</span>
            )}
            <span className="chatContent__msgTime">{sentTime}</span>
          </div>

          {item.data.imageURL !== "" ? (
            <div className="chatContent__leftImage">
              <img
                src={item.data.imageURL}
                alt="Hình ảnh"
                className="chatContent__msgImage"
                style={{
                  width: imageWidth,
                  height: imageHeight,
                }}
              />
            </div>
          ) : (
            <div className="chatContent__rightMsg">
              <p className="chatContent__rightMsgText">{item.data.content}</p>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <div className="chatContent__header">
        <Link to="/" className="chatContent__headerLeft">
          <div className="chatContent__avatar">
            <div
              // className={`${
              //   user && user.hasStory ? "avatar-hasStory" : "avatar"
              // }`}
              className="avatar"
              style={{
                backgroundImage: `url(${user && user.profilePicture})`,
              }}
            />
            {user && user.online && (
              <div className="chatContent__onlineIcon">
                <div></div>
              </div>
            )}
          </div>

          <div className="chatContent__headerText">
            <span className="chatContent__username">
              {user && user.username}
            </span>

            {user && user.online && (
              <span className="chatContent__onlineStatus">Đang hoạt động</span>
            )}
          </div>
        </Link>

        <div className="chatContent__headerRight">
          <button
            className="chatContent__call"
            disabled={
              (user && user.online && user.inCall) || (user && !user.online)
            }
            onClick={(e) => videoCall(e)}
          >
            <FontAwesomeIcon
              icon={faVideo}
              className="chatContent__headerIcon"
              style={{
                cursor:
                  (user && user.online && user.inCall) || (user && !user.online)
                    ? "initial"
                    : "pointer",
              }}
            />
            {user && user.online && !user.inCall && (
              <div className="chatContent__callEnable"></div>
            )}
          </button>
        </div>
      </div>

      <div className="chatContent__content">
        {messages &&
          messages.map((message, index) => renderItem(message, index))}
      </div>

      <div className="chatContent__sender">
        <label htmlFor="sentImage1">
          <FontAwesomeIcon icon={faImage} className="chatContent__senderIcon" />
        </label>
        <input
          style={{ display: "none" }}
          type="file"
          name="sentImage1"
          id="sentImage1"
          accept="image/*"
          onChange={handleSengImg}
        />

        <div className="chatContent__senderInput">
          <input
            name="message"
            id="message"
            placeholder="Nhập tin nhắn"
            onChange={(e) => setMsgContent(e.target.value)}
            value={msgContent}
          />
        </div>

        <FontAwesomeIcon
          icon={faPaperPlane}
          className="chatContent__senderIcon"
          disabled={msgContent !== ""}
          style={{
            color: msgContent !== "" ? "#1978f2" : "#888888",
            cursor: msgContent !== "" ? "pointer" : "initial",
          }}
          onClick={(e) => {
            e.preventDefault();
            if (msgContent !== "") handleSendMsg();
          }}
        />
      </div>
    </>
  );
}

export default ChatContent;
