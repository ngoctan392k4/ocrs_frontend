import React, { useEffect, useState } from "react";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/student/ViewTranscript/OverallTranscript.css";

export default function OverallTranscript() {
  const [semesters, setSemesters] = useState([]);
  const [allGrades, setAllGrades] = useState({}); // lưu grades theo semid
  const [overallGrades, setOverallGrades] = useState({}); // lưu Overall Summary từ DB

  /* --------------------------------------------
      Fetch danh sách semester + tất cả grades
  -----------------------------------------------*/
  async function fetchAllData() {
    try {
      const resSem = await fetch(
        `http://localhost:3001/api/student/transcript/overallTranscript`,
        { credentials: "include" }
      );
      const dataSem = await resSem.json();
      setSemesters(dataSem.allSem || []);

      // fetch grades cho từng kỳ
      const gradesObj = {};
      for (let sem of dataSem.allSem || []) {
        try {
          const resGrades = await fetch(
            `http://localhost:3001/api/student/transcript/overallTranscript/getgrade?semid=${sem.semid}`,
            { credentials: "include" }
          );
          const dataGrades = await resGrades.json();
          gradesObj[sem.semid] = dataGrades.grade || [];

          // Lưu Overall Summary từ DB (chỉ cần 1 lần, giống nhau cho tất cả kỳ)
          if (Object.keys(overallGrades).length === 0 && dataGrades.overgrade.length) {
            setOverallGrades(dataGrades.overgrade[0]);
          }
        } catch (err) {
          gradesObj[sem.semid] = [];
          console.error(err);
        }
      }
      setAllGrades(gradesObj);
    } catch (err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  /* --------------------------------------------
      Hàm lấy summary semester từ DB function
  -----------------------------------------------*/
  function getSemesterSummary(grades) {
    if (!grades.length) {
      return {
        totalCreditsWithPoints: "-",
        avgScore10: "-",
        cumulativeGPA: "-",
        totalCredits: "-",
        totalCreditsNotGraded: 0,
      };
    }
    const first = grades[0];
    return {
      totalCreditsWithPoints:
        first.total_credits_with_points != null
          ? first.total_credits_with_points
          : "-",
      avgScore10: first.avg_score10 != null ? first.avg_score10.toFixed(2) : "-",
      cumulativeGPA:
        first.cumulative_gpa != null ? first.cumulative_gpa.toFixed(2) : "-",
      totalCredits:
        first.total_credits != null ? first.total_credits : "-",
      totalCreditsNotGraded:
        first.total_credits_not_graded != null
          ? first.total_credits_not_graded
          : 0,
    };
  }
  function getOverallSummary() {
    if (!overallGrades || Object.keys(overallGrades).length === 0) {
      return {
        totalCreditsWithPoints: "-",
        avgScore10: "-",
        cumulativeGPA: "-",
        totalCredits: "-",
        totalCreditsNotGraded: 0,
      };
    }
    return {
      totalCreditsWithPoints:
        overallGrades.total_credits_with_points ?? "-",
      avgScore10:
        overallGrades.avg_score10 != null
          ? overallGrades.avg_score10.toFixed(2)
          : "-",
      cumulativeGPA:
        overallGrades.cumulative_gpa != null
          ? overallGrades.cumulative_gpa.toFixed(2)
          : "-",
      totalCredits: overallGrades.total_credits_all_semesters ?? "-",
      totalCreditsNotGraded:
        overallGrades.total_credits_not_graded ?? 0,
    };
  }

  const sortedSemesters = semesters.slice().sort((a, b) =>
    a.semid.localeCompare(b.semid)
  );

  return (
    <div className="overallTranscript-container">
      <Menu menus={menu_student} />

      <div className="overallTranscript-content">
        <h1 className="otr-title">Student Transcript</h1>

        {sortedSemesters.map((sem) => {
          const grades = allGrades[sem.semid] || [];
          const summary = getSemesterSummary(grades);

          return (
            <div key={sem.semid} className="semester-block">
              {/* Hiển thị semester + school year */}
              <div className="otr-semester-title">
                Semester: {sem.semid}
              </div>

              {/* Table điểm */}
              <div className="otr-table-area">
                <div className="otr-table-header">
                  <div className="left-align">Course Code</div>
                  <div className="left-align">Class Code</div>
                  <div className="left-align">Class Name</div>
                  <div className="center-align">Credit Number</div>
                  <div className="center-align">Origin Grade</div>
                  <div className="center-align">Letter Grage</div>
                  <div className="center-align">Convert Grade</div>
                  <div className="center-align">Accumulated Score</div>
                </div>

                {grades.length === 0 ? (
                  <div className="otr-empty">No transcript available.</div>
                ) : (
                  grades.map((c, i) => (
                    <div key={i} className="otr-table-row">
                      <div className="left-align">{c.courseid}</div>
                      <div className="left-align">{c.classcode}</div>
                      <div className="left-align">{c.classname}</div>
                      <div className="center-align">{c.total_credits || "-"}</div>
                      <div className="center-align">
                        {c.score10?.toFixed(2) || "-"}
                      </div>
                      <div className="center-align">{c.letter_grade || "-"}</div>
                      <div className="center-align">
                        {c.score4?.toFixed(2) || "-"}
                      </div>
                      <div className="center-align">
                        {c.gpa_credits?.toFixed(2) || "-"}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Semester Summary */}
              <div className="otr-summary">
                <div className="otr-summary-table">
                  <div className="otr-summary-row">
                    <div className="left-col">Total number of credits with points</div>
                    <div className="right-col">{summary.totalCreditsWithPoints}</div>
                  </div>
                  <div className="separator"></div>

                  <div className="otr-summary-row">
                    <div className="left-col">Average Score 10-based</div>
                    <div className="right-col">{summary.avgScore10}</div>
                  </div>
                  <div className="separator"></div>

                  <div className="otr-summary-row">
                    <div className="left-col">Cumulative Grade Point Average</div>
                    <div className="right-col">{summary.cumulativeGPA}</div>
                  </div>
                  <div className="separator"></div>

                  <div className="otr-summary-row">
                    <div className="left-col">Total number of credits</div>
                    <div className="right-col">{summary.totalCredits}</div>
                  </div>
                  <div className="separator"></div>

                  <div className="otr-summary-row last-row">
                    <div className="left-col">Total number of credits not graded</div>
                    <div className="right-col">{summary.totalCreditsNotGraded}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Overall Summary */}
        <div className="otr-summary">
          <h2>Overall Summary</h2>
          <div className="otr-summary-table">
            {(() => {
              const overall = getOverallSummary();
              return (
                <>
                  <div className="otr-summary-row">
                    <div className="left-col">Total number of credits with points</div>
                    <div className="right-col">{overall.totalCreditsWithPoints}</div>
                  </div>
                  <div className="separator"></div>
                  <div className="otr-summary-row">
                    <div className="left-col">Average Score 10-based</div>
                    <div className="right-col">{overall.avgScore10}</div>
                  </div>
                  <div className="separator"></div>
                  <div className="otr-summary-row">
                    <div className="left-col">Cumulative Grade Point Average</div>
                    <div className="right-col">{overall.cumulativeGPA}</div>
                  </div>
                  <div className="separator"></div>
                  <div className="otr-summary-row">
                    <div className="left-col">Total number of credits</div>
                    <div className="right-col">{overall.totalCredits}</div>
                  </div>
                  <div className="separator"></div>
                  <div className="otr-summary-row last-row">
                    <div className="left-col">Total number of credits not graded</div>
                    <div className="right-col">{overall.totalCreditsNotGraded}</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
