import React, { useState, useEffect } from "react";
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
} from "@fortawesome/free-regular-svg-icons";
import { auth, db } from "../../../utils/firebase";
import {
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  addDoc,
  collection,
  increment,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Comment from "./Comment";

function Post({ currentUser, post }) {
  const [comment, setComment] = useState("");
  const [user, setUser] = useState();
  const authEmail = auth.currentUser.email;

  // Lấy thông tin của người đăng bài
  useEffect(() => {
    const subcribe = onSnapshot(
      doc(db, `/users/${post.data.userEmail}`),
      (snapshot) => {
        setUser(snapshot.data());
      }
    );

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi người dùng thích hoặc bỏ thích bài viết
  const handleLikePost = (e) => {
    e.preventDefault();

    const currentLikeStatus = !post.data.likesByUsers.includes(authEmail);

    updateDoc(doc(db, `/users/${post.data.userEmail}/posts/${post.id}`), {
      likesByUsers: currentLikeStatus
        ? arrayUnion(authEmail)
        : arrayRemove(authEmail),
    }).then(() => {
      // Thông báo đến người dùng được thích bài viết
      if (currentLikeStatus && post.data.userEmail !== authEmail) {
        addDoc(collection(db, `/users/${post.data.userEmail}/notifications`), {
          userEmail: authEmail,
          time: new Date().getTime(),
          type: "like post",
          relatedId: post.id,
          seen: false,
        }).then(() => {
          updateDoc(doc(db, `/users/${post.data.userEmail}`), {
            newNotifications: increment(1),
          });
        });
      }
    });
  };

  // Khi người dùng nhập bình luận
  const handleChangeComment = (e) => {
    e.preventDefault();
    setComment(e.target.value);
  };

  // Gửi bình luận
  const handlePostComment = () => {
    const currentTime = new Date().getTime();

    updateDoc(doc(db, `/users/${post.data.userEmail}/posts/${post.id}`), {
      comments: arrayUnion({
        content: comment,
        email: authEmail,
        time: currentTime,
      }),
    }).then(() => {
      // Thông báo có người bình luận đến người dùng
      if (post.data.userEmail !== authEmail) {
        addDoc(collection(db, `/users/${post.data.userEmail}/notifications`), {
          userEmail: authEmail,
          time: currentTime,
          type: "comment post",
          relatedId: post.id,
          seen: false,
        }).then(() => {
          updateDoc(doc(db, `/users/${post.data.userEmail}`), {
            newNotifications: increment(1),
          });
        });
      }

      setComment("");
    });
  };

  let arr = [],
    date = "";

  if (post?.data) {
    arr = new Date(post.data.createdAt).toLocaleDateString().split("/");
    date = `${arr[1]}/${arr[0]}/${arr[2]}`;
  }

  return (
    <div className="post br-10 p-15 shadow">
      <div className="post__header">
        <Link to={`/${post?.data.userUID}`}>
          <div
            className="avatar"
            style={{ backgroundImage: `url(${user?.profilePicture})` }}
          />
        </Link>

        <div className="post__info">
          <Link to={`/${post?.data.userUID}`} className="post__username">
            {user?.username}
          </Link>
          <p className="post__time">
            {`${new Date(post?.data.createdAt).toLocaleTimeString()}, ${date}`}
          </p>
        </div>

        {/* <div className="post__menu">
          <span>...</span>
        </div> */}
      </div>

      <p className="post__caption">{post?.data.caption}</p>

      {post.data.imageURL !== "" && (
        <div className="post__imageContainer">
          <img
            src={post?.data.imageURL}
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
                post?.data.likesByUsers.includes(authEmail) ? `-active` : ``
              } br-10`}
              onClick={handleLikePost}
            >
              <FontAwesomeIcon
                icon={
                  post?.data.likesByUsers.includes(authEmail)
                    ? fasHeart
                    : faHeart
                }
                className="post__icon"
              />
              <p className="post__likesByUsers">
                {post?.data.likesByUsers.length}
              </p>
            </div>

            <div className="post__iconImageContainer br-10">
              <FontAwesomeIcon icon={faCommentAlt} className="post__icon" />
              <p className="post__likesByUsers">{post?.data.comments.length}</p>
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
              <Comment comment={comment} key={index} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;
