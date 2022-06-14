import React from "react";
import "../../../css/home/sidebar/Sidebar.css";
import Menu from "./Menu";
import Recommender from "./Recommender";
import UserPanel from "./UserPanel";

function Sidebar({ currentUser }) {
  return (
    <div className="sidebar p-15">
      <UserPanel currentUser={currentUser} />
      <Menu />
      <Recommender />
    </div>
  );
}

export default Sidebar;
