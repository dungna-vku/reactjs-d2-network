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

      {/* <Story
        username="Nezuko"
        profilePicture="https://firebasestorage.googleapis.com/v0/b/d2-network.appspot.com/o/users%2Fnezuko%40gmail.com%2FprofilePicture%2Fnezuko.jpeg?alt=media&token=029ec1a4-4a30-4157-91e4-2f320a1d4ceb"
        imageURL="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg"
      />
      <Story
        username="Anna Maria"
        profilePicture="https://firebasestorage.googleapis.com/v0/b/d2-network.appspot.com/o/users%2Fanna%40gmail.com%2FprofilePicture%2Favatar.jpeg?alt=media&token=33f64116-e34f-4c14-8e73-2088320208ff"
        imageURL="https://images.unsplash.com/photo-1526512340740-9217d0159da9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dmVydGljYWx8ZW58MHx8MHx8&w=1000&q=80"
      />
      <Story
        username="Kamado Tanjirou"
        profilePicture="https://firebasestorage.googleapis.com/v0/b/d2-network.appspot.com/o/users%2Ftanjirou%40gmail.com%2FprofilePicture%2Ftanjirou.jpeg?alt=media&token=b909cf52-4956-4b3b-b3e5-e270b9c3b842"
        imageURL="https://helpx.adobe.com/content/dam/help/en/photoshop/how-to/compositing/jcr%3Acontent/main-pars/image/compositing_1408x792.jpg"
      />
      <Story
        username="John Winston"
        profilePicture="https://firebasestorage.googleapis.com/v0/b/d2-network.appspot.com/o/users%2Fjohn%40gmail.com%2FprofilePicture%2Favatar.jpeg?alt=media&token=251288fa-8bb5-473a-9567-04dbf89cd725"
        imageURL="https://www.industrialempathy.com/img/remote/ZiClJf-1920w.jpg"
      /> */}

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
