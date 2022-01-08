import React from "react";
import "../../../css/home/sidebar/UserPanel.css";
import { Link } from "react-router-dom";

function UserPanel({ currentUser }) {
  return (
    <Link to={`/${currentUser.uid}`} className="user br-10 p-15 shadow">
      <div
        className="avatar"
        style={{
          backgroundImage: `url(${currentUser && currentUser.profilePicture})`,
        }}
      />
      <div className="user__info">
        <p className="user__name">{currentUser && currentUser.username}</p>
      </div>
    </Link>
  );
}

export default UserPanel;
