import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import { useNavigate } from "react-router-dom";
import "../../../styles/admin/ClassManagement/ViewClass.css";

export default function ViewClass() {
  const navigate = useNavigate();
  const [searched, setSearched] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [latestSemester, setLatestSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteClassId, setDeleteClassId] = useState(null);

  async function fetchClasses() {
    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/ClassManagement"
      );
      const data = await response.json();
      console.log("Fetched classes:", data);
      setClasses(data.classes || []);
      setLatestSemester(data.latestSemester || null);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  const searchClass = classes.filter((cls) => {
    const keyword = searched.toLowerCase();
    return (
      cls.clsid?.toLowerCase().includes(keyword) ||
      cls.classname?.toLowerCase().includes(keyword)
    );
  });

  const toggleClass = (id) => {
    setSelectedClasses((otherClasses) =>
      otherClasses.includes(id)
        ? otherClasses.filter((clsid) => clsid !== id)
        : [...otherClasses, id]
    );
  };

  const handleDeleteClick = (id) => {
    toggleClass(id);
    setDeleteClassId(id);
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteClassId) return;
    try {
      await fetch(
        `http://localhost:3001/api/admin/ClassManagement/${deleteClassId}`,
        { method: "DELETE" }
      );
      await fetchClasses();
      setShowDialog(false);
      setDeleteClassId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setDeleteClassId(null);
  };

  return (
    <div className="viewclass-container">
      <Menu menus={menu_admin} />
      <div className="viewclass-content">
        <h1 className="viewclass-title">View Class</h1>
        <input
          className="viewclasssearch-bar"
          type="text"
          placeholder="Search Class"
          value={searched}
          onChange={(e) => setSearched(e.target.value)}
        />

        <div className="viewclass-list">
          {searchClass.map((cls) => (
            <div
              key={cls.clsid}
              className="viewclass-item"
              onClick={() => toggleClass(cls.clsid)}
            >
              <div className="viewclass-header">
                <div className="viewclass-name">{cls.classname}</div>
                <button
                  className="delete-btn viewclass-delete-btn"
                  onClick={() => handleDeleteClick(cls.clsid)}
                >
                  x
                </button>
              </div>

              {selectedClasses.includes(cls.clsid) && (
                <div className="viewclass-detail">
                  <div className="viewclassdetail-row">
                    <span className="viewclass-info-label">Class Code: </span>
                    <span className="viewclass-info-text">{cls.classcode}</span>
                  </div>
                  <div className="viewclassdetail-row">
                    <span className="viewclass-info-label">Course ID: </span>
                    <span className="viewclass-info-text">{cls.courseid}</span>
                  </div>
                  <div className="viewclassdetail-row">
                    <span className="viewclass-info-label">Class Name: </span>
                    <span className="viewclass-info-text">{cls.classname}</span>
                  </div>
                  <div className="viewclassdetail-row">
                    <span className="viewclass-info-label">Instructor: </span>
                    <span className="viewclass-info-text">
                      {cls.instructorid} - {cls.instructor_name}
                    </span>
                  </div>
                  <div className="viewclassdetail-row">
                    <span className="viewclass-info-label">Semester: </span>
                    <span className="viewclass-info-text">
                      {cls.semester_name} - SY - {cls.school_year}
                    </span>
                  </div>
                  <div className="viewclassdetail-row">
                    <span className="viewclass-info-label">Schedule: </span>
                    <span className="viewclass-info-text">{cls.schedule}</span>
                  </div>
                  <div className="viewclassdetail-row">
                    <span className="viewclass-info-label">Class Location: </span>
                    <span className="viewclass-info-text">
                      {cls.classlocation || "null"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="viewclass-info-label">Capacity: </span>
                    <span className="viewclass-info-text">{cls.capacity}</span>
                  </div>
                  <div className="viewclass-action">
                    <button
                      className="viewclassedit-btn"
                      onClick={() =>
                        navigate(
                          `/ClassManagement/editClass/${cls.clsid}`
                        )
                      }
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {showDialog && (
          <div className="viewclassdialog-backdrop">
            <div className="viewclassdialog-box">
              <div className="viewclassdialog-message">
                Delete Class{" "}
                {classes.find((cls) => cls.clsid === deleteClassId)?.classcode}?
              </div>
              <div className="viewclassdialog-actions">
                <button className="viewclassdialog-btn no" onClick={handleCancel}>
                  No
                </button>
                <button
                  className="viewclassdialog-btn yes"
                  onClick={handleConfirmDelete}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          className="viewclassadd-class-btn"
          onClick={async () => {
            try {
              // Gọi API tạo kỳ học tiếp theo
              const response = await fetch(
                "http://localhost:3001/api/admin/semester/next",
                {
                  method: "POST",
                }
              );

              if (!response.ok) {
                const err = await response.text();
                throw new Error(err);
              }

              // Chuyển sang trang Add Class
              navigate("/ClassManagement/addClass");
            } catch (err) {
              console.error("Failed to create next semester:", err);
              alert("Không thể tạo kỳ học mới!");
            }
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
