import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/student/ClassRegistration/RegisteredClass.css";
import Chatbot from "../Chatbot/Chatbot";
import mailBoxIcon from '../../../assets/icon/mailbox.svg';

export default function RegisteredClass() {
  const [searched, setSearched] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [registered, setClasses] = useState([]);
  const [currentSem, setCurrentSem] = useState(null);
  const [latestSem, setLatestSem] = useState(null);
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
      if (data.currentSem) setCurrentSem(data.currentSem.semid);
      if (data.latestSem) setLatestSem(data.latestSem.semid);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  const visibleClasses = registered.filter(
    (cls) =>
      cls.semid === currentSem ||
      (latestSem && latestSem !== currentSem && cls.semid === latestSem)
  );

  const groupedBySemester = visibleClasses.reduce((acc, cls) => {
    const sem = cls.semid;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(cls);
    return acc;
  }, {});

  const sortedSemesters = [];
  if (currentSem && groupedBySemester[currentSem]) sortedSemesters.push(currentSem);
  if (latestSem && latestSem !== currentSem && groupedBySemester[latestSem]) sortedSemesters.push(latestSem);

  const filteredBySearch = (clsArray) => {
    return clsArray.filter((cls) => {
      const keyword = searched.toLowerCase();
      return (
        cls.clsid?.toLowerCase().includes(keyword) ||
        cls.classname?.toLowerCase().includes(keyword)
      );
    });
  };

  const toggleClass = (id) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((clsid) => clsid !== id) : [...prev, id]
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
        <Chatbot />
        <h1 className="viewregistered-title">View Registered Classes</h1>

        <div className="filter-container">
          <input
            className="search-input"
            type="text"
            placeholder="Search by class code or name..."
            value={searched}
            onChange={(e) => setSearched(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="table-wrapper">
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading classes...</p>
            </div>
          </div>
        ) : visibleClasses.length === 0 ? (
          <div className="table-wrapper">
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">No registered classes</div>
              <div className="table-empty-subtext">You have no registered classes yet</div>
            </div>
          </div>
        ) : (
          <>
            {sortedSemesters.map((semid) => (
              <div key={semid}>
                <h2 className="semester-title">
                  {semid === currentSem ? "Current Semester" : semid}
                </h2>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Class Code</th>
                        <th>Class Name</th>
                        <th>Instructor</th>
                        <th>Schedule</th>
                        <th>Location</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBySearch(groupedBySemester[semid]).map((cls) => (
                        <tr key={cls.clsid}>
                          <td className="table-cell-primary">{cls.classcode}</td>
                          <td>{cls.classname}</td>
                          <td className="table-cell-secondary">
                            {cls.instructorid} - {cls.instructor_name}
                          </td>
                          <td className="table-cell-secondary">{cls.schedule || "-"}</td>
                          <td className="table-cell-secondary">{cls.classlocation || "-"}</td>
                          <td className="text-center">
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteClick(cls.clsid)}
                              title="Cancel registration"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </>
        )}

        {showDialog && (
          <div className="dialog-backdrop">
            <div className="dialog-box">
              <div className="dialog-message">
                Cancel Class{" "}
                {registered.find((cls) => cls.clsid === deleteClassId)?.clsid}?
              </div>
              <div className="dialog-actions">
                <button
                  className="dialog-btn cancel-btn"
                  onClick={handleCancel}
                >
                  No
                </button>
                <button
                  className="dialog-btn delete-confirm-btn"
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
