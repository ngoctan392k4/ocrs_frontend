import React, { useEffect, useState } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import "../../../styles/admin/AccountManagement/AddAccount.css";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

function AddAccount() {
  const navigate = useNavigate();

  const RoleType = ["Admin", "Student", "Instructor"];
  const [selectedRole, setSelectedRole] = useState(RoleType[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mail, setMail] = useState("");
  const [dob, setDob] = useState("");
  const [department, setDepartment] = useState("");

  const [major, setMajor] = useState("");
  const [majorSelections, setMajorSelections] = useState([]);

  const [notiMail, setNotiMail] = useState(null);
  const [notiPhone, setNotiPhone] = useState(null);
  const [noti, setNoti] = useState(null);

  const [popupNoti, setPopupNoti] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [popupNotiError, setPopupNotiError] = useState("");
  const [showPopupError, setShowPopupError] = useState(false);

  const [popupNotiCancel, setPopupNotiCancel] = useState("");
  const [showPopupCancel, setShowPopupCancel] = useState(false);

  const [validInput, setValidInput] = useState(false);

  // Validate email format
  const validateEmail = (mailAdd) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(mailAdd);
  };

  const handleOnchangeMail = (mailAdd) => {
    !validateEmail(mailAdd)
      ? setNotiMail("Email is incorrect format")
      : setNotiMail(null);
  };

  // Validate phone number
  const validatePhone = (phoneNum) => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phoneNum);
  };

  const handleOnchangePhone = (phoneNum) => {
    !validatePhone(phoneNum)
      ? setNotiPhone("Phone number with 10 numbers and start with 0")
      : setNotiPhone(null);
  };

  const fetchInitial = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/student/major`);
      const data = await response.json();

      if (!response.ok) {
        console.log(data.message);
      } else {
        setMajorSelections(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  // Initialize options for major
  const majorOptions = Array.isArray(majorSelections)
    ? majorSelections.map((cur) => ({
        value: cur.curriculum_id,
        label: `${cur.curriculum_id} — ${cur.curriculum_name} - ${cur.total_credits} credits`,
      }))
    : [];

  const handleChangeMajor = (selectedOption) => {
    const val = selectedOption ? selectedOption.value : null;
    setMajor(val);
  };

  const handleAdd = async () => {
    if (!mail || !name || !phone || !dob) {
      setNoti("All fields are required.");
      return;
    }

    if (selectedRole === "Student" && !major) {
      setNoti("All fields are required.");
      return;
    }

    if (selectedRole === "Instructor" && !department) {
      setNoti("All fields are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/addAccount", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          selectedRole,
          name,
          phone,
          mail,
          dob,
          department,
          major,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === "Email exists") {
          setPopupNotiError("Email or username is already existed");
          setShowPopupError(true);
        } else {
          setPopupNotiError("An error occurred, please try again");
          setShowPopupError(true);
        }
      } else {
        setPopupNoti("Successfully add new account");
        setShowPopup(true);
      }
    } catch (error) {
      setPopupNoti("An error occurred, please try again later");
      setShowPopup(true);
    }
  };

  const handleClose = async () => {
    setShowPopup(false);
    navigate("/accountManagement");
  };

  const handleCloseError = async () => {
    setShowPopupError(false);
  };

  const handleCancel = async () => {
    setPopupNotiCancel(
      "Ensure your cancel will discard all your previous changes"
    );
    setShowPopupCancel(true);
  };

  const handleYesCancel = async () => {
    setShowPopupCancel(false);
    navigate("/accountManagement");
  };

  const handleNoCancel = async () => {
    setShowPopupCancel(false);
  };

  const isEmailValid = validateEmail(mail);
  const isPhoneValid = validatePhone(phone);
  const isCommonFilled =
    name !== "" && dob !== "" && mail !== "" && phone !== "";

  let isRoleValid = true;
  if (selectedRole === "Student" && major === "") isRoleValid = false;
  if (selectedRole === "Instructor" && department === "") isRoleValid = false;

  const isFormValid =
    isCommonFilled && isEmailValid && isPhoneValid && isRoleValid;

  return (
    <div className="addAccount-container">
      <Menu menus={menu_admin} />

      <div className="addAccount-content">
        <h1 className="page-title">Add New Account</h1>

        <div className="form-container">
          {/* Account role dropdown */}
          <div className="form-row">
            <label className="form-label">Account Role</label>
            <select
              className="form-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {RoleType.map((role, index) => (
                <option key={index} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Name of user */}
          <div className="form-row">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              placeholder="Name"
              className="form-input"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="form-row">
            <label className="form-label">Email Address</label>
            <input
              type="mail"
              placeholder="Email"
              className="form-input"
              onChange={(e) => {
                setMail(e.target.value);
                handleOnchangeMail(e.target.value);
              }}
            />
          </div>

          {/* Notify if email is not in correct format */}
          {notiMail && <p className="form-error">{notiMail}</p>}

          {/* Phone number */}
          <div className="form-row">
            <label className="form-label">Phone Number</label>
            <input
              type="phone"
              placeholder="Phone Number"
              className="form-input"
              onChange={(e) => {
                setPhone(e.target.value);
                handleOnchangePhone(e.target.value);
              }}
            />
          </div>

          {/* Notify if phone is not in correct format */}
          {notiPhone && <p className="form-error">{notiPhone}</p>}

          {/* DOB */}
          <div className="form-row">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="form-input"
            />
          </div>

          {/* If student, fill in major */}
          {selectedRole === "Student" ? (
            <div className="form-row">
              <label className="form-label">Major</label>
              <Select
                className="form-select-container"
                name="majorID"
                value={majorOptions.find((op) => op.value === major) || null}
                options={majorOptions}
                isClearable
                placeholder="Select Major"
                onChange={(selected) => handleChangeMajor(selected)}
              />
            </div>
          ) : null}

          {/* If instructor, fill in department */}
          {selectedRole === "Instructor" ? (
            <div className="form-row">
              <label className="form-label">Department</label>
              <input
                type="text"
                placeholder="Instructor's Department"
                className="form-input"
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          ) : null}

          {/* Notify if input is null */}
          {noti && <p className="form-error">{noti}</p>}
        </div>

        {/* Button cancel and add */}
        <div className="form-actions">
          <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleAdd}
            disabled={!isFormValid}
          >
            Add Account
          </button>
        </div>

        {/* Popup after clicking add button */}
        {showPopup && (
          <div className="dialog-backdrop">
            <div className="dialog-box">
              <p className="dialog-message">{popupNoti}</p>
              <div className="dialog-actions">
                <button className="btn-success" onClick={handleClose}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* If error */}
        {showPopupError && (
          <div className="dialog-backdrop">
            <div className="dialog-box dialog-error">
              <p className="dialog-message">{popupNotiError}</p>
              <div className="dialog-actions">
                <button className="btn-cancel" onClick={handleCloseError}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Popup after clicking cancel button */}
        {showPopupCancel && (
          <div className="dialog-backdrop">
            <div className="dialog-box">
              <p className="dialog-message">{popupNotiCancel}</p>
              <div className="dialog-actions">
                <button className="btn-cancel" onClick={handleNoCancel}>No</button>
                <button className="btn-primary" onClick={handleYesCancel}>Yes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddAccount;
