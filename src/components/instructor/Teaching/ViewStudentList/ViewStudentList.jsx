import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Menu from "../../../menu/Menu";
import menu_instructor from "../../../../assets/dataMenu/MenuInstructorData";
import "../../../../styles/instructor/Teaching/ViewStudentList.css";
import mailBoxIcon from '../../../../assets/icon/mailbox.svg';

function ViewStudentList() {
  const { classID } = useParams();
  const [studentList, setStudentList] = useState([]);
  console.log(classID);

  // Get student list of the classID
  const fetchInitial = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/instructor/teaching/studentList`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ classID }),
        }
      );
      const data = await response.json();
      console.log(data.studentList);

      if (data.studentList?.length > 0) {
        setStudentList(data.studentList);
      } else {
        setStudentList([]);
      }
      if (data.message) {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, [classID]);


  return (
    <div className="view-studentList-container">
      <Menu menus={menu_instructor} />
      <div className="view-studentList-content">
        <h1 className="page-title">
          Student List - {classID.split("-").slice(0, 2).join("-")} ({classID.split("-").slice(2).join("-")})
        </h1>

        {studentList.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Date of Birth</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Major</th>
                  <th>Enrollment Year</th>
                </tr>
              </thead>
              <tbody>
                {studentList.map((student, index) => (
                  <tr key={index}>
                    <td className="table-cell-primary">{student.studentid}</td>
                    <td>{student.name}</td>
                    <td className="table-cell-secondary">{student.dob.split("T")[0]}</td>
                    <td className="table-cell-secondary">{student.emailaddress}</td>
                    <td className="table-cell-secondary">{student.phonenumber}</td>
                    <td className="table-cell-secondary">{student.major}</td>
                    <td className="text-center">{student.enrolmentyear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">No students enrolled</div>
              <div className="table-empty-subtext">There are no enrolled students in this class</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewStudentList;
