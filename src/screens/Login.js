import React, { useState } from "react";
import "../css/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import * as Yup from "yup";
import { Formik } from "formik";
import Validator from "email-validator";
import { Link } from "react-router-dom";
import { auth } from "../utils/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
// import { enableNetwork, doc, updateDoc } from "firebase/firestore";

// Kiểm tra điều kiện input
const LoginFormchema = Yup.object().shape({
  email: Yup.string().email().required("Vui lòng nhập email"),
  password: Yup.string()
    .min(6, "Mật khẩu cần có ít nhất 6 kí tự")
    .required("Vui lòng nhập mật khẩu"),
});

function Login() {
  // const navigate = useNavigate("");
  const [passwordShown, setPasswordShown] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const onLogin = (email, password) => {
    signInWithEmailAndPassword(auth, email, password).catch((error) =>
      alert(
        String(error.message).includes("user-not-found")
          ? "Email chưa được đăng ký"
          : "Mật khẩu chưa đúng"
      )
    );
  };

  return (
    <div className="login">
      <h1 className="login__logo">D2 Network</h1>
      <div className="login__container p-15 br-10 shadow">
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={(values) => {
            onLogin(values.email, values.password);
          }}
          validationSchema={LoginFormchema}
          validateOnMount={true}
        >
          {({ handleBlur, handleChange, handleSubmit, values, isValid }) => (
            <>
              <div
                className="login__input br-10"
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
                className="login__input br-10"
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
                    className="login__show-icon"
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
                className="login__submit-button br-10"
                style={{
                  backgroundColor: !isValid ? "#4BA5EC" : "#1978f2",
                  cursor: !isValid ? "initial" : "pointer",
                }}
              >
                <p className="p-15">Đăng nhập</p>
              </button>

              <div className="login__line"></div>

              <button className="login__register-button br-10">
                <Link
                  to="/register"
                  style={{
                    textDecoration: "none",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "16px",
                  }}
                >
                  <p className="p-15">Tạo tài khoản mới</p>
                </Link>
              </button>
            </>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Login;
