import React from "react";
import "../../../css/home/feed/StoryReel.css";
import Story from "./Story";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

function StoryReel() {
  const profilePicture =
    "https://www.pixsy.com/wp-content/uploads/2021/04/ben-sweet-2LowviVHZ-E-unsplash-1.jpeg";

  return (
    <div className="storyReel">
      <div
        className="storyReel__create br-10 p-15 shadow"
        style={{ backgroundImage: `url(${profilePicture})` }}
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

      <Story
        username="AD Nguyen"
        profilePicture="https://www.pixsy.com/wp-content/uploads/2021/04/ben-sweet-2LowviVHZ-E-unsplash-1.jpeg"
        imageURL="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg"
      />
      <Story
        username="John"
        profilePicture="https://thumbor.forbes.com/thumbor/960x0/https%3A%2F%2Fspecials-images.forbesimg.com%2Fimageserve%2F61688aa1d4a8658c3f4d8640%2FAntonio-Juliano%2F0x0.jpg%3Ffit%3Dscale"
        imageURL="https://images.unsplash.com/photo-1526512340740-9217d0159da9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dmVydGljYWx8ZW58MHx8MHx8&w=1000&q=80"
      />
      <Story
        username="Anna"
        profilePicture="https://cf.shopee.vn/file/a85af02cfac7052dba3d450737939463"
        imageURL="https://helpx.adobe.com/content/dam/help/en/photoshop/how-to/compositing/jcr%3Acontent/main-pars/image/compositing_1408x792.jpg"
      />
      <Story
        username="Syndra"
        profilePicture="https://d5nunyagcicgy.cloudfront.net/external_assets/hero_examples/hair_beach_v391182663/original.jpeg"
        imageURL="https://www.industrialempathy.com/img/remote/ZiClJf-1920w.jpg"
      />
      <a className="storyReel__button" href="/">
        <FontAwesomeIcon
          icon={faArrowRight}
          className="storyReel__buttonIcon"
        />
      </a>
    </div>
  );
}

export default StoryReel;
