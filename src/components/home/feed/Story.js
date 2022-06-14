import React, { useState, useEffect } from "react";
import "../../../css/home/feed/Story.css";
import { db } from "../../../utils/firebase";
import { doc, onSnapshot } from "firebase/firestore";

function Story({ story }) {
  const [user, setUser] = useState();

  useEffect(() => {
    const subcribe = onSnapshot(
      doc(db, `/users/${story.data.email}`),
      (snapshot) => {
        setUser(snapshot.data());
      }
    );

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {story?.data.imageURL !== "" ? (
        <div
          className="story p-15 br-10 shadow"
          style={{ backgroundImage: `url(${story.data.imageURL})` }}
        >
          <div className="story__avatar-container">
            <div
              className="story__avatar"
              style={{ backgroundImage: `url(${user?.profilePicture})` }}
            />
          </div>
          <h4 className="story__username">{user?.username}</h4>
        </div>
      ) : (
        <div className="story-noImage p-15 br-10 shadow">
          <div className="story__avatar-container">
            <div
              className="story__avatar"
              style={{ backgroundImage: `url(${user?.profilePicture})` }}
            />
          </div>
          <p className="story__caption">{story.data.caption}</p>
          <h4 className="story__username">{user?.username}</h4>
        </div>
      )}
    </div>
  );
}

export default Story;
