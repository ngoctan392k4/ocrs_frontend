import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import "../../../styles/Admin/CourseManagement/EditCourse.css";
import { useNavigate, useParams } from "react-router-dom";

export default function EditCourse() {
  const navigate = useNavigate();
  const { courseid } = useParams();

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
      course.courseid?.toLowerCase().includes(text.toLowerCase())
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

  async function fetchCourseByID() {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/CourseManagement/${courseid}`
      );
      const data = await response.json();
      console.log(data);

      setCourseID(data.courseid);
      setCourseCode(data.coursecode);
      setCourseName(data.coursename);
      setDes(data.description || "");

      setPre(
        data.prerequisite && data.prerequisite !== "No prerequisite"
          ? data.prerequisite.split(",").map((x) => x.trim())
          : []
      );

      setPara(
        data.parallel_course && data.parallel_course !== "No parallel courses"
          ? data.parallel_course.split(",").map((x) => x.trim())
          : []
      );

      const initialCredits = {
        LEC: data.credit_lec || 0,
        LAB: data.credit_lab || 0,
        Review: data.credit_review || 0,
        Project: data.credit_project || 0,
        Internship: data.credit_internship || 0,
        Studio: data.credit_studio || 0,
        FieldTrip: data.credit_fieldtrip || 0,
        CLC: data.credit_clc || 0,
        DEM: data.credit_dem || 0,
        Discussion: data.credit_discussion || 0,
        LanguageDialogue: data.credit_languagedialogue || 0,
        Workshop: data.credit_workshop || 0,
      };

      setCredits(initialCredits);
      setSelectedCredit(
        Object.keys(initialCredits).filter((type) => initialCredits[type] > 0)
      );
    } catch (error) {}
  }
  useEffect(() => {
    fetchCourses();
    fetchCourseByID();
  }, []);

  const saveCourse = async () => {
    const tosu = "Tín chỉ";
    const course = {
      courseCode,
      courseName,
      tosu,
      pre: pre.length ? pre.join(", ") : null,
      para: para.length ? para.join(", ") : null,
      des,
      credits,
    };

    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/CourseManagement/${courseid}`,
        {
          method: "PUT",
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
        setSuccessMessage("Course updated successfully");
        setSuccessDialog(true);
        setErrorDialog(false);
        setError("");
      }
    } catch (error) {
      console.error("Failed to update course:", error);
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

  const delPre = (e, delItem) => {
    e.preventDefault();
    setPre(pre.filter((item) => item !== delItem));
  };

  const delPara = (e, delItem) => {
    e.preventDefault();
    setPara(para.filter((item) => item !== delItem));
  };

  return (
    <div className="edit-course-container">
      <Menu menus={menu_admin} />

      <div className="edit-course-content">
        <h1 className="edit-course-title">Edit Course</h1>
        <form className="edit-form">
          {/* Course name + code + id */}

          <div className="row-3col">
            <div className="field-group">
              <span>Course Name: (*)</span>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
            </div>

            <div className="field-group">
              <span>Course ID: (*)</span>
              <input
                className="readOnly"
                type="text"
                value={courseID}
                disabled
                onChange={autoAssignCourseCode}
              />
            </div>

            <div className="field-group">
              <span>Course Code:</span>
              <input
                type="text"
                className="readOnly"
                value={courseCode}
                disabled
              />
            </div>
          </div>

          <div className="row-2col">
            {/* PREREQUISITE */}

            <div className="field-group">
              <span>Prerequisite(s):</span>
              <input
                type="text"
                value={preInput}
                onChange={(e) => setPreInput(e.target.value)}
                placeholder="Prerequisite(s)"
              />
              {preInput && (
                <div className="dropdown">
                  {searchCourse(preInput).map((course) => (
                    <div
                      key={course.courseid}
                      className="dropdown-item"
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
              <div className="pre-container">
                {pre.map((course) => (
                  <span className="pre" key={course}>
                    {course}
                    <button onClick={(e) => delPre(e, course)}>x</button>
                  </span>
                ))}
              </div>
            </div>

            {/* PARALLEL */}

            <div className="field-group">
              <span>Parallel Course(s):</span>
              <input
                type="text"
                value={paraInput}
                onChange={(e) => setParaInput(e.target.value)}
                placeholder="Parallel Course(s)"
              />
              {paraInput && (
                <div className="dropdown">
                  {searchCourse(paraInput).map((course) => (
                    <div
                      key={course.courseid}
                      className="dropdown-item"
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
              <div className="para-container">
                {para.map((course) => (
                  <span className="para" key={course}>
                    {course}
                    <button onClick={(e) => delPara(e, course)}>x</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="row-1col">
            <div className="field-group">
              {/* Description */}

              <span>Description: </span>
              <input
                type="text"
                value={des}
                onChange={(e) => setDes(e.target.value)}
              ></input>
            </div>
          </div>
          <div className="row-2col credit-type-row">
            {/* Credit Section */}

            <div className="attribute-credit credit-column ">
              <div className="field-group">
                <span>Credit(s): (*)</span>
                <select
                  onChange={(e) => {
                    const type = e.target.value;
                    if (type !== "") addCreditType(type);
                    e.target.value = "";
                  }}
                >
                  <option>Select Credit Type</option>
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
                    <span className="credit-label">{type}: </span>
                    <input
                      type="number"
                      min={0}
                      max={6}
                      value={credits[type] || 0}
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

            {/* Type of Study Unit */}

            <div className="field-group type-of-study-unit">
              <span>Type of study unit:</span>
              <input
                type="text"
                className="readOnly"
                value={"Tín chỉ"}
                disabled
              />
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
            Update
          </button>
        </div>
        <div>
          {errorDialog && (
            <div className="dialog-backdrop">
              <div className="dialog-box">
                <div className="dialog-message">{error}</div>
                <div className="dialog-actions">
                  <button
                    className="dialog-btn yes"
                    onClick={() => {
                      setErrorDialog(false);
                    }}
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
                    onClick={() => {
                      setSuccessDialog(false);
                      navigate("/courseManagement");
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
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
