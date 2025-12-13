import React from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import "../../../styles/Home.css";
export default function Home() {
  return (
    <div className="home-container">
      <Menu menus={menu_admin} role="admin" />

      <div className="home-content">
        <div className="dashboard-grid">
          <section className="dashboard-main">
            <header
              className="dashboard-header home-hero"
              style={{ "--home-hero-bg": "url('/assets/anhtruong.jpg')" }}
            >
              <div>
                <h1 className="home-title">Admin Homepage</h1>
                <p className="home-desc">
                  The system allows management of students, instructors,
                  classes, and tuition fee tracking. <br />
                  Use the left menu to access the functions.
                </p>
              </div>
            </header>

            <div className="feature-row">
              <div className="feature-card">
                <div className="feature-title">Founded 2025</div>
                <div className="feature-sub">
                  A long tradition of higher education and community service.
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-title">Research Focus</div>
                <div className="feature-sub">
                  Active research centers and partnerships with industry.
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-title">Global Alumni</div>
                <div className="feature-sub">
                  An international network of graduates and collaborators.
                </div>
              </div>
            </div>

            <div className="card quick-card">
              <h2 className="home-subtitle">Quick Start</h2>
              <ul className="home-list">
                <li>
                  📌 Go to <strong>Dashboard</strong> to view the current system
                  performance.
                </li>
                <li>
                  📌 Go to <strong>Course Management</strong> to view, add, edit
                  and open courses.
                </li>
                <li>
                  📌 Go to <strong>Class Management</strong> view, add, and edit
                  classes.
                </li>
                <li>
                  📌 Go to <strong>Account Management</strong> to view, add and
                  edit accounts.
                </li>
                <li>
                  📌 Go to <strong>Payment Management</strong> to manage tuition
                  payments.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
