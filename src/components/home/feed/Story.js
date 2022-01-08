import React from "react";
import "../../../css/home/feed/Story.css";

function Story({ username, profilePicture, imageURL }) {
  return (
    <div
      className="story p-15 br-10 shadow"
      style={{ backgroundImage: `url(${imageURL})` }}
    >
      <div
        className="avatar-hasStory"
        style={{ backgroundImage: `url(${profilePicture})` }}
      />
      <h4>{username}</h4>
    </div>
  );
}

export default Story;
