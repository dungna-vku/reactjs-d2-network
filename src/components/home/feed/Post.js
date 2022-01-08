import React, { useState } from "react";
import "../../../css/home/feed/Post.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as fasHeart,
  faCommentAlt as fasCommentAlt,
  // faBookmark as fasBookmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  faHeart,
  faCommentAlt,
  // faBookmark,
  faTrashAlt,
} from "@fortawesome/free-regular-svg-icons";
import { auth, db } from "../../../utils/firebase";
import { updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Link } from "react-router-dom";

function Post({ currentUser, post }) {
  const [comment, setComment] = useState("");

  // Khi người dùng thích hoặc bỏ thích bài viết
  const handleLikePost = (e) => {
    e.preventDefault();

    const currentLikeStatus = !post.data.likesByUsers.includes(
      auth.currentUser.email
    );

    updateDoc(doc(db, `/users/${post.data.userEmail}/posts/${post.id}`), {
      likesByUsers: currentLikeStatus
        ? arrayUnion(auth.currentUser.email)
        : arrayRemove(auth.currentUser.email),
    });
  };

  // Khi người dùng nhập bình luận
  const handleChangeComment = (e) => {
    e.preventDefault();
    setComment(e.target.value);
  };

  // Gửi bình luận
  const handlePostComment = () => {
    updateDoc(doc(db, `/users/${post.data.userEmail}/posts/${post.id}`), {
      comments: arrayUnion({
        profilePicture: currentUser.profilePicture,
        username: currentUser.username,
        content: comment,
        email: auth.currentUser.email,
        uid: auth.currentUser.uid,
      }),
    }).then(() => setComment(""));
  };

  // Xoá bình luận của mình
  const handleDeleteComment = (comment) => {
    updateDoc(doc(db, `/users/${post.data.userEmail}/posts/${post.id}`), {
      comments: arrayRemove({
        profilePicture: comment.profilePicture,
        username: comment.username,
        content: comment.content,
        email: comment.email,
        uid: comment.uid,
      }),
    });
  };

  return (
    <div className="post br-10 p-15 shadow">
      <div className="post__header">
        <Link to={`/${post.data.userUID}`}>
          <div
            className="avatar"
            style={{ backgroundImage: `url(${post.data.profilePicture})` }}
          />
        </Link>

        <div className="post__info">
          <Link to={`/${post.data.userUID}`} className="post__username">
            {post.data.username}
          </Link>
          <p className="post__time">
            {new Date(post.data.createdAt).toLocaleString()}
          </p>
        </div>

        {/* <div className="post__menu">
          <span>...</span>
        </div> */}
      </div>

      <p className="post__caption">{post.data.caption}</p>

      {post.data.imageURL !== "" && (
        <div className="post__imageContainer">
          <img
            src={post.data.imageURL}
            alt="Ảnh bài viết"
            className="post__image br-10"
          />
        </div>
      )}

      <div className="post__footer">
        <div className="post__iconPanel">
          <div className="post__leftIcon">
            <div
              className={`post__iconImageContainer${
                post.data.likesByUsers.includes(auth.currentUser.email)
                  ? `-active`
                  : ``
              } br-10`}
              onClick={handleLikePost}
            >
              <FontAwesomeIcon
                icon={
                  post.data.likesByUsers.includes(auth.currentUser.email)
                    ? fasHeart
                    : faHeart
                }
                className="post__icon"
              />
              <p className="post__likesByUsers">
                {post.data.likesByUsers.length}
              </p>
            </div>

            <div className="post__iconImageContainer br-10">
              <FontAwesomeIcon icon={faCommentAlt} className="post__icon" />
              <p className="post__likesByUsers">{post.data.comments.length}</p>
            </div>
          </div>

          {/* <div className="post__iconLastContainer br-10">
            {}
            <FontAwesomeIcon
              icon={post.data.isSaved ? fasBookmark : faBookmark}
              className="post__icon"
              style={{ color: `${post.data.isSaved ? "#1978f2" : "gray"}` }}
            />
          </div> */}
        </div>

        <div className="post__commentContainer">
          <div className="post__commentHeader">
            <div
              className="avatar"
              style={{
                backgroundImage: `url(${currentUser.profilePicture})`,
              }}
            />

            <label
              className="post__commentSender br-10"
              htmlFor="comment-input"
            >
              <input
                value={comment}
                onChange={handleChangeComment}
                type="text"
                name="comment-input"
                id="comment-input"
                placeholder="Viết bình luận của bạn"
              />
            </label>

            <FontAwesomeIcon
              icon={fasCommentAlt}
              className="post__commentSenderIcon"
              style={{
                color: comment !== "" ? "#1987f2" : "#888",
                cursor: comment !== "" ? "pointer" : "initial",
              }}
              onClick={(e) => {
                e.preventDefault();
                if (comment !== "") handlePostComment();
              }}
            />
          </div>

          <div className="post__commentMain">
            {post.data.comments.map((comment, index) => (
              <div key={index} className="post__commentItem">
                <Link to={`/${comment.uid}`}>
                  <div
                    className="avatar"
                    style={{
                      backgroundImage: `url(${comment.profilePicture})`,
                      alignSelf: "flex-start",
                    }}
                  />
                </Link>
                <div className="post__commentItemContent br-10">
                  <Link to={`/${comment.uid}`}>{comment.username}</Link>
                  <p>{comment.content}</p>
                </div>

                <div
                  className="post__comment-icon"
                  style={{
                    visibility: `${
                      comment.email === auth.currentUser.email
                        ? "visible"
                        : "hidden"
                    }`,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteComment(comment);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faTrashAlt}
                    className="post__comment-delete"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;
