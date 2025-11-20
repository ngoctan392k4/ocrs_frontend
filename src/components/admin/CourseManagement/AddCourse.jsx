import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import "../../../styles/Admin/CourseManagement/AddCourse.css";
import { useNavigate } from "react-router-dom";

export default function AddCourse() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [courseID, setCourseID] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [pre, setPre] = useState([]); // prerequisite
  const [para, setPara] = useState([]); // parallel course
  const [des, setDes] = useState("");
  const [preInput, setPreInput] = useState("");
  const [paraInput, setParaInput] = useState("");

  const [successDialog, setSuccessDialog] = useState(false); // Success dialog state
  const [successMessage, setSuccessMessage] = useState(""); // Success message
  const [cancelDialog, setCancelDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [error, setError] = useState("");

  const [selectedCredit, setSelectedCredit] = useState([]);
  const creditTypes = [
    "LEC",
    "LAB",
    "Review",
    "Project",
    "Internship",
    "Studio",
    "FieldTrip",
    "CLC",
    "DEM",
    "Discussion",
    "LanguageDialogue",
    "Workshop",
  ];

  const [credits, setCredits] = useState({
    LEC: 0,
    LAB: 0,
    Review: 0,
    Project: 0,
    Internship: 0,
    Studio: 0,
    FieldTrip: 0,
    CLC: 0,
    DEM: 0,
    Discussion: 0,
    LanguageDialogue: 0,
    Workshop: 0,
  });

  const searchCourse = (text) => {
    return courses.filter((course) =>
      course.coursecode?.toLowerCase().includes(text.toLowerCase())
    );
  };

  async function fetchCourses() {
    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/CourseManagement"
      );
      const data = await response.json();
      console.log("Fetched courses:", data);
      setCourses(data);
    } catch (e) {
      console.log(e.message);
      setError("Lost connection to the database");
    }
  }
  useEffect(() => {
    fetchCourses();
  }, []);

  const saveCourse = async () => {
    const tosu = "Tín chỉ";
    const course = {
      courseID,
      courseCode,
      courseName,
      tosu,
      pre: pre.join(", "),
      para: para.join(", "),
      des,
      credits,
    };

    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/CourseManagement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(course),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "An error occurred");
        setErrorDialog(true);
      } else {
        setSuccessMessage("Course added successfully");
        setSuccessDialog(true);
        setErrorDialog(false);
        setError("");
        setCourseID("");
        setCourseCode("");
        setCourseName("");
        setPre([]);
        setPara([]);
        setDes("");
        setCredits({
          LEC: 0,
          LAB: 0,
          Review: 0,
          Project: 0,
          Internship: 0,
          Studio: 0,
          FieldTrip: 0,
          CLC: 0,
          DEM: 0,
          Discussion: 0,
          LanguageDialogue: 0,
          Workshop: 0,
        });
      }
    } catch (error) {
      console.error("Failed to save course:", error);
    }
  };

  const addCreditType = (type) => {
    if (!selectedCredit.includes(type)) {
      setSelectedCredit([...selectedCredit, type]);
    }
  };

  const delCreditType = (type) => {
    if (credits[type] === 0) {
      setSelectedCredit((otherTypes) =>
        otherTypes.filter((credit) => credit !== type)
      );
    }
  };

  const handleCredits = (key, value) => {
    const numValue = Number(value);
    const totalOtherCredits = Object.keys(credits)
      .filter((k) => k !== key)
      .reduce((sum, k) => sum + credits[k], 0);

    if (totalOtherCredits + numValue <= 6) {
      setCredits({
        ...credits,
        [key]: numValue,
      });
    } else {
      setCredits({
        ...credits,
        [key]: 6 - totalOtherCredits,
      });
    }
  };

  const autoAssignCourseCode = (e) => {
    const newCourseID = e.target.value;
    setCourseID(newCourseID);

    const newCourseCode = newCourseID.split(" ")[0];
    setCourseCode(newCourseCode);
  };

  const addPre = (courseID) => {
    if (!pre.includes(courseID)) {
      setPre((prev) => [...prev, courseID]);
    }
    setPreInput("");
  };
  const delPre = (e, delItem) => {
    e.preventDefault();
    setPre(pre.filter((item) => item !== delItem));
  };

  const addPara = (e) => {
    e.preventDefault();
    if (paraInput.trim() !== " ".trim() && !para.includes(paraInput.trim())) {
      setPara([...para, paraInput.trim()]);
      setParaInput(" ");
    }
  };
  const delPara = (e, delItem) => {
    e.preventDefault();
    setPara(para.filter((item) => item !== delItem));
  };

  return (
    <div className="add-course-container">
      <Menu menus={menu_admin} />

      <div className="add-course-content">
        <h1 className="add-course-title">Add Course</h1>
        <form className="add-form">
          <div className="attribute">
            <span>Course Name:{"(*)"} </span>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />

            <span>Course ID:{"(*)"} </span>
            <input
              type="text"
              value={courseID}
              onChange={autoAssignCourseCode}
            />
            <div>
              {errorDialog && (
                <div className="dialog-backdrop">
                  <div className="dialog-box">
                    <div className="dialog-message">{error}</div>
                    <div className="dialog-actions">
                      <button
                        className="dialog-btn yes"
                        onClick={() => setErrorDialog(false)}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {successDialog && (
                <div className="dialog-backdrop">
                  <div className="dialog-box success">
                    <div className="dialog-message">{successMessage}</div>
                    <div className="dialog-actions">
                      <button
                        className="dialog-btn yes"
                        onClick={() => setSuccessDialog(false)}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <span>Course Code: </span>
            <input
              className="readOnly"
              type="text"
              value={courseCode}
              disabled
            />
          </div>

          <div className="attribute">
            <span>Prerequisite(s): </span>

            <div>
              <input
                type="text"
                value={preInput}
                onChange={(e) => setPreInput(e.target.value)}
                placeholder="Prerequisite(s)"
              />

              {preInput && (
                <div>
                  {searchCourse(preInput).map((course) => (
                    <div
                      key={course.courseid}
                      onClick={() => {
                        if (!pre.includes(course.courseid)) {
                          setPre([...pre, course.courseid]);
                        }
                        setPreInput("");
                      }}
                    >
                      {course.courseid} — {course.coursename}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pre-container">
              {pre.map((course) => (
                <span className="pre" key={course}>
                  {course}
                  <button onClick={(e) => delPre(e, course)}>x</button>
                </span>
              ))}
            </div>
          </div>

          <div className="attribute">
            <span>Parallel Course(s): </span>

            <div>
              <input
                type="text"
                value={paraInput}
                onChange={(e) => setParaInput(e.target.value)}
                placeholder="Parallel Course(s)"
              />

              {paraInput && (
                <div>
                  {searchCourse(paraInput).map((course) => (
                    <div
                      key={course.courseid}
                      onClick={() => {
                        if (!para.includes(course.courseid)) {
                          setPara([...para, course.courseid]);
                        }
                        setParaInput("");
                      }}
                    >
                      {course.courseid} — {course.coursename}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="para-container">
              {para.map((course) => (
                <span className="para" key={course}>
                  {course}
                  <button onClick={(e) => delPara(e, course)}>x</button>
                </span>
              ))}
            </div>
          </div>

          <div className="attribute">
            <span>Description: </span>
            <input
              type="text"
              value={des}
              onChange={(e) => setDes(e.target.value)}
            ></input>
          </div>
          <div className="attribute">
            <span>Type of study unit: </span>
            <input
              className="readOnly"
              type="text"
              value={" Tín chỉ"}
              disabled
            ></input>
          </div>

          <div className="attribute-credit">
            <div className="attribute">
              <span>
                {" "}
                Credit{"(s)"}:{"(*)"}{" "}
              </span>
              <select
                onChange={(e) => {
                  const type = e.target.value;
                  if (type !== "") addCreditType(type);
                  e.target.value = "";
                }}
              >
                <option> Select Credit Type </option>
                {creditTypes
                  .filter((type) => !selectedCredit.includes(type))
                  .map((type) => (
                    <option value={type} key={type}>
                      {type}
                    </option>
                  ))}
              </select>
            </div>

            <div className="credit-list">
              {selectedCredit.map((type) => (
                <div className="credit-item" key={type}>
                  <span>{type}: </span>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={credits[type]}
                    onChange={(e) => handleCredits(type, e.target.value)}
                  />
                  <button
                    type="button"
                    className="remove-credit"
                    disabled={credits[type] !== 0}
                    onClick={() => delCreditType(type)}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
        <div className="form-action">
          <button
            className="cancel-button"
            onClick={() => setCancelDialog(true)}
          >
            Cancel
          </button>
          <button className="save-button" onClick={saveCourse}>
            Save
          </button>
        </div>
        {cancelDialog && (
          <div className="dialog-backdrop">
            <div className="dialog-box">
              <div className="dialog-message">
                Cancel course adding process?
              </div>
              <div className="dialog-actions">
                <button
                  className="dialog-btn no"
                  onClick={() => setCancelDialog(false)}
                >
                  NO
                </button>
                <button
                  className="dialog-btn yes"
                  onClick={() => navigate("/courseManagement")}
                >
                  YES
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
