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

  const parseDate = (d) => {
    if (!d) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(d);

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
      const [day, month, year] = d.split("/");
      return new Date(`${year}-${month}-${day}`);
    }

    return new Date(d);
  };

  async function fetchClasses() {
    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/ClassManagement"
      );
      const data = await response.json();

      console.log("Fetched:", data);

      setClasses(data.classes || []);

      const latest =
        data.latestSemester ||
        (data.semesterlat && data.semesterlat[0]) ||
        null;

      console.log("Latest semester:", latest);

      setLatestSemester(latest);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  // --- SEARCH ---
  const filteredClasses = classes.filter((cls) => {
    const keyword = searched.toLowerCase();
    return (
      cls.clsid?.toLowerCase().includes(keyword) ||
      cls.classname?.toLowerCase().includes(keyword)
    );
  });

  // --- GROUP BY semid ---
  const groupedBySemester = filteredClasses.reduce((acc, cls) => {
    if (!acc[cls.semid]) acc[cls.semid] = [];
    acc[cls.semid].push(cls);
    return acc;
  }, {});

  const sortedSemesters = Object.keys(groupedBySemester).sort(
    (a, b) => Number(a) - Number(b)
  );

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

  // --- LOGIC: CHO PHÉP SỬA / XOÁ ---
  const canModifyClass = (cls) => {
    if (!latestSemester) return false;

    // So sánh semid (ép về string để khớp tuyệt đối)
    if (String(cls.semid) !== String(latestSemester.semid)) return false;

    // Parse ngày
    const start = parseDate(latestSemester.start_date);
    if (!start || isNaN(start)) return false;

    const today = new Date();

    const limit = new Date(start);
    limit.setDate(limit.getDate() - 14);

    console.log("Check modify:", {
      clsid: cls.clsid,
      start,
      today,
      limit,
      can: today < limit,
    });

    return today < limit;
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
          {sortedSemesters.map((semid) => (
            <div key={semid} className="viewclass-semester-group">
              <h2 className="semester-title">{semid}</h2>

              {groupedBySemester[semid].map((cls) => (
                <div
                  key={cls.clsid}
                  className="viewclass-item"
                  onClick={() => toggleClass(cls.clsid)}
                >
                  <div className="viewclass-header">
                    <div className="viewclass-name">
                      {cls.classname} - {cls.classcode?.split("-")[1]}
                    </div>

                    {/* DELETE BUTTON */}
                    {canModifyClass(cls) && (
                      <button
                        className="delete-btn viewclass-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(cls.clsid);
                        }}
                      >
                        x
                      </button>
                    )}
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
                        <span className="viewclass-info-label">Class Location:</span>
                        <span className="viewclass-info-text">
                          {cls.classlocation || "null"}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="viewclass-info-label">Capacity: </span>
                        <span className="viewclass-info-text">{cls.capacity}</span>
                      </div>

                      {/* EDIT BUTTON */}
                      {canModifyClass(cls) && (
                        <div className="viewclass-action">
                          <button
                            className="viewclassedit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/ClassManagement/editClass/${cls.clsid}`
                              );
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* DELETE DIALOG */}
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

        {/* ADD BUTTON */}
        <button
          className="viewclassadd-class-btn"
          onClick={() => navigate("/ClassManagement/addClass")}
        >
          +
        </button>
      </div>
    </div>
  );
}
