import React, { useState } from "react";
import "../../styles/auth/ForgotPassword.css";
import logoLogin from "../../assets/logo/logoLogin.gif";
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
    <div className="forgot-container">
      <div className="infor">
        <img src={logoLogin} alt="XYZ University" />
        <h3>Resetting Password</h3>
        <p>XYZ University Portal</p>
      </div>

      <div className="ForgotCard">
        <p>Email</p>
        <input
          type="mail"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        {noti && <p className="notification">{noti}</p>}
        <button onClick={() => handleForgot(email)}>Send</button>
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
