import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import { useNavigate } from "react-router-dom";
import "../../../styles/Admin/OpenCourse/OpenCourse.css";

export default function OpenCourse() {
  const navigate = useNavigate();

  const [creditTypes, setCreditTypes] = useState([]);
  const [searched, setSearched] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openCourse, setOpenCourse] = useState([]);
  const [originOpenCourse, setOriginOpenCourse] = useState([]);
  const [semester, setSemester] = useState(null);
  const [allSemesters, setAllSemesters] = useState([]);
  const [latestSem, setLatestSem] = useState(null);
  const [showOpeneOnly, setShowOpeneOnly] = useState(false);

  const [successDialog, setSuccessDialog] = useState(false); // Success dialog state
  const [successMessage, setSuccessMessage] = useState(""); // Success message
  const [errorDialog, setErrorDialog] = useState(false);
  const [error, setError] = useState("");

  async function semesterGenerate() {
    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/semester/next",
        { method: "POST" }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }
    } catch (err) {
      console.error("Failed to create next semester:", err);
      alert("Không thể tạo kỳ học mới!");
    }
  }

  async function fetchCourses(semid = null) {
    try {
      const url = semid
        ? `http://localhost:3001/api/admin/openCourse?semid=${semid}`
        : `http://localhost:3001/api/admin/openCourse`;

      const response = await fetch(url);
      const data = await response.json();
      console.log("Fetched courses:", data);

      setAllSemesters(data.allSem);

      const selectedSem = semid
        ? data.allSem.find((s) => s.semid === semid) || data.latestSem
        : data.latestSem;

      setSemester(selectedSem);
      setCourses(data.allCourse);
      setLatestSem(data.latestSem?.semid);

      setOpenCourse(data.course.map((c) => c.courseid));
      setOriginOpenCourse(data.course.map((c) => c.courseid));

      const firstCourse = data.course[0] || {};
      const newType = [];
      for (const key in firstCourse) {
        if (key.toLowerCase().startsWith("credit_")) {
          const keyLabel = key.replace("credit_", "").toUpperCase();
          newType.push({ keyLabel, key });
        }
      }

      setCreditTypes(newType);
    } catch (e) {
      console.log(e.message);
      setError("Lost connection to the database");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    semesterGenerate();
    fetchCourses();
  }, []);

  const courseDisplay = showOpeneOnly
    ? courses.filter((course) => openCourse.includes(course.courseid))
    : courses;

  const searchCourse = courseDisplay.filter((course) =>
    course.courseid?.toLowerCase().includes(searched.toLowerCase())
  );

  const toggleCourse = (id) => {
    setSelectedCourses((otherCourses) =>
      otherCourses.includes(id)
        ? otherCourses.filter((courseID) => courseID !== id)
        : [...otherCourses, id]
    );
  };

  const handleToOpen = (id) => {
    setOpenCourse((otherCourses) =>
      otherCourses.includes(id)
        ? otherCourses.filter((courseID) => courseID !== id)
        : [...otherCourses, id]
    );
    console.log(openCourse);
  };

  const handleOpenCourse = async () => {
    try {
      const addCourse = openCourse.filter(
        (id) => !originOpenCourse.includes(id)
      );
      const removeCourse = originOpenCourse.filter(
        (id) => !openCourse.includes(id)
      );
      const response = await fetch(
        "http://localhost:3001/api/admin/openCourse",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ add: addCourse, remove: removeCourse }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "An error occurred");
        setErrorDialog(true);
      } else {
        setSuccessMessage(data.message);
        setSuccessDialog(true);
        setErrorDialog(false);

        await fetchCourses();
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while opening courses.");
    }
  };

  return (
    <div className="open-course-container">
      <Menu menus={menu_admin} />

      <div className="open-course-content">
        <h1 className="open-course-title">Open Course For {semester?.semid}</h1>

        <div className="search-and-buttons">
          <input
            className="search-bar"
            type="text"
            placeholder="Search Course Code"
            value={searched}
            onChange={(e) => setSearched(e.target.value)}
          />
          <span className="buttons-container">
            <button
              disabled={semester?.semid !== latestSem}
              className="Open-button"
              onClick={() => {
                handleOpenCourse();
              }}
            >
              Save
            </button>
            <button
              className={"Open-button"}
              onClick={() => {
                setShowOpeneOnly(!showOpeneOnly);
              }}
            >
              {showOpeneOnly ? "Show All" : "Opened"}
            </button>
            <div className="semester-row">
              <span className="semester-label">Semester:</span>
              <select
                className="semester-dropdown"
                value={semester?.semid || ""}
                onChange={(e) => fetchCourses(e.target.value)}
              >
                {allSemesters.map((sem) => (
                  <option key={sem.semid} value={sem.semid}>
                    {sem.semid}
                  </option>
                ))}
              </select>
            </div>
          </span>
        </div>
        <div className="course-list">
          {loading ? (
            <div>loading....</div>
          ) : (
            searchCourse.map((course) => (
              <div
                key={course.courseid}
                className="course-item"
                onClick={() => toggleCourse(course.courseid)}
              >
                <div className="course-header">
                  <div className="course-name">{course.coursename}</div>
                  <input
                    disabled={semester?.semid !== latestSem}
                    className="Checkbox"
                    type="checkbox"
                    checked={openCourse.includes(course.courseid)}
                    onChange={() => {
                      handleToOpen(course.courseid);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {selectedCourses.includes(course.courseid) && (
                  <div className="course-detail">
                    <div className="detail-row">
                      <span className="course-info-label">Course ID: </span>
                      <span className="course-info-text">
                        {course.courseid}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="course-info-label">Course Name: </span>
                      <span className="course-info-text">
                        {course.coursename}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="course-info-label">
                        Type of study unit:{" "}
                      </span>
                      <span className="course-info-text">
                        {course.type_of_study_unit}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="course-info-label">Prerequisite: </span>
                      <span className="course-info-text">
                        {course.prerequisite || "No prerequisite"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="course-info-label">
                        Parallel Course: <br />
                      </span>
                      <span className="course-info-text">
                        {course.parallel_course || "No parallel courses"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="course-info-label">Description: </span>
                      <span className="course-info-text">
                        {course.description || "No description"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="course-info-label">Credit: </span>

                      <span className="course-info-text">
                        {creditTypes
                          .filter((credit) => course[credit.key] > 0)
                          .map((credit) => (
                            <div key={credit.key} className="credit-detail-row">
                              <span className="credit-info-label">
                                {credit.keyLabel}:{" "}
                              </span>
                              <span className="credit-info-text">
                                {course[credit.key]}
                              </span>
                            </div>
                          ))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
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
      </div>
    </div>
  );
}
