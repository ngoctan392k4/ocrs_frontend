import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/student/ViewTranscript/DetailTranscript.css";

export default function DetailTranscript() {
  const { classid } = useParams();
  const [grades, setGrades] = useState([]);
  const [total, setTotal] = useState(null)
  const [classes, setClasses] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchGrades() {
    try {
      const response = await fetch(
        `http://localhost:3001/api/student/transcript/detailTranscript/${classid}`,
        { credentials: "include" }
      );

      const data = await response.json();
      setGrades(data.grade);
      setClasses(data.classes);
      setTotal(data.total);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGrades();
  }, [classid]);

  return (
    <div className="detailTranscript-container">
      <Menu menus={menu_student} />

      <div className="detailTranscript-content">
        <h1 className="detailTranscript-title">Detail Transcript</h1>
        <h2 className="detailTranscript-subtitle">
          {classes === null
            ? "Loading..."
            : `Class Name: ${classes.courseid} - ${classes.classname}`}
        </h2>
        {loading ? (
          <div className="no-grades-message">Loading grades...</div>
        ) : grades.length === 0 ? (
          <div className="no-grades-message">
            Grading criteria for this class has not been published yet.
          </div>
        ) : (
          <div className="grades-table">
            <div className="grades-header">
              <div className="header-item">Type</div>
              <div className="header-item">Score</div>
              <div className="header-item">Max Score</div>
              <div className="header-item">Percentage</div>
              <div className="header-item">Max Percentage</div>
            </div>

            {grades.map((g, index) => (
              <div key={index} className="grades-row">
                <div className="grade-cell">{g.type.toUpperCase()}</div>
                <div className="grade-cell">{g.score !== null ? g.score : "-"}</div>
                <div className="grade-cell">{g.max_score}</div>
                <div className="grade-cell">
                  {g.percent_score !== null ? g.percent_score + "%" : "-"}
                </div>
                <div className="grade-cell">{g.max_percent}%</div>
              </div>
            ))}

            <div className="grades-total">
              <div className="total-label">Total Percentage:</div>
              <div className="total-value">{total}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
