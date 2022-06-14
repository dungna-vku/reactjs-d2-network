import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { useParams } from "react-router-dom";
import Post from "../components/home/feed/Post";
import "../css/PostDetail.css";

function PostDetail({ currentUser }) {
  const { id } = useParams();
  const [post, setPost] = useState();

  useEffect(() => {
    const subcribe = onSnapshot(
      doc(db, `/users/${auth.currentUser.email}/posts/${id}`),
      (snapshot) => {
        setPost({
          id: id,
          data: snapshot.data(),
        });
      }
    );

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="postDetail">
      {post && <Post currentUser={currentUser} post={post} />}
    </div>
  );
}

export default PostDetail;
