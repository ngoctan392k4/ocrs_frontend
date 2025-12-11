import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/student/ViewTranscript/DetailTranscript.css";
import mailBoxIcon from '../../../assets/icon/mailbox.svg';

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
    <div className="detail-transcript-container">
      <Menu menus={menu_student} />

      <div className="detail-transcript-content">
        <h1 className="detail-transcript-title">Detail Transcript</h1>

        <div className="table-wrapper">
          {loading ? (
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading grades...</p>
            </div>
          ) : grades.length === 0 ? (
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">No grades available</div>
              <div className="table-empty-subtext">Grading criteria for this class has not been published yet</div>
            </div>
          ) : (
            <>
              <div className="transcript-info">
                <span className="info-label">Class:</span>
                <span className="info-value">{classes.courseid} - {classes.classname}</span>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Score</th>
                    <th>Max Score</th>
                    <th>Percentage</th>
                    <th>Max Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g, index) => (
                    <tr key={index}>
                      <td className="table-cell-primary">{g.type.toUpperCase()}</td>
                      <td className="table-cell-secondary">{g.score !== null ? g.score : "-"}</td>
                      <td className="table-cell-secondary">{g.max_score}</td>
                      <td className="table-cell-secondary">
                        {g.percent_score !== null ? g.percent_score + "%" : "-"}
                      </td>
                      <td className="table-cell-secondary">{g.max_percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="transcript-total">
                <span className="total-label">Total Percentage:</span>
                <span className="total-value">{total}%</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
