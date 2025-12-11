import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Menu from "../../../menu/Menu";
import menu_instructor from "../../../../assets/dataMenu/MenuInstructorData";
import "../../../../styles/instructor/Teaching/ViewStudentList.css";
import mailBoxIcon from '../../../../assets/icon/mailbox.svg'

function ClassListGrade() {
  const { classID } = useParams();
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGrades, setEditedGrades] = useState({});
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [currentSem, setCurrentSem] = useState("");
  const [isCurrentSem, setIsCurrentSem] = useState(false);

  const GRADE_TYPES = ["attendance", "regular", "project", "midterm", "final"];

  // Fetch student list
  const fetchStudents = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/instructor/classgrade/studentList`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classID }),
        }
      );
      const data = await res.json();
      setStudents(data.studentList || []);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch grade list
  const fetchGrades = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/instructor/classgrade/gradeList`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classID }),
        }
      );
      const data = await res.json();
      setGrades(data.gradeList || []);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch current semester
  const fetchCurrentSemester = async () => {
    try {
      const res = await fetch(
        "http://localhost:3001/api/instructor/classgrade/sem"
      );
      const data = await res.json();

      if (data.current_sem?.length > 0) {
        const semid = data.current_sem[0].semid;
        setCurrentSem(semid);

        const classSem = classID.split("-").slice(2).join("-").trim();
        setIsCurrentSem(classSem === semid);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchGrades();
    fetchCurrentSemester();
  }, [classID]);

  // Build grade map
  const gradesByStudent = {};
  grades.forEach((g) => {
    if (!gradesByStudent[g.studentid]) {
      gradesByStudent[g.studentid] = {};
    }
    gradesByStudent[g.studentid][g.grade_type] = g.score;
  });

  // Handle grade input change
  const handleGradeChange = (studentid, gradeType, value) => {
    setEditedGrades((prev) => ({
      ...prev,
      [studentid]: {
        ...(prev[studentid] || {}),
        [gradeType]: value, // giữ nguyên value để "" được gửi đúng
      },
    }));
  };

  // Submit grade update
  const handleSubmitGrades = async () => {
    try {
      for (let studentid in editedGrades) {
        for (let gradeType in editedGrades[studentid]) {
          const newScore = editedGrades[studentid][gradeType];

          await fetch(
            "http://localhost:3001/api/instructor/classgrade/editgrade",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                studentID: studentid,
                classID,
                gradeType,
                newScore:
                  newScore === "" || newScore === null
                    ? null
                    : Number(newScore),
              }),
            }
          );
        }
      }

      setIsEditing(false);
      setEditedGrades({});
      alert("Grades updated successfully!");
      fetchGrades();
    } catch (error) {
      console.log(error);
      alert("Error updating grades");
    }
  };

  // Confirm cancel edit
  const handleConfirmCancel = () => {
    setIsEditing(false);
    setEditedGrades({});
    setShowCancelDialog(false);
  };

  return (
    <div className="view-studentList-container">
      <Menu menus={menu_instructor} />

      <div className="view-studentList-content">
        <h1 className="page-title">
          Grade List - {classID.split("-").slice(0, 2).join("-")} ({classID.split("-").slice(2).join("-")})
        </h1>

        {/* BUTTON GROUP */}
        {isCurrentSem && (
          <div className="grade-button-group">
            <button
              onClick={() => {
                if (isEditing) {
                  setShowCancelDialog(true);
                } else {
                  setIsEditing(true);
                }
              }}
              className="edit-grade-button"
            >
              {isEditing ? "Cancel Edit" : "Edit Grade"}
            </button>

            {isEditing && (
              <button onClick={handleSubmitGrades} className="submit-grade-button">
                Submit Grades
              </button>
            )}
          </div>
        )}

        {!isCurrentSem && (
          <p className="disabled-semester-msg">
            You can view grades but cannot edit because this class is not in the current semester.
          </p>
        )}

        {students.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  {GRADE_TYPES.map((type) => (
                    <th key={type} style={{ textAlign: 'center' }}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {students.map((stu, index) => (
                  <tr key={stu.studentid}>
                    <td className="text-center" style={{ fontWeight: 600 }}>{String(index + 1).padStart(2, "0")}</td>
                    <td className="table-cell-primary">{stu.studentid}</td>
                    <td>{stu.name}</td>

                    {GRADE_TYPES.map((type) => {
                      const originalScore =
                        gradesByStudent[stu.studentid]?.[type] ?? "";

                      const editedScore =
                        editedGrades[stu.studentid]?.[type] ??
                        originalScore ??
                        "";

                      return (
                        <td key={type} className="text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={10}
                              className="grade-input"
                              value={
                                editedScore === null ||
                                editedScore === undefined
                                  ? ""
                                  : editedScore
                              }
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "+")
                                  e.preventDefault();
                              }}
                              onInput={(e) => {
                                if (e.target.value < 0) e.target.value = 0;
                                if (e.target.value > 10) e.target.value = 10;
                              }}
                              onChange={(e) =>
                                handleGradeChange(
                                  stu.studentid,
                                  type,
                                  e.target.value
                                )
                              }
                            />
                          ) : originalScore === "" ? (
                            "-"
                          ) : (
                            originalScore
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">No students found</div>
              <div className="table-empty-subtext">No students enrolled in this class</div>
            </div>
          </div>
        )}
      </div>

      {showCancelDialog && (
        <div className="dialog-backdrop">
          <div className="dialog-box">
            <div className="dialog-message">You have unsaved changes. Cancel?</div>
            <div className="dialog-actions">
              <button
                className="dialog-btn cancel-btn"
                onClick={() => setShowCancelDialog(false)}
              >
                No
              </button>
              <button
                className="dialog-btn delete-confirm-btn"
                onClick={handleConfirmCancel}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassListGrade;
