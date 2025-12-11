import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import { useNavigate } from "react-router-dom";
import "../../../styles/Common/TableView.css";
import deleteIcon from '../../../assets/icon/delete.svg';
import editIcon from '../../../assets/icon/edit.svg';
import mailBoxIcon from '../../../assets/icon/mailbox.svg';

export default function ViewClass() {
  const navigate = useNavigate();
  const [searched, setSearched] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [latestSemester, setLatestSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteClassId, setDeleteClassId] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [semesters, setSemesters] = useState([]);

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

      // Extract unique semesters
      const uniqueSemesters = [...new Set((data.classes || []).map(cls => cls.semid))].sort((a, b) => Number(b) - Number(a));
      setSemesters(uniqueSemesters);

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
    const matchesSearch = (
      cls.clsid?.toLowerCase().includes(keyword) ||
      cls.classname?.toLowerCase().includes(keyword)
    );
    const matchesSemester = selectedSemester === "all" || String(cls.semid) === selectedSemester;
    return matchesSearch && matchesSemester;
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
    <div className="table-view-container">
      <Menu menus={menu_admin} />
      <div className="table-view-content">
        <div className="table-view-header">
          <h1 className="table-view-title">Class Management</h1>
          <p className="table-view-subtitle">Manage and view all system classes</p>
        </div>

        <div className="table-search-filter">
          <input
            className="table-search-bar"
            type="text"
            placeholder="Search by Class ID or Name"
            value={searched}
            onChange={(e) => setSearched(e.target.value)}
          />
          <select
            className="table-search-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="all">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="table-wrapper">
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading classes...</p>
            </div>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="table-wrapper">
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon"/></div>
              <div className="table-empty-text">No classes found</div>
              <div className="table-empty-subtext">Try adjusting your search criteria</div>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class Code</th>
                  <th>Class Name</th>
                  <th>Course ID</th>
                  <th>Instructor</th>
                  <th>Semester</th>
                  <th>Schedule</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((cls) => (
                  <tr key={cls.clsid}>
                    <td className="table-cell-primary">{cls.classcode}</td>
                    <td>{cls.classname}</td>
                    <td className="table-cell-secondary">{cls.courseid}</td>
                    <td className="table-cell-secondary">{cls.instructor_name || "—"}</td>
                    <td>
                      <span style={{
                        textTransform: 'capitalize',
                        fontWeight: '500',
                        color: 'var(--color-blue-pastel-700)'
                      }}>
                        {cls.semid}
                      </span>
                    </td>
                    <td className="table-cell-secondary">{cls.schedule || "—"}</td>
                    <td className="table-cell-secondary">{cls.capacity}</td>
                    <td>
                      <div className="table-cell-actions">
                        {canModifyClass(cls) && (
                          <>
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => navigate(`/ClassManagement/editClass/${cls.clsid}`)}
                              title="Edit class"
                            >
                              <img src={editIcon} alt="editIcon"/>
                            </button>
                            <button
                              className="action-btn action-btn-delete"
                              onClick={() => handleDeleteClick(cls.clsid)}
                              title="Delete class"
                            >
                              <img src={deleteIcon} alt="deleteIcon"/>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DELETE DIALOG */}
        {showDialog && (
          <div className="dialog-backdrop">
            <div className="dialog-box">
              <p className="dialog-message">
                Delete class {classes.find((cls) => cls.clsid === deleteClassId)?.classcode}?
              </p>
              <div className="dialog-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  No
                </button>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={handleConfirmDelete}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          className="fab-button"
          onClick={() => navigate("/ClassManagement/addClass")}
          title="Add new class"
        >
          +
        </button>
      </div>
    </div>
  );
}
