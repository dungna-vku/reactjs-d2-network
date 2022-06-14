import React, { useEffect, useState } from "react";
import "../../../css/home/feed/Feed.css";
import PostSender from "./PostSender";
import StoryReel from "./StoryReel";
import Post from "./Post";
import {
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "../../../utils/firebase";
import Notification from "./Notification";

function Feed({ currentUser }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const subcribe = onSnapshot(
      query(collectionGroup(db, "posts"), orderBy("createdAt", "desc")),
      (snapshot) => {
        if (currentUser.following) {
          setPosts([]);
          let newPosts = [];

          snapshot.docs.forEach((post) => {
            const data = post.data();
            if (
              currentUser.following.includes(data.userEmail) ||
              data.userEmail === auth.currentUser.email
            ) {
              newPosts.push({
                id: post.id,
                data: data,
              });
            }
          });

          setPosts(newPosts);
        }
      }
    );

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="feed p-15">
      <Notification />
      <StoryReel currentUser={currentUser} />
      <PostSender currentUser={currentUser} />
      {posts?.map((post, index) => (
        <Post currentUser={currentUser} post={post} key={index} />
      ))}
    </div>
  );
}

export default Feed;
