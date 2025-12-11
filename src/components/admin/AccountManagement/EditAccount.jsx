import React from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/Admin/AccountManagement/EditAccount.css";
import { useEffect, useState } from "react";
import Select from "react-select";

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
  const [majorSelections, setMajorSelections] = useState([]);

  const [noti, setNoti] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [username, setUsername] = useState("");
  const [dobNoti, setDobNoti] = useState(null);

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

    //Added this
    if (!dob) {
      setDobNoti("Date of birth is required.");
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
        <h1 className="page-title">
          Editing Account ID: {accountid} - Role: {role}
        </h1>

        <div className="form-container">
          {loading ? (
            <div>loading...</div>
          ) : error ? (
            <div>{error}</div>
          ) : (
            <div className="detail-rows-account">
              {/* Name input field */}
              <div className="form-row">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email input field */}
              <div className="form-row">
                <label className="form-label">Email</label>
                <input
                  type="text"
                  className="form-input"
                  value={mail}
                  onChange={(e) => {
                    setMail(e.target.value);
                    handleOnchangeMail(e.target.value);
                  }}
                />
              </div>

              {/* Notify if email is not in corrent format */}
              {mailNoti && <p className="form-error">{mailNoti}</p>}

              {/* Status input field */}
              <div className="form-row">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
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
                <div className="form-row">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              )}

              {/* If role is student then display major field */}
              {role === "student" && (
                <div className="form-row">
                  <label className="form-label">Major</label>
                  <Select
                    className="form-select-container"
                    name="majorID"
                    value={
                      majorOptions.find((op) => op.value === major) || null
                    }
                    options={majorOptions}
                    isClearable
                    placeholder="Select Major"
                    onChange={(selected) => handleChangeMajor(selected)}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '6px',
                        border: '1px solid #d9e8f5',
                        borderColor: '#d9e8f5',
                        backgroundColor: 'white',
                        padding: '2px 8px',
                        fontSize: '14px',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#8db3d4' },
                        '&:focus': { borderColor: '#8db3d4' }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#8db3d4' : state.isFocused ? '#f5f7fa' : 'white',
                        color: state.isSelected ? 'white' : '#3a5a7a',
                        cursor: 'pointer'
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: '6px',
                        backgroundColor: 'white'
                      })
                    }}
                  />
                </div>
              )}

              <div className="form-row">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    handleOnchangePhone(e.target.value);
                  }}
                />
              </div>

              {phoneNoti && <p className="form-error">{phoneNoti}</p>}

              <div className="form-row">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={dob ? dob.split("T")[0] : ""}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {dobNoti && <p className="form-error">{dobNoti}</p>}

              {/* Username input field */}
              <div className="form-row form-row-readonly">
                <label className="form-label">Username</label>
                <div className="form-readonly-value">{username}</div>
              </div>

              {/* Buttons */}
              <div className="form-actions">
                {/* Cancel button */}
                <button className="btn-cancel" onClick={handleCancel}>Cancel</button>

                {/* Save Edit button */}
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={!isFormValid}
                >
                  Save Changes
                </button>
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

          {/* Popup after saving successfully */}
          {successDialog && (
            <div className="dialog-backdrop">
              <div className="dialog-box">
                <p className="dialog-message">{successMessage}</p>
                <div className="dialog-actions">
                  <button className="btn-primary" onClick={handleAffirmativeSaveClose}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
