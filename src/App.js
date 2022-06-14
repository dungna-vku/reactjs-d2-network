import { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Home from "./screens/Home";
import { auth, db } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import Chat from "./screens/Chat";
import Header from "./components/Header";
import Profile from "./screens/Profile";
import PostDetail from "./screens/PostDetail";
import StoryDetail from "./screens/StoryDetail";

function App() {
  const [currentUser, setCurrentUser] = useState();

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      // Người dùng đăng nhập
      if (user) {
        enableNetwork(db).then(async () => {
          const docRef = doc(db, "users", user.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            updateDoc(docRef, {
              online: true,
            }).then(() =>
              // Cập nhật thông tin người dùng
              onSnapshot(docRef, (snapshot) => {
                setCurrentUser(snapshot.data());
              })
            );
          }
          // console.log("[USER] log in:", user.email);
        });
      } else {
        // Người dùng đăng xuất
        disableNetwork(db).then(() => {
          setCurrentUser();
          // console.log("[USER] not found");
        });
      }
    });
  }, []);

  return (
    <div className="app">
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!currentUser ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!currentUser ? <Register /> : <Navigate to="/" />}
          />
          <Route
            path="/post/:id"
            element={
              currentUser ? (
                <div className="container">
                  <Header currentUser={currentUser} />

                  <div className="main">
                    <PostDetail currentUser={currentUser} />
                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/chat"
            element={
              currentUser ? (
                <div className="container">
                  <Header currentUser={currentUser} />

                  <div className="main">
                    <Chat currentUser={currentUser} />
                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/stories"
            element={
              currentUser ? (
                <StoryDetail currentUser={currentUser} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/:uid"
            element={
              currentUser ? (
                <div className="container">
                  <Header currentUser={currentUser} />

                  <div className="main">
                    <Profile currentUser={currentUser} />
                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            exact
            path="/"
            element={
              !currentUser ? (
                <Login />
              ) : (
                <div className="container">
                  <Header currentUser={currentUser} />

                  <div className="main">
                    <Home currentUser={currentUser} />
                  </div>
                </div>
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
