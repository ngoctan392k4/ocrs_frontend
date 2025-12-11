import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/student/ViewTranscript/ViewDetailTranscript.css";
import { useNavigate } from "react-router-dom";
import mailBoxIcon from '../../../assets/icon/mailbox.svg';

export default function ViewDetailTranscript() {
  const [classes, setClasses] = useState([]);
  const [allSem, setAllSem] = useState([]);
  const [sem, setSem] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  async function fetchSemesters() {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:3001/api/student/transcript/detailTranscript",
        { credentials: "include" }
      );
      const data = await res.json();

      setAllSem(data.allSem || []);

      if (data.allSem && data.allSem.length > 0) {
        const firstSem = data.allSem[0];
        setSem(firstSem);
        fetchClasses(firstSem.semid);
      } else {
        setClasses([]);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function fetchClasses(semid) {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3001/api/student/transcript/detailTranscript?semid=${semid}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err) {
      console.error(err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSemesters();
  }, []);

  return (
    <div className="transcript-container">
      <Menu menus={menu_student} />

      <div className="transcript-content">
        <h1 className="transcript-title">Detail Transcript</h1>

        {allSem.length > 0 && (
          <div className="filter-container">
            <label className="filter-label">Semester:</label>
            <select
              className="filter-select"
              value={sem?.semid || ""}
              onChange={(e) => {
                const selectedSem = allSem.find(
                  (s) => s.semid === e.target.value
                );
                setSem(selectedSem);
                fetchClasses(selectedSem.semid);
              }}
            >
              {allSem.map((s) => (
                <option key={s.semid} value={s.semid}>
                  {s.semid}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="table-wrapper">
          {loading ? (
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">No transcript data found</div>
              <div className="table-empty-subtext">No classes available for this semester</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class Code</th>
                  <th>Class Name</th>
                  <th>Course ID</th>
                  <th>Instructor</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.classid}>
                    <td className="table-cell-primary">{cls.classcode}</td>
                    <td>{cls.classname}</td>
                    <td className="table-cell-secondary">{cls.courseid}</td>
                    <td className="table-cell-secondary">{cls.instructor_name}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/detailTranscript/ViewGrade/${cls.classid}`)}
                      >
                        View Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
