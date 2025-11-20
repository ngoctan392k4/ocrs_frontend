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
  const [loading, setLoading] = useState(true);

  async function fetchClasses() {
    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/ClassManagement"
      );
      const data = await response.json();
      console.log("Fetched classes:", data);
      setClasses(data);
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

  const [showDialog, setShowDialog] = useState(false);
  const [deleteClassId, setDeleteClassId] = useState(null);

  // const handleDeleteClick = () => {
  //   setShowDialog(true);
  // };

  const handleDeleteClick = (id) => {
    setDeleteClassId(id);
    setShowDialog(true);
  };

  // const handleConfirm = () => {
  //   console.log("DELETE!");
  //   setShowDialog(false);
  // };

  const handleConfirmDelete = async () => {
    if (!deleteClassId) return;

    try {
      await fetch(
        `http://localhost:3001/api/admin/ClassManagement/${deleteClassId}`,
        {
          method: "DELETE",
        }
      );

      await fetchClasses(); // cập nhật lại UI
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
    <div className="view-container">
      <Menu menus={menu_admin} />

      <div className="view-content">
        <h1 className="view-title">View Class</h1>

        <input
          className="search-bar"
          type="text"
          placeholder="Search Class ID"
          value={searched}
          onChange={(e) => setSearched(e.target.value)}
        />

        <div className="class-list">
          {searchClass.map((cls) => (
            <div
              key={cls.clsid}
              className="class-item"
              onClick={() => toggleClass(cls.clsid)}
            >
              <div className="class-header">
                <div className="class-name">{cls.classname}</div>

                <button
                  className="delete-btn class-delete-btn"
                  onClick={() => handleDeleteClick(cls.clsid)}
                >
                  x
                </button>
              </div>

              {selectedClasses.includes(cls.clsid) && (
                <div className="class-detail">
                  <div className="detail-row">
                    <span className="class-info-label">Class ID: </span>
                    <span className="class-info-text">{cls.clsid}</span>
                  </div>

                  <div className="detail-row">
                    <span className="class-info-label">Class Code: </span>
                    <span className="class-info-text">{cls.classcode}</span>
                  </div>

                  {/* <div className="detail-row">
                    <span className="class-infor-label">Available Course ID: </span>
                    <span className="class-infor-text">{cls.availableCourseID}</span>
                    </div> */}

                  <div className="detail-row">
                    <span className="class-info-label">
                      Course ID:{" "}
                    </span>
                    <span className="class-info-text">
                      {cls.courseid}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="class-info-label">Class Name: </span>
                    <span className="class-info-text">{cls.classname}</span>
                  </div>

                  <div className="detail-row">
                    <span className="class-info-label">Instructor: </span>
                    <span className="class-info-text">{cls.instructorid}</span>
                  </div>

                  <div className="detail-row">
                    <span className="class-info-label">Semester: </span>
                    <span className="class-info-text">{cls.semid}</span>
                  </div>

                  <div className="detail-row">
                    <span className="class-info-label">Schedule: </span>
                    <span className="class-info-text">{cls.schedule}</span>
                  </div>

                  <div className="detail-row">
                    <span className="class-info-label">
                      Class Location: <br />
                    </span>
                    <span className="class-info-text">
                      {cls.classlocation || "null"}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="class-info-label">Capacity: </span>
                    <span className="class-info-text">{cls.capacity}</span>
                  </div>

                  <div className="class-action">
                    <button className="edit-btn">Edit</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {showDialog && (
          <div className="dialog-backdrop">
            <div className="dialog-box">
              <div className="dialog-message">
                Delete Class {deleteClassId}?
              </div>

              <div className="dialog-actions">
                <button className="dialog-btn no" onClick={handleCancel}>
                  No
                </button>
                <button
                  className="dialog-btn yes"
                  onClick={handleConfirmDelete}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          className="add-class-btn"
          onClick={() => navigate("/classManagement/addClass")}
        >
          +
        </button>
      </div>
    </div>
  );
}
