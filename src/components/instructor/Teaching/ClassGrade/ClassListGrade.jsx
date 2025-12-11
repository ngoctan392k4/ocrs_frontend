import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Menu from "../../../menu/Menu";
import menu_instructor from "../../../../assets/dataMenu/MenuInstructorData";
import "../../../../styles/instructor/Teaching/ViewStudentList.css";

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
        <h1>
          Grade List for {classID.split("-").slice(0, 2).join("-")} in{" "}
          {classID.split("-").slice(2).join("-")}
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
                Enter Grade
              </button>
            )}
          </div>
        )}

        {!isCurrentSem && (
          <p className="disabled-semester-msg">
            🔒 You can view grades but cannot edit because this class is not in the current semester.
          </p>
        )}

        {students.length > 0 ? (
          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  {GRADE_TYPES.map((type) => (
                    <th key={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {students.map((stu, index) => (
                  <tr key={stu.studentid}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{stu.studentid}</td>
                    <td>{stu.name}</td>

                    {GRADE_TYPES.map((type) => {
                      const originalScore =
                        gradesByStudent[stu.studentid]?.[type] ?? "";

                      const editedScore =
                        editedGrades[stu.studentid]?.[type] ??
                        originalScore ??
                        "";

                      return (
                        <td key={type}>
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={10}
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
          <h3>No students found for this class.</h3>
        )}
      </div>

      {showCancelDialog && (
        <div className="addclasscancel-dialog-backdrop">
          <div className="addclasscancel-dialog-box">
            <div>You have unsaved changes. Cancel?</div>
            <div className="addclasscancel-dialog-actions">
              <button
                className="cancel-dialog-no"
                onClick={() => setShowCancelDialog(false)}
              >
                No
              </button>
              <button
                className="cancel-dialog-yes"
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
