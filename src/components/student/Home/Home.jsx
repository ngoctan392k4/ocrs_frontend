import React from "react";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/Home.css";
export default function Home() {
  return (
    <div className="home-container">
      <Menu menus={menu_student} />

      <div className="home-content">
        <h1 className="home-title">Student Homepage</h1>
        <p className="home-desc">
          The system allows management of schedule, study transcripts, payment and supports course registration. <br/>
          Use the left menu to access the functions.
        </p>

        <h2 className="home-subtitle">Quick Start</h2>

        <ul className="home-list">
          <li>
            📌 Go to <strong>Course Registration</strong> to view available course for upcoming semester, register classes and manage registered classes.
          </li>
          <li>
            📌 Go to <strong>View Schedule</strong> view study schedule.
          </li>
          <li>
            📌 Go to <strong>Study</strong> to view overall and detailed academic transcript.
          </li>
          <li>
            📌 Go to <strong>Payment</strong> to pay tuition fees and manage payment history.
          </li>
        </ul>
      </div>
    </div>
  );
}
