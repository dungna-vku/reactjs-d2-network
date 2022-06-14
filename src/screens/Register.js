import React, { useState } from "react";
import "../css/Register.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import * as Yup from "yup";
import { Formik } from "formik";
import Validator from "email-validator";
import { Link } from "react-router-dom";
import { auth, db } from "../utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const defaultProfilePicture =
  "https://firebasestorage.googleapis.com/v0/b/d2-network.appspot.com/o/default-avatar.png?alt=media&token=a26e761f-deef-4c0c-9219-85331ae59fe8";

const defaultBackground =
  "https://firebasestorage.googleapis.com/v0/b/d2-network.appspot.com/o/default-background.jpeg?alt=media&token=46da1447-5e6d-41f5-832f-a725d0de6a9b";

// Kiểm tra điều kiện input
const RegisterFormchema = Yup.object().shape({
  email: Yup.string().email().required("Vui lòng nhập email"),
  username: Yup.string()
    .required("Vui lòng nhập tài khoản")
    .min(2, "Tên tài khoản cần có ít nhất 2 ký tự"),
  password: Yup.string()
    .min(6, "Mật khẩu cần có ít nhất 6 kí tự")
    .required("Vui lòng nhập mật khẩu"),
});

function Register() {
  // const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const onRegister = async (email, username, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password).then(
        (data) => {
          setDoc(doc(db, "users", email), {
            uid: data.user.uid,
            username: username,
            profilePicture: defaultProfilePicture,
            background: defaultBackground,
            posts: 0,
            newNotifications: 0,
            biography: "",
            online: false,
            hasStory: false,
            followers: [],
            following: [],
          }).then(() => console.log("[USER] Sign up", email));
        }
      );
    } catch (error) {
      alert("Email đã được sử dụng");
    }
  };

  return (
    <div className="register">
      <h1 className="register__logo">D2 Network</h1>
      <div className="register__container p-15 br-10 shadow">
        <Formik
          initialValues={{ email: "", username: "", password: "" }}
          onSubmit={(values) => {
            onRegister(values.email, values.username, values.password);
          }}
          validationSchema={RegisterFormchema}
          validateOnMount={true}
        >
          {({ handleBlur, handleChange, handleSubmit, values, isValid }) => (
            <>
              <div
                className="register__input br-10"
                style={{
                  borderColor:
                    values.email.length < 1 || Validator.validate(values.email)
                      ? "#CCC"
                      : "red",
                }}
              >
                <input
                  className="p-15"
                  type="email"
                  placeholder="Email"
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                />
              </div>
              <div
                className="register__input br-10"
                style={{
                  borderColor:
                    values.username.length < 1 || values.username.length >= 2
                      ? "#CCC"
                      : "red",
                }}
              >
                <input
                  className="p-15"
                  type="text"
                  placeholder="Tên tài khoản"
                  onChange={handleChange("username")}
                  onBlur={handleBlur("username")}
                  value={values.username}
                />
              </div>
              <div
                className="register__input br-10"
                style={{
                  borderColor:
                    values.password.length < 1 || values.password.length >= 6
                      ? "#CCC"
                      : "red",
                }}
              >
                <input
                  className="p-15"
                  type={passwordShown ? "text" : "password"}
                  placeholder="Mật khẩu"
                  onChange={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                />
                {values.password.length >= 1 && (
                  <FontAwesomeIcon
                    icon={passwordShown ? faEyeSlash : faEye}
                    className="register__show-icon"
                    onClick={togglePasswordVisibility}
                  />
                )}
              </div>

              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                disabled={!isValid}
                className="register__submit-button br-10"
                style={{
                  backgroundColor: !isValid ? "#8af754" : "#59b82a",
                  cursor: !isValid ? "initial" : "pointer",
                }}
              >
                <p className="p-15">Đăng ký</p>
              </button>

              <div className="register__line"></div>

              <button className="register__login-button br-10">
                <Link
                  to="/login"
                  style={{
                    textDecoration: "none",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "16px",
                  }}
                >
                  <p className="p-15">Bạn đã có tài khoản?</p>
                </Link>
              </button>
            </>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Register;
