import React, { use, useEffect, useState } from "react";
import "../../../styles/student/ClassRegistration.css";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import renderCourseDetail from "./CourseDetail";

function ClassRegistration() {
  const [semester, setSemester] = useState(null);
  const [openRegistration, setOpenRegistration] = useState("not-opened-regis");

  const [backupCourses_1, setBackupCourses_1] = useState([]);
  const [backupCourses_2, setBackupCourses_2] = useState([]);

  const [registeredClass, setRegisteredClass] = useState(null);
  const [selectedBU1, setSelectedBU1] = useState(null);
  const [selectedBU2, setSelectedBU2] = useState(null);

  const [disabledConfirm, setDisabledConfirm] = useState(false);

  const [errorClass, setErrorClass] = useState("");

  const [popupNotiCancel, setPopupNotiCancel] = useState("");
  const [showPopupCancel, setShowPopupCancel] = useState(false);

  const [popupNoti, setPopupNoti] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [popupNotiSuccess, setPopupNotiSuccess] = useState("");
  const [showPopupSuccess, setShowPopupSuccess] = useState(false);

  const navigate = useNavigate();


  // Initialize data for route
  const fetchInitial = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/student/classRegiter/sem`
      );
      const data = await response.json();

      if (data.latest_sem?.length > 0) {
        const sem = data.latest_sem[0];
        setSemester(sem);
      }

      if (data.message) {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  // Load pages based on status of registration time
  useEffect(() => {
    if (!semester || !semester.start_date) return;

    // Allows student to register classes before starting semester for 14 days
    const isRegistrationOpen = () => {
      const today = new Date();
      const end_regis = new Date(semester.start_date);

      const start_regis = new Date(semester.start_date);
      start_regis.setDate(start_regis.getDate() - 14);

      today.setHours(0, 0, 0, 0);
      end_regis.setHours(0, 0, 0, 0);
      start_regis.setHours(0, 0, 0, 0);

      if (today <= end_regis &&  today >= start_regis) {
        setOpenRegistration("open");
      } else if (today > end_regis) {
        setOpenRegistration("closed");
      } else if(today < start_regis) {
        setOpenRegistration("not-opened-regis");
      }
    };

    isRegistrationOpen();
  }, [semester]);


  // Fetch course BU
  const fetchDataBU_1 = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/student/classRegiter/backup1?classcode=${registeredClass}&semester=${semester.semid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();

      setBackupCourses_1(data.bu1_courses || []);
    } catch (error) {
      console.log(error);
      setBackupCourses_1([]);
    }
  };

  const fetchDataBU_2 = async (bu1value) => {
    if (!bu1value) {
      setBackupCourses_2([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/student/classRegiter/backup2?classcode=${registeredClass}&semester=${semester.semid}&bu1=${bu1value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();

      setBackupCourses_2(data.bu2_courses || []);
    } catch (error) {
      console.log(error);
      setBackupCourses_2([]);
    }
  };


  // Perform when confirm registering a class
  const handleConfirmClass = async (classID, semID) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/student/classRegiter/confirmClass`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ classID, semID }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        if (data.message === "Not satified") {
          setErrorClass(
            `You need complete course ${data.preqs[0]?.get_preq} before registering ${registeredClass}`
          );
        } else if (data.message === "Not exist") {
          setErrorClass(`The class ${registeredClass} is unavailable`);
        } else if (data.message === "Conflict") {
          setErrorClass(
            `The class ${registeredClass} has conflict schedule with ${data.conflict_course}`
          );
        } else if (data.message === "Class full"){
          setErrorClass(`The class ${registeredClass} is full ${data.registered_num}/${data.capacity}`);
        } else {
          setErrorClass(data.message);
        }
      } else {
        setErrorClass("");
        setDisabledConfirm(true);
        fetchDataBU_1();
        console.log("OKE");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle select option for BU1 and BU2
  const handleChangeBU1 = (selectedOption) => {
    const val = selectedOption ? selectedOption.value : null;

    setSelectedBU1(val);
    setSelectedBU2(null);
    setBackupCourses_2([]);

    fetchDataBU_2(val);
  };

  const handleChangeBU2 = (selectedOption) => {
    const val = selectedOption ? selectedOption.value : null;
    setSelectedBU2(val);
  };

  // Perform when confirming to register class and 2 BU courses
  const handleRegister = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/student/classRegiter/register",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registeredClass: registeredClass,
            semid: semester.semid,
            selectedBU1: selectedBU1,
            selectedBU2: selectedBU2,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.log(data.message);
        setPopupNoti(data.message || "An error occurred, please try again");
        setShowPopup(true);
      } else {
        setPopupNotiSuccess("Register Successfully");
        setBackupCourses_1([]);
        setBackupCourses_2([]);
        setDisabledConfirm(false);
        setRegisteredClass(null);
        setSelectedBU1(null);
        setSelectedBU2(null);
        setShowPopupSuccess(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle popup operations
  const handleClose = async () => {
    setShowPopup(false);
    navigate("/homepageStudent");
  };

  const handleCloseSuccess = async () => {
    setShowPopupSuccess(false);
  };

  const handleCancel = async () => {
    setPopupNotiCancel(
      "Ensure your cancel will discard all your registration process"
    );
    setShowPopupCancel(true);
  };

  const handleYesCancel = async () => {
    setShowPopupCancel(false);
    navigate("/homepageStudent");
  };

  const handleNoCancel = async () => {
    setShowPopupCancel(false);
  };


  // Initialize options for BU1 and BU2
  const bu1CourseOptions = Array.isArray(backupCourses_1)
    ? backupCourses_1.map((c) => ({
        value: c.courseid,
        label: `${c.courseid} — ${c.coursename}`,
      }))
    : [];

  const bu2CourseOptions = Array.isArray(backupCourses_2)
    ? backupCourses_2.map((c) => ({
        value: c.courseid,
        label: `${c.courseid} — ${c.coursename}`,
      }))
    : [];

  // Get all information of selected BU1/ BU2 to display for checking
  const selectedCourseObject1 = backupCourses_1.find(
    (c) => c.courseid === selectedBU1
  );

  const selectedCourseObject2 = backupCourses_2.find(
    (c) => c.courseid === selectedBU2
  );

  // If valid form => user can click register button
  const isRegisterValid =
    selectedBU1 !== null && selectedBU2 !== null && registeredClass !== null;

  return (
    <div className="classReigstration-container">
      <Menu menus={menu_student} />
      <div className="classReigstration-content">
        <h1>
          Class Registration for
          {semester && ` ${semester.semester_name} - ${semester.school_year}`}
        </h1>

        {openRegistration === "not-opened-regis" ? ( // The registration timeline has not started yet
          <div className="not-opened-regis">
            <h3>
              Class Registration for
              {semester &&
                ` ${semester.semester_name} - ${semester.school_year}`}{" "}
              has not opened yet
            </h3>
          </div>
        ) : openRegistration === "closed" ? ( // The registration timeline has closed
          <div className="closed-regis">
            <h3>
              Class Registration for
              {semester &&
                ` ${semester.semester_name} - ${semester.school_year}`}{" "}
              has expired
            </h3>
          </div>
        ) : ( // The registration timeline has started and in the timeline
          <>
            <div className="register-class">
              <input
                type="text"
                value={registeredClass || ""}
                placeholder="Class Code"
                disabled={disabledConfirm}
                onChange={(e) => setRegisteredClass(e.target.value)}
              />

              <button
                onClick={() =>
                  handleConfirmClass(registeredClass, semester.semid)
                }
              >
                Confirm the class
              </button>
              {errorClass && <p className="notification">{errorClass}</p>}
            </div>

            <div className="backup-courses">
              <h3>SELECT 2 BACKUP COURSES</h3>
              <Select
                className="select-container"
                name="courseid"
                value={
                  bu1CourseOptions.find((op) => op.value === selectedBU1) ||
                  null
                }
                options={bu1CourseOptions}
                isClearable
                placeholder="Select Course"
                onChange={(selected) => handleChangeBU1(selected)}
              />
              {renderCourseDetail(selectedCourseObject1)}

              <Select
                className="select-container"
                name="courseid"
                value={
                  bu2CourseOptions.find((op) => op.value === selectedBU2) ||
                  null
                }
                options={bu2CourseOptions}
                isClearable
                placeholder="Select Course"
                onChange={(selected) => handleChangeBU2(selected)}
              />
              {renderCourseDetail(selectedCourseObject2)}
            </div>

            <div className="button-container">
              <button onClick={handleCancel}>Cancel</button>
              <button
                onClick={handleRegister}
                disabled={!isRegisterValid}
                className={isRegisterValid ? "valid" : "invalid"}
              >
                Register
              </button>
            </div>

            {showPopup && (
              <div className="popup-container">
                <div className="popup-content">
                  <p>{popupNoti}</p>
                  <button onClick={handleClose}>Close</button>
                </div>
              </div>
            )}

            {showPopupSuccess && (
              <div className="popup-container">
                <div className="popup-content">
                  <p>{popupNotiSuccess}</p>
                  <button onClick={handleCloseSuccess}>Close</button>
                </div>
              </div>
            )}

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
          </>
        )}
      </div>
    </div>
  );
}

export default ClassRegistration;
