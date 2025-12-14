import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import { useNavigate } from "react-router-dom";
import DeleteCourse from "./DeleteCourse";
import "../../../styles/Common/TableView.css";
import deleteIcon from '../../../assets/icon/delete.svg';
import editIcon from '../../../assets/icon/edit.svg';
import mailBoxIcon from '../../../assets/icon/mailbox.svg';

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
  const [deleteError, setDeleteError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

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
    setDeleteError(null);
  };
  const handleConfirmDelete = async () => {
    if (!deleteCourseId) return;
    setDeleteError(null);
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/CourseManagement/${deleteCourseId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (response.ok) {
        setCourses(prev => prev.filter(c => c.courseid !== deleteCourseId));
        setSelectedCourses(prev => prev.filter(id => id !== deleteCourseId));
        setShowDialog(false);
        setDeleteCourseId(null);
        setDeleteError(null);
      }
      else {
        setDeleteError(data.error || data.message || "Failed to delete course");
      }
    } catch (err) {
      console.error(err);
      setDeleteError("Network error. Please try again.");
    }
  };
  const handleCancelDelete = () => {
    setShowDialog(false);
    setDeleteCourseId(null);
    setDeleteError(null);
  };

  return (
    <div className="table-view-container">
      <Menu menus={menu_admin} />

      <div className="table-view-content">
        <div className="table-view-header">
          <h1 className="table-view-title">Course Management</h1>
          <p className="table-view-subtitle">Manage and view all system courses</p>
        </div>

        <div className="table-search-filter">
          <input
            className="table-search-bar"
            type="text"
            placeholder="Search by Course ID or Name"
            value={searched}
            onChange={(e) => setSearched(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="table-wrapper">
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading courses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="table-error">
            <strong>Error:</strong> {error}
          </div>
        ) : searchCourse.length === 0 ? (
          <div className="table-wrapper">
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">No courses found</div>
              <div className="table-empty-subtext">Try adjusting your search criteria</div>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Course Name</th>
                  <th>Type</th>
                  <th>Prerequisite</th>
                  <th>Credit</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchCourse.map((course) => (
                  <tr key={course.courseid}>
                    <td className="table-cell-primary">{course.courseid}</td>
                    <td>{course.coursename}</td>
                    <td className="table-cell-secondary">{course.type_of_study_unit || "—"}</td>
                    <td className="table-cell-secondary">{course.prerequisite || "None"}</td>
                    <td className="table-cell-secondary">
                      {creditTypes
                        .filter((credit) => course[credit.key] > 0)
                        .map((credit) => `${credit.keyLabel}: ${course[credit.key]}`)
                        .join(", ") || "—"}
                    </td>
                    <td className="table-cell-secondary"
                      onClick={() => setSelectedCourse(course)}
                      style={{ cursor: 'pointer' }}
                    >
                      {course.description ? course.description.substring(0, 50) + "..." : "—"}
                    </td>
                    <td>
                      <div className="table-cell-actions">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => navigate(`/courseManagement/editCourse/${course.courseid}`)}
                          title="Edit course"
                        >
                          <img src={editIcon} alt="editIcon" />
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => handleDeleteClick(course.courseid)}
                          title="Delete course"
                        >
                          <img src={deleteIcon} alt="deleteIcon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button
          className="fab-button"
          onClick={() => navigate("/courseManagement/addCourse")}
          title="Add new course"
        >
          +
        </button>
      </div>
      {showDialog && (
        <DeleteCourse
          courseId={deleteCourseId}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
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
              {selectedCourse.course_name}
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
  );
}
