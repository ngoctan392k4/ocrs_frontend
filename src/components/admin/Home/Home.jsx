import React from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import "../../../styles/Home.css";
export default function Home() {
  return (
    <div className="home-container">
      <Menu menus={menu_admin} />

      <div className="home-content">
        <h1 className="home-title">Admin Homepage</h1>
        <p className="home-desc">
          The system allows management of students, instructors, classes, and
          tuition fee tracking. <br/>
          Use the left menu to access the functions.
        </p>

        <h2 className="home-subtitle">Quick Start</h2>

        <ul className="home-list">
          <li>
            📌 Go to <strong>Course Management</strong> to view, add, edit and open courses.
          </li>
          <li>
            📌 Go to <strong>Class Management</strong> view, add, and edit classes.
          </li>
          <li>
            📌 Go to <strong>Account Management</strong> to view, add and edit accounts.
          </li>
          <li>
            📌 Go to <strong>Payment Management</strong> to manage tuition payments.
          </li>
        </ul>
      </div>
    </div>
  );
}
