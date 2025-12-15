import React, { useState, useContext } from "react";
import "../../styles/Login.css";
import logo from "../../assets/logo/logotruong.png";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthSession";
import closed_eye from "../../assets/icon/closed_eye.svg";
import opened_eye from "../../assets/icon/opened_eye.svg";

export default function Login() {
  const { setLoggedIn, setUser } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [noti, setNoti] = useState(null);
  const [openEye, setOpenEye] = useState(false);

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (
          data.message === "Username and Password are required" ||
          data.message === "Missing credentials"
        ) {
          setNoti("Username and Password are required");
        } else if (
          data.message === "Username Not Found" ||
          data.message === "Incorrect Password"
        ) {
          setNoti("Username or Password is incorrect");
        } else if (data.message === "Inactive account") {
          setNoti("Your account is inactivated. Please contact admin.");
        }
        return;
      }

      setLoggedIn(true);
      setUser(data);
      // redirect based on role handled by HomeLogin
    } catch (error) {
      console.error(error);
      setNoti("Lost connection. Try again later");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-visual">
          <h2 className="login-welcome"> WELCOME TO</h2>
          <img src={logo} alt="School logo" className="login-logo" />
          <div className="wave" />
          <h2 className="login-xyz">XYZ UNIVERSITY</h2>
          <p className="login-sub">Sign in to access your account</p>
        </div>

        <div className="login-form">
          <h3 className="form-title">User Login</h3>

          <label className="input-label">
            <span>Username</span>
            <input
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin(username, password)}
              placeholder="Username"
            />
          </label>

          <label className="input-label">
            <span>Password</span>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={openEye ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin(username, password)}
                placeholder="Password"
              />
              <span
                className="toggle-icon"
                onClick={() => setOpenEye(!openEye)}
              >
                {openEye ? (
                  <img src={opened_eye} alt="Show" width="20" />
                ) : (
                  <img src={closed_eye} alt="Hide" width="20" />
                )}
              </span>
            </div>
          </label>

          {noti && (
            <p className="notification" style={{ marginBottom: 10 }}>
              {noti}
            </p>
          )}

          <div className="form-actions">
            <button
              className="btn-login"
              onClick={() => handleLogin(username, password)}
            >
              Login
            </button>
          </div>
          <div className="forgot-link">
            <Link to="/forgotPassword">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
