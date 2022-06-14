import React, { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db } from "../../../utils/firebase";
import NotifItem from "./NotifItem";
import "../../../css/home/feed/Notification.css";

function Notification() {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    const subcribe = onSnapshot(
      query(
        collection(db, `/users/${auth.currentUser.email}/notifications`),
        orderBy("time", "desc")
      ),
      (snapshot) => {
        setNotifs(
          snapshot.docs.map((doc) => {
            return {
              id: doc.id,
              data: doc.data(),
            };
          })
        );
      }
    );

    return () => {
      subcribe();
    };
  }, []);

  return (
    <div id="notification" className="notification__container br-10">
      <h2 className="notification__header">Thông báo</h2>
      <div className="notification__main">
        {notifs?.map((notif, index) => (
          <NotifItem id={notif.id} data={notif.data} key={index} />
        ))}
      </div>
    </div>
  );
}

export default Notification;
