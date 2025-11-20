import React, { useState, useContext } from "react";
import logoLogin from "../../assets/logo/logoLogin.gif";
import "../../styles/auth/LoginForm.css";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthSession";
import { Link } from "react-router-dom";

import closed_eye from "../../assets/icon/closed_eye.svg";
import opened_eye from "../../assets/icon/opened_eye.svg";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(false);
  const [noti, setNoti] = useState(null);
  const [openEye, setOpenEye] = useState(false);
  const { loggedIn, setLoggedIn, user, setUser } = useContext(AuthContext);

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      // Process returned data
      const data = await response.json();

      if (!response.ok) {
        if (
          data.message === "Username and Password are required" ||
          data.message === "Missing credentials"
        ) {
          setNoti("Username and Password are required");
        }
        if (
          data.message === "Username Not Found" ||
          data.message === "Incorrect Password"
        ) {
          setNoti("Username or Password is incorrect");
        }
      }

      setLoggedIn(true);
      setUser(data);
    } catch (error) {
      console.log(error);
      setNoti("Lost connection. Try again later");
    }
  };

  return (
    <div className="login-container">
      <div className="infor">
        <img src={logoLogin} alt="XYZ University" />
        <h3>Log into the OCRS</h3>
        <p>XYZ University Portal</p>
      </div>

      <div className="loginCard">
        <p>Username</p>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <p>Password</p>
        <div className="pwd-container">
          <input
            type={openEye ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="toggle-icon" onClick={() => setOpenEye(!openEye)}>
            {openEye ? (
              <img src={opened_eye} alt="Show" width="20" />
            ) : (
              <img src={closed_eye} alt="Hide" width="20" />
            )}
          </span>
        </div>
        {noti && <p className="notification">{noti}</p>}
        <button onClick={() => handleLogin(username, password)}>Log in</button>
        <Link to={"/forgotPassword"} className="forgot">
          Forgot Password?
        </Link>
      </div>
    </div>
  );
}

export default LoginForm;
