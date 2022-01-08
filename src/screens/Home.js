import "../css/home/Home.css";
import Sidebar from "../components/home/sidebar/Sidebar";
import Feed from "../components/home/feed/Feed";
import Contact from "../components/home/contact/Contact";

function Home({ currentUser }) {
  return (
    <div className="home">
      <Sidebar currentUser={currentUser} />
      <Feed currentUser={currentUser} />
      <Contact currentUser={currentUser} />
    </div>
  );
}

export default Home;
