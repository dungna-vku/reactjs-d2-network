import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import "../css/IncomingCall.css";

function IncomingCall({ incomingUser, url }) {
  const [user, setUser] = useState();

  useEffect(() => {
    const subcribe = onSnapshot(
      doc(db, `/users/${incomingUser}`),
      (snapshot) => {
        setUser(snapshot.data());
      }
    );

    return () => {
      subcribe();
    };
  }, [incomingUser]);

  const reject = () => {
    updateDoc(doc(db, `/users/${auth.currentUser.email}`), {
      inCall: "reject",
    });
  };

  return (
    <div className="incomingCall">
      <div className="incomingCall__container">
        <div
          className="avatar"
          style={{ backgroundImage: `url(${user?.profilePicture})` }}
        />

        <div className="incomingCall__content">
          <p>
            Bạn có muốn nhận cuộc gọi từ <span>{user?.username}</span> không?
          </p>

          <div className="incomingCall__button">
            <button className="incomingCall__reject" onClick={reject}>
              Từ chối
            </button>

            <a
              target={"_blank"}
              className="incomingCall__accept"
              href={url}
              rel="noreferrer"
            >
              Đồng ý
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;
