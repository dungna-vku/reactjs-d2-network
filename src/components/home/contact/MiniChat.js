import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  deleteField,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db, storage } from "../../../utils/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faClose,
  faImage,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import "../../../css/home/contact/MiniChat.css";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

function MiniChat({ selected }) {
  const [user, setUser] = useState();
  const [messages, setMessages] = useState();
  const [msgContent, setMsgContent] = useState("");
  const [calling, setCalling] = useState("");
  // const newWindow = useRef(window);

  // Lấy thông tin người đang chat
  useEffect(() => {
    let isSubcribed = true;

    if (selected) {
      onSnapshot(doc(db, `/users/${selected}`), (snapshot) => {
        if (isSubcribed && snapshot) {
          setUser(snapshot.data());
        }
      });
    }
    return () => {
      isSubcribed = false;
    };
  }, [selected]);

  // Lấy danh sách tin nhắn trong đoạn chat
  useEffect(() => {
    let isSubcribed = true;

    onSnapshot(
      query(
        collection(
          db,
          `/users/${auth.currentUser.email}/chats/${selected}/messages`
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
      // console.log("cleanup minichat");
    };
  }, [selected]);

  // Hàm gửi tin nhắn văn bản
  const handleSendMsg = async () => {
    const time = new Date().getTime();

    // Thêm tin nhắn mới vào messages của người gửi
    await addDoc(
      collection(
        db,
        `/users/${auth.currentUser.email}/chats/${selected}/messages`
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
            `/users/${selected}/chats/${auth.currentUser.email}/messages/${docRef.id}`
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
          doc(db, `/users/${auth.currentUser.email}/chats/${selected}`),
          {
            imageURL: false,
            lastMsg: msgContent,
            lastMsgAt: time,
            lastSender: auth.currentUser.uid,
          }
        );

        // Cập nhật lại phần tin nhắn mới nhất của người nhận
        await getDoc(
          doc(db, `/users/${selected}/chats/${auth.currentUser.email}`)
        ).then((snapshot) => {
          updateDoc(
            doc(db, `/users/${selected}/chats/${auth.currentUser.email}`),
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

  // Gửi tin nhắn văn bản khi nhấn Enter
  // useEffect(() => {
  //   const handleEnter = () => {
  //     const content = document.getElementById("message").value;
  //     setMsgContent(content);
  //     handleSendMsg();
  //   };

  //   document.getElementById("message").addEventListener("keyup", (event) => {
  //     if (event.key === "Enter") {
  //       handleEnter();
  //     }
  //   });

  //   return () => {
  //     document
  //       .getElementById("message")
  //       .removeEventListener("keyup", (event) => {
  //         if (event.key === "Enter") {
  //           handleEnter();
  //         }
  //       });
  //   };
  // }, []);

  // Gửi hình ảnh
  const handleSengImg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(
      storage,
      `/users/${auth.currentUser.email}/chats/${selected}/${file.name}`
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
              `/users/${auth.currentUser.email}/chats/${selected}/messages`
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
                  `/users/${selected}/chats/${auth.currentUser.email}/messages/${docRef.id}`
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
                doc(db, `/users/${auth.currentUser.email}/chats/${selected}`),
                {
                  imageURL: true,
                  lastMsg: "",
                  lastMsgAt: time,
                  lastSender: auth.currentUser.uid,
                }
              );

              // Cập nhật lại phần tin nhắn mới nhất của người nhận
              await getDoc(
                doc(db, `/users/${selected}/chats/${auth.currentUser.email}`)
              ).then((snapshot) => {
                updateDoc(
                  doc(db, `/users/${selected}/chats/${auth.currentUser.email}`),
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
    // console.log("Gọi video: chức năng đang phát triển...");

    // Cập nhật trạng thái cuộc gọi đến cho người nhận
    updateDoc(doc(db, `/users/${selected}`), {
      inCall: auth.currentUser.email,
    }).then(() => {
      // Cập nhật trạng thái đang kết nối cho người gửi
      updateDoc(doc(db, `/users/${auth.currentUser.email}`), {
        inCall: "connecting",
      }).then(() => {
        setCalling("connecting");

        // Lắng nghe phản hồi của người dùng
        const unsubcribe = onSnapshot(
          doc(db, `/users/${selected}`),
          (snapshot) => {
            const inCall = snapshot.data().inCall;

            if (inCall === "reject") {
              updateDoc(doc(db, `/users/${selected}`), {
                inCall: deleteField(),
              }).then(() => {
                updateDoc(doc(db, `/users/${auth.currentUser.email}`), {
                  inCall: deleteField(),
                }).then(() => {
                  setCalling("");
                  alert(`${user.username} đã từ chối cuộc gọi`);
                  unsubcribe();
                });
              });
            } else if (
              inCall !== "connecting" &&
              inCall !== auth.currentUser.email
            ) {
              const url = `http://d2-videocall.herokuapp.com/?auth=${auth.currentUser.email}&user=${selected}&id=${inCall}`;
              setCalling(url);
              unsubcribe();
            }
          }
        );
      });
    });
  };

  // Hàm thu nhỏ cửa sổ
  const minimizeChat = async (event) => {
    event.preventDefault();

    await updateDoc(
      doc(db, "users", auth.currentUser.email, "chats", selected),
      {
        inChat: false,
      }
    );

    document.getElementsByClassName("miniChat")[0].style.display = "none";
  };

  // Hàm hiển thị tin nhắn
  const renderItem = (item, index) => {
    // Điều chỉnh kích thước ảnh cho phù hợp
    const imageWidth =
      item.data.imageWidth >= item.data.imageHeight ? 170 : 120;
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
            <div key={index} className="miniChat__rowMsgRight">
              <div
                className="miniChat__msgTimeContainer"
                style={{ alignItems: "flex-end" }}
              >
                {sentDate !== "" && (
                  <span className="miniChat__msgTime">{sentDate}</span>
                )}
                <span className="miniChat__msgTime">{sentTime}</span>
              </div>

              <div className="miniChat__leftMsg">
                <div className="miniChat__missedVideoCall">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="miniChat__videoCallIcon"
                  />
                </div>
                <span className="miniChat__videoCallText">
                  {item.data.content}
                </span>
              </div>
            </div>
          );
        } else {
          // Cuộc gọi nhỡ từ người nhận
          return (
            <div key={index} className="miniChat__rowMsgLeft">
              <div className="miniChat__avatarContainer">
                <div
                  className="miniChat__avatarImage"
                  style={{
                    backgroundImage: `url(${user && user.profilePicture})`,
                  }}
                />
              </div>

              <div className="miniChat__leftMsg">
                <div className="miniChat__missedVideoCall">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="miniChat__videoCallIcon"
                  />
                </div>
                <span className="miniChat__videoCallText">
                  {item.data.content}
                </span>
              </div>

              <div className="miniChat__msgTimeContainer">
                {sentDate !== "" && (
                  <span className="miniChat__msgTime">{sentDate}</span>
                )}
                <span className="miniChat__msgTime">{sentTime}</span>
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
            <div key={index} className="miniChat__rowMsgRight">
              <div
                className="miniChat__msgTimeContainer"
                style={{ alignItems: "flex-end" }}
              >
                {sentDate !== "" && (
                  <span className="miniChat__msgTime">{sentDate}</span>
                )}
                <span className="miniChat__msgTime">{sentTime}</span>
              </div>

              <div className="miniChat__leftMsg">
                <div className="miniChat__acceptedVideoCall">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="miniChat__videoCallIcon"
                  />
                </div>
                <div className="miniChat__acceptedText">
                  <span className="miniChat__videoCallText">
                    {item.data.content}
                  </span>
                  <span className="miniChat__videoCallLength">{length}</span>
                </div>
              </div>
            </div>
          );
        } else {
          // Chat video từ người nhận
          return (
            <div key={index} className="miniChat__rowMsgLeft">
              <div className="miniChat__avatarContainer">
                <div
                  className="miniChat__avatarImage"
                  style={{
                    backgroundImage: `url(${user && user.profilePicture})`,
                  }}
                />
              </div>

              <div className="miniChat__leftMsg">
                <div className="miniChat__acceptedVideoCall">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="miniChat__videoCallIcon"
                  />
                </div>
                <div className="miniChat__acceptedText">
                  <span className="miniChat__videoCallText">
                    {item.data.content}
                  </span>
                  <span className="miniChat__videoCallLength">{length}</span>
                </div>
              </div>

              <div className="miniChat__msgTimeContainer">
                {sentDate !== "" && (
                  <span className="miniChat__msgTime">{sentDate}</span>
                )}
                <span className="miniChat__msgTime">{sentTime}</span>
              </div>
            </div>
          );
        }
      }
    } else {
      // Hiển thị tin nhắn của người nhận
      return item.data.sender !== auth.currentUser.uid ? (
        <div key={index} className="miniChat__rowMsgLeft">
          <div className="miniChat__avatarContainer">
            <div
              className="miniChat__avatarImage"
              style={{
                backgroundImage: `url(${user && user.profilePicture})`,
              }}
            />
          </div>
          {item.data.imageURL !== "" ? (
            <div className="miniChat__leftImage">
              <img
                src={item.data.imageURL}
                alt="Hình ảnh"
                className="miniChat__msgImage"
                style={{
                  width: imageWidth,
                  height: imageHeight,
                }}
              />
            </div>
          ) : (
            <div className="miniChat__leftMsg">
              <p className="miniChat__leftMsgText">{item.data.content}</p>
            </div>
          )}
          <div className="miniChat__msgTimeContainer">
            {sentDate !== "" && (
              <span className="miniChat__msgTime">{sentDate}</span>
            )}
            <span className="miniChat__msgTime">{sentTime}</span>
          </div>
        </div>
      ) : (
        // Hiển thị tin nhắn của người gửi
        <div key={index} className="miniChat__rowMsgRight">
          <div
            className="miniChat__msgTimeContainer"
            style={{ alignItems: "flex-end" }}
          >
            {sentDate !== "" && (
              <span className="miniChat__msgTime">{sentDate}</span>
            )}
            <span className="miniChat__msgTime">{sentTime}</span>
          </div>

          {item.data.imageURL !== "" ? (
            <div className="miniChat__leftImage">
              <img
                src={item.data.imageURL}
                alt="Hình ảnh"
                className="miniChat__msgImage"
                style={{
                  width: imageWidth,
                  height: imageHeight,
                }}
              />
            </div>
          ) : (
            <div className="miniChat__rightMsg">
              <p className="miniChat__rightMsgText">{item.data.content}</p>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="miniChat br-10">
      <div className="miniChat__header">
        <Link to={`/${user?.uid}`} className="miniChat__headerLeft">
          <div className="miniChat__avatar">
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
              <div className="miniChat__onlineIcon">
                <div></div>
              </div>
            )}
          </div>

          <div className="miniChat__headerText">
            <span className="miniChat__username">{user && user.username}</span>

            {user && user.online && (
              <span className="miniChat__onlineStatus">Đang hoạt động</span>
            )}
          </div>
        </Link>

        <div className="miniChat__headerRight">
          <button
            className="miniChat__call"
            disabled={
              (user && user.online && user.inCall) || (user && !user.online)
            }
            onClick={(e) => videoCall(e)}
          >
            <FontAwesomeIcon
              icon={faVideo}
              className="miniChat__headerIcon"
              style={{
                cursor:
                  (user && user.online && user.inCall) || (user && !user.online)
                    ? "initial"
                    : "pointer",
              }}
            />
            {user && user.online && !user.inCall && (
              <div className="miniChat__callEnable"></div>
            )}
          </button>

          <FontAwesomeIcon
            icon={faClose}
            className="miniChat__headerIcon"
            onClick={(e) => minimizeChat(e)}
          />
        </div>
      </div>

      <div className="miniChat__content">
        {messages &&
          messages.map((message, index) => renderItem(message, index))}
      </div>

      <div className="miniChat__sender">
        <label htmlFor="sentImage">
          <FontAwesomeIcon icon={faImage} className="miniChat__senderIcon" />
        </label>
        <input
          style={{ display: "none" }}
          type="file"
          name="sentImage"
          id="sentImage"
          accept="image/*"
          onChange={handleSengImg}
        />

        <div className="miniChat__senderInput">
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
          className="miniChat__senderIcon"
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

      {calling && (
        <div className="miniChat__outgoingCall">
          {calling === "connecting" ? (
            <h4>Đang gọi cho {user?.username}</h4>
          ) : (
            <a
              href={calling}
              target="_blank"
              rel="noreferrer"
              onClick={() => setCalling("")}
            >
              Bắt đầu cuộc gọi
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default MiniChat;
