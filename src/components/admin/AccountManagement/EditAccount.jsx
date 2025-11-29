import React from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/Admin/AccountManagement/EditAccount.css";
import { useEffect, useState } from "react";

export default function EditAccount() {
  const navigate = useNavigate();
  const { accountid } = useParams();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const StatusType = ["active", "inactive"];
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mail, setMail] = useState("");
  const [dob, setDob] = useState("");
  const [department, setDepartment] = useState("");
  const [mailNoti, setMailNoti] = useState(null);
  const [phoneNoti, setPhoneNoti] = useState(null);
  const [major, setMajor] = useState("");
  const [noti, setNoti] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [username, setUsername] = useState("");

  const [popupNoti, setPopupNoti] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [popupNotiError, setPopupNotiError] = useState("");
  const [showPopupError, setShowPopupError] = useState(false);

  const [popupNotiCancel, setPopupNotiCancel] = useState("");
  const [showPopupCancel, setShowPopupCancel] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [validInput, setValidInput] = useState(false);

  // Validate email format
  const validateEmail = (mailAdd) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(mailAdd);
  };

  const handleOnchangeMail = (mailAdd) => {
    !validateEmail(mailAdd)
      ? setMailNoti("Email is incorrect format")
      : setMailNoti(null);
  };

  // Validate phone number
  const validatePhone = (phoneNum) => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phoneNum);
  };

  const handleOnchangePhone = (phoneNum) => {
    !validatePhone(phoneNum)
      ? setPhoneNoti("Phone number with 10 numbers and start with 0")
      : setPhoneNoti(null);
  };

  const handleSave = async () => {
    if (!mail || !name || !phone) {
      setNoti("All fields are required.");
      return;
    }

    if (role === "student" && !major) {
      setNoti("All fields are required.");
      return;
    }

    if (role === "instructor" && !department) {
      setNoti("All fields are required.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3001/api/admin/AccountManagement/edit/${accountid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            mail,
            phone,
            dob,
            role,
            selectedStatus,
            department,
            major,
            name,
            accountid,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setPopupNotiError(data.message);
        setShowPopupError(true);
      } else {
        setSuccessMessage("Successfully edited the account");
        setSuccessDialog(true);
      }
    } catch (e) {
      setPopupNoti(`Error: ${e}`);
      setShowPopup(true);
    }
  };

  const handleCloseError = async () => {
    setShowPopupError(false);
  };

  const handleAffirmativeSaveClose = async () => {
    setShowPopup(false);
    navigate("/accountManagement");
  };

  const handleCancel = async () => {
    setPopupNotiCancel("Are you sure? All changes will be lost.");
    setShowPopupCancel(true);
  };

  const handleYesCancel = async () => {
    setShowPopupCancel(false);
    navigate("/accountManagement");
  };

  const handleNoCancel = async () => {
    setShowPopupCancel(false);
  };

  const isCommonFilled = name !== "" && mail !== "" && phone !== "";

  const isEmailValid = validateEmail(mail);

  const isPhoneValid = validatePhone(phone);

  const isFormValid = isCommonFilled && isEmailValid && isPhoneValid;

  //fetch data and update on accountid
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/admin/AccountManagement/edit/${accountid}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch account");
        }

        const data = await res.json();

        if (data && Object.keys(data).length !== 0) {
          // Set all data fields to pre-edit state
          setName(data?.full_name);
          setMail(data?.email);
          setMajor(data?.major);
          setDepartment(data?.department);
          setSelectedStatus(data?.status);
          setUsername(data?.username);
          setPhone(data?.phone_number);
          setRole(data?.role);
          setDob(data?.dob);
        }
      } catch (e) {
        console.log(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (accountid) {
      fetchAccountData();
    }
  }, [accountid]);

  return (
    <div className="edit-account-container">
      <Menu menus={menu_admin} />

      <div className="edit-account-content">
        <h1 className="edit-account-title">
          Editing Account ID: {accountid} - Role: {role}
        </h1>

        <div className="edit-form">
          {loading ? (
            <div>loading...</div>
          ) : error ? (
            <div>{error}</div>
          ) : (
            <div className="detail-rows-account">
              {/* Name input field */}
              <div className="detail-row-account">
                <span> Name </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email input field */}
              <div className="detail-row-account">
                <span> Email: </span>
                <input
                  type="text"
                  value={mail}
                  onChange={(e) => {
                    setMail(e.target.value);
                    handleOnchangeMail(e.target.value);
                  }}
                />
              </div>

              {/* Notify if email is not in corrent format */}
              {mailNoti && <p className="notification">{mailNoti}</p>}

              {/* Status input field */}
              <div className="detail-row-account">
                <span> Status: </span>
                <select
                  className="status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {StatusType.map((status, index) => (
                    <option key={index} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* If role is instructor then display department field */}
              {role === "instructor" && (
                <div className="detail-row-account">
                  <span> Department: </span>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              )}

              {/* If role is student then display major field */}
              {role === "student" && (
                <div className="detail-row-account">
                  <span> Major: </span>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              )}

              <div className="detail-row-account">
                <span> Phone Number: </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    handleOnchangePhone(e.target.value);
                  }}
                />
              </div>

              {phoneNoti && <p className="notification">{phoneNoti}</p>}

              <div className="detail-row-account">
                <span> Date of birth: </span>
                <input
                  type="date"
                  value={dob ? dob.split("T")[0] : ""}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Username input field */}
              <div className="detail-row-account">
                <span> Username: </span>
                <span> {username} </span>
              </div>

              {/* Buttons */}
              <div className="button-container">
                {/* Cancel button */}
                <button onClick={handleCancel}>Cancel</button>

                {/* Save Edit button */}
                <button
                  onClick={handleSave}
                  disabled={!isFormValid}
                  className={isFormValid ? "valid" : "invalid"}
                >
                  Save Edit
                </button>
              </div>
            </div>
          )}

          {/* If error */}
          {showPopupError && (
            <div className="popup-container">
              <div className="popup-content">
                <p>{popupNotiError}</p>
                <button onClick={handleCloseError}>Close</button>
              </div>
            </div>
          )}

          {/* Popup after clicking cancel button */}
          {showPopupCancel && (
            <div className="popup-container">
              <div className="popup-content">
                <p>{popupNotiCancel}</p>
                <div>
                  <button onClick={handleNoCancel}>No</button>
                  <button onClick={handleYesCancel}>Yes</button>
                </div>
              </div>
            </div>
          )}

          {/* Popup after saving successfully */}
          {successDialog && (
            <div className="popup-container">
              <div className="popup-content">
                <p>{successMessage}</p>
                <div>
                  <button onClick={handleAffirmativeSaveClose}>Yes</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
