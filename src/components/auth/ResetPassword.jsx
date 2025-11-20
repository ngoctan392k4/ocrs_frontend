import React, { useState, useEffect } from "react";
import "../../styles/auth/ResetPassword.css";
import logoLogin from "../../assets/logo/logoLogin.gif";
import { Navigate, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import closed_eye from "../../assets/icon/closed_eye.svg";
import opened_eye from "../../assets/icon/opened_eye.svg";

function ResetPassword() {
  const [noti, setNoti] = useState(null);
  const [pwd, setPwd] = useState("");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPopup, setShowPopup] = useState(false);
  const [popupNoti, setPopupNoti] = useState("");

  const [eightChar, setEightChar] = useState(false);
  const [capital, setCapital] = useState(false);
  const [lower, setLower] = useState(false);
  const [symbol, setSymbol] = useState(false);
  const [number, setNumber] = useState(false);

  const [openEye, setOpenEye] = useState(false);

  const navigate = useNavigate();

  const handleClose = async () => {
    setShowPopup(false);
    navigate("/");
  };

  useEffect(() => {
    // 1. Check pwd length
    pwd.length >= 8 ? setEightChar(true) : setEightChar(false);

    // 2. Check capital
    const capitalRegex = /[A-Z]/;
    setCapital(capitalRegex.test(pwd));

    // 3. Check lower
    const lowerRegex = /[a-z]/;
    setLower(lowerRegex.test(pwd));

    // 4. Check number
    const numberRegex = /[0-9]/;
    setNumber(numberRegex.test(pwd));

    // Check symbol
    const symbolRegex = /[^A-Za-z0-9]/;
    setSymbol(symbolRegex.test(pwd));
  }, [pwd]);

  const handleReset = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/resetPassword",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, pwd }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.message === "Invalid URL") {
          setPopupNoti("This resetting password url is invalid");
        } else if (data.message === "Null pwd") {
          setPopupNoti("New password is required");
        } else if (
          data.message === "Token expired" ||
          data.message === "Invalid token"
        ) {
          setPopupNoti("This resetting password url is expired");
        }
      } else {
        if (data.message === "OK") {
          setPopupNoti("Password reset successful");
        }
      }
      setShowPopup(true);
    } catch (error) {
      setPopupNoti("An error occurred, please try again.");
      setShowPopup(true);
    }
  };

  const isPasswordValid = eightChar && capital && lower && number && symbol;

  return (
    <div className="reset-container">
      <div className="infor">
        <img src={logoLogin} alt="XYZ University" />
        <h3>Resetting Password</h3>
        <p>XYZ University Portal</p>
      </div>

      <div className="resetCard">
        <p>New Password</p>
        <div className="input-container">
          <input
            type={openEye ? "text" : "password"}
            placeholder="New password"
            onChange={(e) => setPwd(e.target.value)}
          />
          <span className="toggle-icon" onClick={() => setOpenEye(!openEye)}>
            {openEye ? (
              <img src={opened_eye} alt="Show" width="20" />
            ) : (
              <img src={closed_eye} alt="Hide" width="20" />
            )}
          </span>
        </div>

        <ul className="validate-list">
          <li className={eightChar ? "valid" : "invalid"}>
            📌 At least 8 characters
          </li>
          <li className={capital ? "valid" : "invalid"}>
            📌 Contains capital letters (A-Z)
          </li>
          <li className={lower ? "valid" : "invalid"}>
            📌 Contains lowercase letters
          </li>
          <li className={number ? "valid" : "invalid"}>📌 Contains numbers</li>
          <li className={symbol ? "valid" : "invalid"}>📌 Contains symbols</li>
        </ul>

        {/* If containing nitification => Show it*/}
        {noti && <p className="notification">{noti}</p>}

        {/* Ensure all criteria of pwd are satisfy before clicking button Save */}
        <button
          onClick={handleReset}
          disabled={!isPasswordValid}
          className={isPasswordValid ? "validPwd" : "invalidPwd"}
        >
          Confirm
        </button>
      </div>

      {/* Show Popup after clicking save */}
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

export default ResetPassword;
