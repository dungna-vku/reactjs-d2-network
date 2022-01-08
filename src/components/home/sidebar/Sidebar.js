import React from "react";
import "../../../css/home/sidebar/Sidebar.css";
import Menu from "./Menu";
import UserPanel from "./UserPanel";

function Sidebar({ currentUser }) {
  return (
    <div className="sidebar p-15">
      <UserPanel currentUser={currentUser} />
      <Menu />
    </div>
  );
}

export default Sidebar;
