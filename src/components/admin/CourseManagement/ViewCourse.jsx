import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import { useNavigate } from "react-router-dom";
import DeleteCourse from "./DeleteCourse";
import "../../../styles/Admin/CourseManagement/ViewCourse.css";

export default function ViewCourse() {
  const navigate = useNavigate();

  const [creditTypes, setCreditTypes] = useState([]);
  const [searched, setSearched] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteCourseId, setDeleteCourseId] = useState(null);

  async function fetchCourses() {
    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/CourseManagement"
      );
      const data = await response.json();
      console.log("Fetched courses:", data);
      setCourses(data);

      const firstCourse = data[0] || {};
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
    fetchCourses();
  }, []);

  const searchCourse = courses.filter((course) =>
    course.courseid?.toLowerCase().includes(searched.toLowerCase())
  );

  const toggleCourse = (id) => {
    setSelectedCourses((otherCourses) =>
      otherCourses.includes(id)
        ? otherCourses.filter((courseID) => courseID !== id)
        : [...otherCourses, id]
    );
  };
  const handleDeleteClick = (id) => {
    setDeleteCourseId(id);
    setShowDialog(true);
  };
  const handleConfirmDelete = async () => {
    if (!deleteCourseId) return;
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/CourseManagement/${deleteCourseId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setCourses(prev => prev.filter(c => c.courseid !== deleteCourseId));
        setSelectedCourses(prev => prev.filter(id => id !== deleteCourseId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowDialog(false);
      setDeleteCourseId(null);
    }
  };
  const handleCancelDelete = () => {
    setShowDialog(false);
    setDeleteCourseId(null);
  };

  return (
    <div className="view-course-container">
      <Menu menus={menu_admin} />

      <div className="view-course-content">
        <h1 className="view-course-title">View Course</h1>

        <input
          className="search-bar"
          type="text"
          placeholder="Search Course Code"
          value={searched}
          onChange={(e) => setSearched(e.target.value)}
        />

        <div className="course-list">
          {loading ? (
            <div>loading....</div>
          ) : error ? (
            <div>{error};</div>
          ) : (
            searchCourse.map((course) => (
              <div
                key={course.courseid}
                className="course-item"
                onClick={() => toggleCourse(course.courseid)}
              >
                <div className="course-header">
                  <div className="course-name">{course.coursename}</div>

                  <button
                    className="delete-btn course-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(course.courseid);
                    }}
                  >x</button>
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
                    <div className="course-action">
                      <button className="edit-btn" onClick={()=> navigate(`/courseManagement/editCourse/${course.courseid}`)}>Edit</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <button
          className="add-course-btn"
          onClick={() => navigate("/courseManagement/addCourse")}
        >
          +
        </button>
      </div>
      {showDialog && (
        <DeleteCourse
          courseId={deleteCourseId}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
