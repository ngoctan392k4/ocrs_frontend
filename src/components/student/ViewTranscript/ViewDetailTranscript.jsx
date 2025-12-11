import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/student/ViewTranscript/ViewDetailTranscript.css";
import { useNavigate } from "react-router-dom";

export default function ViewDetailTranscript() {
  const [selectedClasses, setSelectedClasses] = useState([]);
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
        // No semesters exist
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

  const toggleClass = (id) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((clsid) => clsid !== id) : [...prev, id]
    );
  };

  return (
    <div className="detailTranscript-container">
      <Menu menus={menu_student} />

      <div className="detailTranscript-content">
        <h1 className="detailTranscript-title">Detail Transcript</h1>

        {allSem.length > 0 && (
          <div className="sem-year-filter">
            <span className="semester-label">Semester:</span>
            <select
              className="semester-dropdown"
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

        <div className="detailTranscript-list">
          {loading ? (
            <div className="no-classes-message">Loading...</div>
          ) : classes.length === 0 ? (
            <div className="no-classes-message">No transcript data found.</div>
          ) : (
            classes.map((cls) => (
              <div
                key={cls.classid}
                className="detailTranscript-item"
                onClick={() => toggleClass(cls.classid)}
              >
                <div className="detailTranscript-header">
                  <div className="detailTranscript-name">{cls.classname}</div>

                  <button
                    className="detailTranscript-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/detailTranscript/ViewGrade/${cls.classid}`);
                    }}
                  >
                    View Grade
                  </button>
                </div>

                {selectedClasses.includes(cls.classid) && (
                  <div className="detailTranscript-detail">
                    <div className="detailTranscript-row">
                      <span className="detailTranscript-label">Class Code:</span>
                      <span className="detailTranscript-text">{cls.classcode}</span>
                    </div>

                    <div className="detailTranscript-row">
                      <span className="detailTranscript-label">Course Code:</span>
                      <span className="detailTranscript-text">{cls.courseid}</span>
                    </div>

                    <div className="detailTranscript-row">
                      <span className="detailTranscript-label">Instructor:</span>
                      <span className="detailTranscript-text">{cls.instructor_name}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
