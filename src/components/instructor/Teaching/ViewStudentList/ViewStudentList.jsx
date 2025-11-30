import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Menu from "../../../menu/Menu";
import menu_instructor from "../../../../assets/dataMenu/MenuInstructorData";
import "../../../../styles/instructor/Teaching/ViewStudentList.css";

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
        <h1>
          Student List class {classID.split("-").slice(0, 2).join("-")} in{" "}
          {classID.split("-").slice(2).join("-")}
        </h1>

        {studentList.length > 0 ? (
          <div className="table-wrapper">
            <table className="student-table">
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
                    <td>{student.studentid}</td>
                    <td>{student.name}</td>
                    <td>{student.dob.split("T").slice(0, 1)}</td>
                    <td>{student.emailaddress}</td>
                    <td>{student.phonenumber}</td>
                    <td>{student.major}</td>
                    <td>{student.enrolmentyear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <h3>There are no enrolled students in the class</h3>
        )}
      </div>
    </div>
  );
}

export default ViewStudentList;
