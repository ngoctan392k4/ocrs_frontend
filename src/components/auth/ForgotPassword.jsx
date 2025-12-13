import React, { useState } from "react";
import "../../styles/Login.css";
import logo from "../../assets/logo/logotruong.png";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [noti, setNoti] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupNoti, setPopupNoti] = useState("");
  const [email, setEmail] = useState(null);
  const navigate = useNavigate();

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // When click close popup => popup close and navigate to main route
  const handleClose = async () => {
    setShowPopup(false);
    navigate("/");
  };

  // Perform after enter email and click Send
  const handleForgot = async (email) => {
    if (!validateEmail(email)) {
      setNoti("Email is incorrect format");
    } else {
      try {
        const response = await fetch(
          "http://localhost:3001/api/auth/forgotPassword",
          {
            credentials: "include",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();

        setPopupNoti(
          "Your request is processed. The password reset instruction will be sent to your email in 5 minutes. If you don't receive any, please try again and make sure the email you entered matches your account email."
        );

        setShowPopup(true);
      } catch (error) {
        setPopupNoti("An error occurred, please try again.");
        setShowPopup(true);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-visual">
          <h2 className="login-welcome">WELCOME TO</h2>
          <img src={logo} alt="School logo" className="login-logo" />
          <h2 className="login-xyz">XYZ UNIVERSITY</h2>
          <p className="login-sub">Reset your password</p>
        </div>

        <div className="login-form">
          <h3 className="form-title">Forgot Password</h3>

          <label className="input-label">
            <span>Email</span>
            <input
              type="email"
              placeholder="Email"
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleForgot(email)}
            />
          </label>

          {noti && <p className="notification">{noti}</p>}

          <div className="form-actions">
            <button className="btn-login" onClick={() => handleForgot(email)}>
              Send
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-container">
          <div className="popup-content">
            <p>{popupNoti}</p>
            <button onClick={handleClose}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
