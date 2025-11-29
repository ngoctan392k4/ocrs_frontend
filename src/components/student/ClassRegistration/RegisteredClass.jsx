import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuStudentData";
import { useNavigate } from "react-router-dom";
import "../../../styles/student/ClassRegistration/RegisteredClass.css";

export default function RegisteredClass() {
  const navigate = useNavigate();
  const [searched, setSearched] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [registered, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteClassId, setDeleteClassId] = useState(null);

  async function fetchClasses() {
    try {
      const response = await fetch(
        "http://localhost:3001/api/student/registeredClass",
        { credentials: "include" }
      );
      const data = await response.json();
      setClasses(data.registered || []);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = registered.filter((cls) => {
    const keyword = searched.toLowerCase();
    return (
      cls.clsid?.toLowerCase().includes(keyword) ||
      cls.classname?.toLowerCase().includes(keyword)
    );
  });

  const groupedBySemester = filteredClasses.reduce((acc, cls) => {
    const semid = cls.semid || "Unknown Semester";
    if (!acc[semid]) acc[semid] = [];
    acc[semid].push(cls);
    return acc;
  }, {});

  const sortedSemesters = Object.keys(groupedBySemester).sort();

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
        `http://localhost:3001/api/student/registeredClass/${deleteClassId}`,
        { method: "DELETE", credentials: "include" }
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
    <div className="viewregistered-container">
      <Menu menus={menu_admin} />
      <div className="viewregistered-content">
        <h1 className="viewregistered-title">View Registered Classes</h1>

        <input
          className="viewregisteredsearch-bar"
          type="text"
          placeholder="Search Class"
          value={searched}
          onChange={(e) => setSearched(e.target.value)}
        />

        <div className="viewregistered-list">
          {!loading && filteredClasses.length === 0 && (
            <div className="no-classes-message">
              There are no registered classes for this semester!
            </div>
          )}
          {sortedSemesters.map((semid) => (
            <div key={semid} className="viewregistered-semester-group">
              <h2 className="semester-title">{semid}</h2>
              {groupedBySemester[semid].map((cls) => (
                <div
                  key={cls.clsid}
                  className="viewregistered-item"
                  onClick={() => toggleClass(cls.clsid)}
                >
                  <div className="viewregistered-header">
                    <div className="viewregistered-name">
                      {cls.classname} - {cls.classcode?.split("-")[1]}
                    </div>
                    <button
                      className="viewregistered-delete-btn"
                      onClick={() => handleDeleteClick(cls.clsid)}
                    >
                      x
                    </button>
                  </div>

                  {selectedClasses.includes(cls.clsid) && (
                    <div className="viewregistered-detail">
                      <div className="viewregistereddetail-row">
                        <span className="viewregistered-info-label">
                          Class Code:
                        </span>
                        <span className="viewregistered-info-text">
                          {cls.classcode}
                        </span>
                      </div>
                      <div className="viewregistereddetail-row">
                        <span className="viewregistered-info-label">
                          Instructor:
                        </span>
                        <span className="viewregistered-info-text">
                          {cls.instructorid} - {cls.instructor_name}
                        </span>
                      </div>
                      <div className="viewregistereddetail-row">
                        <span className="viewregistered-info-label">
                          Schedule:
                        </span>
                        <span className="viewregistered-info-text">
                          {cls.schedule}
                        </span>
                      </div>
                      <div className="viewregistereddetail-row">
                        <span className="viewregistered-info-label">
                          Location:
                        </span>
                        <span className="viewregistered-info-text">
                          {cls.classlocation}
                        </span>
                      </div>
                      <div className="viewregistereddetail-row">
                        <span className="viewregistered-info-label">
                          Back Up Course 1:
                        </span>
                        <span className="viewregistered-info-text">
                          {cls.bucourseid_st}
                        </span>
                      </div>
                      <div className="viewregistereddetail-row">
                        <span className="viewregistered-info-label">
                          Back Up Course 2:
                        </span>
                        <span className="viewregistered-info-text">
                          {cls.bucourseid_nd}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {showDialog && (
          <div className="viewregistereddialog-backdrop">
            <div className="viewregistereddialog-box">
              <div className="viewregistereddialog-message">
                Cancel Class{" "}
                {registered.find((cls) => cls.clsid === deleteClassId)?.clsid}?
              </div>
              <div className="viewregistereddialog-actions">
                <button
                  className="viewregistereddialog-btn no"
                  onClick={handleCancel}
                >
                  No
                </button>
                <button
                  className="viewregistereddialog-btn yes"
                  onClick={handleConfirmDelete}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
