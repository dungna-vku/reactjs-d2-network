import React, { useState, useEffect } from "react";
import "../css/NewPostModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faImage } from "@fortawesome/free-solid-svg-icons";
import { addDoc, collection } from "firebase/firestore";
import { auth, db, storage } from "../utils/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

function NewPostModal({ currentUser }) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState();
  const [imageURL, setImageURL] = useState();

  // Ẩn modal
  const handleCloseModal = (e) => {
    e.preventDefault();
    document.getElementsByClassName("modal")[0].style.display = "none";
  };

  // Hàm thay đổi caption
  const handleChangeCaption = (e) => {
    e.preventDefault();
    setCaption(e.target.value);
  };

  // Hàm thay đổi hình ảnh
  const handleChangeImage = (e) => {
    e.preventDefault();

    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setImageURL(URL.createObjectURL(file));
  };

  // Xoá ảnh cũ khỏi bộ nhớ khi chọn ảnh mới
  useEffect(() => {
    return () => {
      imageURL && URL.revokeObjectURL(imageURL);
    };
  }, [imageURL]);

  //   Xoá ảnh đang chọn
  const handleRemoveImage = () => {
    setImage();
    URL.revokeObjectURL(imageURL);
    setImageURL();
  };

  // Đăng bài viết
  const handleSubmit = async (e) => {
    if (!imageURL) {
      await addDoc(collection(db, `/users/${auth.currentUser.email}/posts`), {
        caption: caption,
        imageURL: "",
        imageWidth: 0,
        imageHeight: 0,
        userUID: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        createdAt: new Date().getTime(),
        likesByUsers: [],
        comments: [],
      });
    } else {
      await uploadBytesResumable(
        ref(storage, `/users/${auth.currentUser.email}/posts/${image.name}`),
        image
      ).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          // Lấy kích thước hình ảnh được upload lên storage
          const img = new Image();
          img.src = url;
          img.onload = () => {
            const width = img.width;
            const height = img.height;
            const time = new Date().getTime();

            addDoc(collection(db, `/users/${auth.currentUser.email}/posts`), {
              caption: caption,
              imageURL: url,
              imageWidth: width,
              imageHeight: height,
              userUID: auth.currentUser.uid,
              userEmail: auth.currentUser.email,
              username: currentUser.username,
              profilePicture: currentUser.profilePicture,
              createdAt: time,
              likesByUsers: [],
              comments: [],
            }).then(() => {
              setCaption("");
              handleRemoveImage();
              handleCloseModal(e);
            });
          };
        });
      });
    }
  };

  return (
    <div className="modal" onClick={handleCloseModal}>
      <div
        className="modal__container br-10 shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header p-15">
          <h1>Tạo bài viết</h1>
          <div className="modal__closeBtn" onClick={handleCloseModal}>
            <FontAwesomeIcon icon={faClose} className="modal__closeIcon" />
          </div>
        </div>

        <div className="modal__body p-15">
          <div className="modal__userInfo">
            <div
              className="avatar"
              style={{ backgroundImage: `url(${currentUser.profilePicture})` }}
            />
            <p className="modal__username">{currentUser.username}</p>
          </div>

          <div className="modal__content">
            <textarea
              name="caption"
              id="caption"
              rows="6"
              onChange={handleChangeCaption}
              value={caption}
              className="modal__textarea"
              placeholder={`${currentUser.username.slice(
                0,
                currentUser.username.search(" ")
              )} ơi, bạn đang nghĩ gì thế?`}
            ></textarea>

            {image && (
              <div className="modal__image">
                <div className="modal__removeImage" onClick={handleRemoveImage}>
                  <FontAwesomeIcon
                    icon={faClose}
                    className="modal__closeIcon"
                  />
                </div>
                <img alt="Hình ảnh" src={imageURL} className="modal__image" />
              </div>
            )}
          </div>

          <div className="modal__button">
            <div className="modal__imagePicker br-10">
              <label htmlFor="myImage">
                <FontAwesomeIcon
                  icon={faImage}
                  className="modal__imagePickerIcon"
                />
                Chọn ảnh
              </label>
              <input
                style={{ display: "none" }}
                type="file"
                name="myImage"
                id="myImage"
                accept="image/*"
                onChange={handleChangeImage}
              />
            </div>
            <button
              disabled={!(image || caption !== "")}
              className="modal__submit br-10"
              style={{
                backgroundColor: image || caption !== "" ? "#1978f2" : "#ddd",
                color: image || caption !== "" ? "white" : "black",
                cursor: image || caption !== "" ? "pointer" : "initial",
              }}
              onClick={handleSubmit}
            >
              Đăng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPostModal;
