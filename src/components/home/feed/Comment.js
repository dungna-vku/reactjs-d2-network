import React, { useState, useEffect } from "react";
import "../../../css/home/feed/Comment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { auth, db } from "../../../utils/firebase";
import { updateDoc, doc, arrayRemove, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";

function Comment({ comment, post }) {
  const [user, setUser] = useState();

  // Lấy thông tin của người bình luận
  useEffect(() => {
    const subcribe = onSnapshot(
      doc(db, `/users/${comment.email}`),
      (snapshot) => {
        setUser(snapshot.data());
      }
    );

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xoá bình luận của mình
  const handleDeleteComment = async () => {
    await updateDoc(doc(db, `/users/${post.data.userEmail}/posts/${post.id}`), {
      comments: arrayRemove({
        content: comment.content,
        email: comment.email,
        time: comment.time,
      }),
    });
  };

  return (
    <div className="post__commentItem">
      <Link to={`/${user?.uid}`}>
        <div
          className="avatar"
          style={{
            backgroundImage: `url(${user?.profilePicture})`,
            alignSelf: "flex-start",
          }}
        />
      </Link>

      <div className="post__commentItemContent br-10">
        <Link to={`/${user?.uid}`}>{user?.username}</Link>
        <p>{comment.content}</p>
      </div>

      <div
        className="post__comment-icon"
        style={{
          visibility: `${
            comment.email === auth.currentUser.email ? "visible" : "hidden"
          }`,
        }}
        onClick={(e) => {
          e.preventDefault();
          handleDeleteComment();
        }}
      >
        <FontAwesomeIcon icon={faTrashAlt} className="post__comment-delete" />
      </div>
    </div>
  );
}

export default Comment;
