import React from "react";
import "../../../css/home/feed/PostSender.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
// import { faGrinBeam } from "@fortawesome/free-regular-svg-icons";

function PostSender({ currentUser }) {
  // Hiện modal
  const handleOpenModal = (e) => {
    e.preventDefault();
    document.getElementsByClassName("modal")[0].style.display = "flex";
  };

  return (
    <>
      <div className="postSender br-10 shadow">
        <div className="postSender__row">
          <div
            className="avatar"
            style={{ backgroundImage: `url(${currentUser.profilePicture})` }}
          />
          <div className="postSender__input br-10" onClick={handleOpenModal}>
            <p>
              {`${currentUser.username.slice(
                0,
                currentUser.username.search(" ")
              )} ơi, bạn đang nghĩ gì thế?`}
            </p>
          </div>
        </div>

        <div className="postSender__row">
          <span className="postSender__button br-10" onClick={handleOpenModal}>
            <FontAwesomeIcon icon={faImage} className="postSender__icon" />
            Chọn ảnh
          </span>
        </div>
      </div>
    </>
  );
}

export default PostSender;
