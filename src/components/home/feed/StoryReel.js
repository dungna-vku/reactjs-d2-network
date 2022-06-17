import React, { useState, useEffect } from "react";
import "../../../css/home/feed/StoryReel.css";
import Story from "./Story";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { auth, db } from "../../../utils/firebase";
import { faArrowRight, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import {
  collectionGroup,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Link } from "react-router-dom";

function StoryReel({ currentUser }) {
  const [user, setUser] = useState("");
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const subcribe = onSnapshot(
      doc(db, `/users/${auth.currentUser.email}`),
      (snapshot) => setUser(snapshot.data())
    );

    return () => {
      subcribe();
    };
  }, []);

  // Lấy danh sách tin
  useEffect(() => {
    const subcribe = onSnapshot(
      query(
        collectionGroup(db, "stories"),
        orderBy("createdAt", "desc"),
        limit(4)
      ),
      (snapshot) => {
        if (currentUser?.following) {
          setStories([]);

          let newStories = [];

          snapshot.docs.forEach((story) => {
            const data = story.data();

            if (
              currentUser.following.includes(data.email) ||
              data.email === auth.currentUser.email
            ) {
              newStories.push({
                id: story.id,
                data: data,
              });
            }
          });

          setStories(newStories);
        }
      }
    );

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hiện modal
  const handleOpenModal = (e) => {
    e.preventDefault();
    document.getElementsByClassName("modal")[0].style.display = "flex";
  };

  return (
    <div className="storyReel">
      <div
        className="storyReel__create br-10 p-15 shadow"
        style={{ backgroundImage: `url(${user?.profilePicture})` }}
        onClick={handleOpenModal}
      >
        <div className="storyReel__create-bottom">
          <div className="storyReel__createButton">
            <FontAwesomeIcon
              icon={faPlusCircle}
              className="storyReel__createIcon"
            />
          </div>

          <span>Tạo tin</span>
        </div>
      </div>

      {stories?.map((story, index) => (
        <Link className="storyContainer" to={"/stories"} key={index}>
          <Story story={story} />
        </Link>
      ))}

      {stories?.length >= 4 && (
        <Link className="storyReel__button" to={"/stories"}>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="storyReel__buttonIcon"
          />
        </Link>
      )}
    </div>
  );
}

export default StoryReel;
