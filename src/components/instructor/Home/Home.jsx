import React from "react";
import Menu from "../../menu/Menu";
import menu_instructor from "../../../assets/dataMenu/MenuInstructorData";
import "../../../styles/Home.css";
export default function Home() {
  return (
    <div className="home-container">
      <Menu menus={menu_instructor} />

      <div className="home-content">
        <h1 className="home-title">Instructor Homepage</h1>
        <p className="home-desc">
          The system allows management of teaching schedule, classes and grades. <br/>
          Use the left menu to access the functions.
        </p>

        <h2 className="home-subtitle">Quick Start</h2>

        <ul className="home-list">
          <li>
            📌 Go to <strong>View Schedule</strong> to view teaching schedule.
          </li>
          <li>
            📌 Go to <strong>Teaching</strong> manage classes and grades for each class.
          </li>
        </ul>
      </div>
    </div>
  );
}
