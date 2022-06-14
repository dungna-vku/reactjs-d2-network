import React from "react";
import "../../../css/home/sidebar/Recommender.css";
import { Link } from "react-router-dom";

const users = [
  {
    uid: "WqGDrx6SpAQiCGq8zNEiDzvUccs1",
    profilePicture:
      "https://firebasestorage.googleapis.com/v0/b/d2-network.appspot.com/o/users%2Fnezuko%40gmail.com%2FprofilePicture%2Fnezuko.jpeg?alt=media&token=029ec1a4-4a30-4157-91e4-2f320a1d4ceb",
    username: "Nezuko",
  },
  {
    uid: "10cpOfWiDfdMPl3UD5bxJDxBQrJ2",
    profilePicture:
      "https://firebasestorage.googleapis.com/v0/b/d2-network.appspot.com/o/users%2Fdoraemon%40gmail.com%2FprofilePicture%2Fdoraemon.jpeg?alt=media&token=8f9a90be-48a5-4794-818f-2d80557f431c",
    username: "Doraemon",
  },
  {
    uid: "TLEHp8vRHpQAkCSPsL1PI5j9EHJ3",
    profilePicture:
      "https://firebasestorage.googleapis.com/v0/b/d2-network.appspot.com/o/default-avatar.png?alt=media&token=a26e761f-deef-4c0c-9219-85331ae59fe8",
    username: "Phước Đại",
  },
];

const Recommender = () => {
  return (
    <div className="recommender">
      <div className="recommender__header">
        <p className="recommender__title">Đề xuất cho bạn</p>
        <a className="recommender__more" href="/">
          Tất cả
        </a>
      </div>
      <div className="recommender__list">
        {users.map((user, index) => (
          <Link to={`/${user.uid}`} key={index} className="recommender__item">
            <div
              className="avatar"
              style={{
                backgroundImage: `url(${user.profilePicture})`,
              }}
            />
            <p className="recommender__item-text">{user.username}</p>
            <button className="recommender__item-button">Theo dõi</button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Recommender;
