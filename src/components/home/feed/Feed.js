import React, { useEffect, useState } from "react";
import "../../../css/home/feed/Feed.css";
import PostSender from "./PostSender";
// import StoryReel from "./StoryReel";
import Post from "./Post";
import {
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "../../../utils/firebase";

function Feed({ currentUser }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let isSubcribed = true;

    onSnapshot(
      query(collectionGroup(db, "posts"), orderBy("createdAt", "desc")),
      (snapshot) => {
        if (isSubcribed && currentUser.following) {
          let newPosts = [];

          snapshot.docs.forEach((post) => {
            if (
              currentUser.following.includes(post.data().userEmail) ||
              post.data().userEmail === auth.currentUser.email
            ) {
              newPosts.push({
                id: post.id,
                data: post.data(),
              });
            }
          });

          setPosts(newPosts);
        }
      }
    );

    return () => {
      isSubcribed = false;
    };
  }, [currentUser.following]);

  return (
    <div className="feed p-15">
      {/* <StoryReel /> */}
      <PostSender currentUser={currentUser} />
      {posts &&
        posts.length > 0 &&
        posts.map((post, index) => (
          <Post currentUser={currentUser} post={post} key={index} />
        ))}
    </div>
  );
}

export default Feed;
