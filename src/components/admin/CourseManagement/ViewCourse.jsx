import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import { useNavigate } from "react-router-dom";
import "../../../styles/ViewCourse.css";

export default function ViewCourse() {
  const navigate = useNavigate();

  const [searched, setSearched] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchCourses() {
    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/CourseManagement"
      );
      const data = await response.json();
      console.log("Fetched courses:", data);
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }
  useEffect(() => {
    fetchCourses();
  }, []);

  const searchCourse = courses.filter((course) =>
    course.coursecode?.toLowerCase().includes(searched.toLowerCase())
  );

  const toggleCourse = (id) => {
    setSelectedCourses((otherCourses) =>
      otherCourses.includes(id)
        ? otherCourses.filter((courseID) => courseID !== id)
        : [...otherCourses, id]
    );
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
          {searchCourse.map((course) => (
            <div key={course.courseid} className="course-item" onClick={() => toggleCourse(course.courseid)}>
              <div className="course-header">
                <div
                  className="course-name"
                  
                >
                  {course.coursename}
                </div>

                <button className="delete-btn course-delete-btn">x</button>
              </div>
              {selectedCourses.includes(course.courseid) && (
                <div className="course-detail">
                  <div className="detail-row">
                    <span className="course-info-label">Course Code: </span>
                    <span className="course-info-text">
                      {course.coursecode}
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
                    <span className="course-info-label">Credits: </span>
                    <span className="course-info-text">
                      {course.num_of_study_unit}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="course-info-label">Course Type: </span>
                    <span className="course-info-text">
                      {course.lec_or_lab}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="course-info-label">Prerequisite: </span>
                    <span className="course-info-text">
                      {course.prerequisite || "null"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="course-info-label">Parallel Course: <br/></span>
                    <span className="course-info-text">
                      {course.parallel_course || "null"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="course-info-label">Description: </span>
                    <span className="course-info-text">
                      {course.description}
                    </span>
                  </div>

                  <div className="course-action">
                    <button className="edit-btn">Edit</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="add-course-btn" onClick={()=> navigate("/courseManagement/addCourse")}>+</button>
      </div>
    </div>
  );
}
