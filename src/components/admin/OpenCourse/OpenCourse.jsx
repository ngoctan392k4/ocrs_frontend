import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import { useNavigate } from "react-router-dom";
import "../../../styles/Common/TableView.css";
import '../../../styles/Admin/OpenCourse/OpenCourse.css'

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

  const [successDialog, setSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorDialog, setErrorDialog] = useState(false);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

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
          <div className="buttons-container">
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
              className="Open-button"
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
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading courses...</p>
            </div>
          ) : searchCourse.length === 0 ? (
            <div className="table-empty-state">
              <div className="table-empty-icon">📭</div>
              <div className="table-empty-text">No courses found</div>
              <div className="table-empty-subtext">Try adjusting your search criteria</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Course Name</th>
                  <th>Type</th>
                  <th>Prerequisite</th>
                  <th>Parallel Course</th>
                  <th>Credit</th>
                  <th>Description</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {searchCourse.map((course) => (
                  <tr key={course.courseid}>
                    <td className="table-cell-primary">{course.courseid}</td>
                    <td>{course.coursename}</td>
                    <td className="table-cell-secondary">{course.type_of_study_unit || "—"}</td>
                    <td className="table-cell-secondary">{course.prerequisite || "None"}</td>
                    <td className="table-cell-secondary">{course.parallel_course || "None"}</td>
                    <td className="table-cell-secondary">
                      {creditTypes
                        .filter((credit) => course[credit.key] > 0)
                        .map((credit) => `${credit.keyLabel}: ${course[credit.key]}`)
                        .join(", ") || "—"}
                    </td>
                    <td
                      className="table-cell-secondary"
                      onClick={() => setSelectedCourse(course)}
                      style={{ cursor: 'pointer' }}
                    >
                      {course.description ? course.description.substring(0, 50) + "..." : "—"}
                    </td>
                    <td>
                      <input
                        disabled={semester?.semid !== latestSem}
                        className="Checkbox"
                        type="checkbox"
                        checked={openCourse.includes(course.courseid)}
                        onChange={() => {
                          handleToOpen(course.courseid);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    className="btn-success"
                    onClick={() => setSuccessDialog(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {selectedCourse && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '2000'
          }} onClick={() => setSelectedCourse(null)}>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ marginTop: '0', marginBottom: '20px', color: '#3a5a7a' }}>
                {selectedCourse.coursename}
              </h2>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#3a5a7a' }}>Course ID:</strong> {selectedCourse.courseid}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#3a5a7a' }}>Type:</strong> {selectedCourse.type_of_study_unit || "—"}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#3a5a7a' }}>Prerequisite:</strong> {selectedCourse.prerequisite || "None"}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#3a5a7a' }}>Parallel Course:</strong> {selectedCourse.parallel_course || "None"}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#3a5a7a' }}>Credits:</strong>{' '}
                {creditTypes
                  .filter((credit) => selectedCourse[credit.key] > 0)
                  .map((credit) => `${credit.keyLabel}: ${selectedCourse[credit.key]}`)
                  .join(", ") || "—"}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <strong style={{ color: '#3a5a7a', display: 'block', marginBottom: '8px' }}>Description:</strong>
                <p style={{
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '6px',
                  lineHeight: '1.6',
                  color: '#333',
                  margin: '0'
                }}>
                  {selectedCourse.description || "No description available"}
                </p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                style={{
                  backgroundColor: '#8db3d4',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
