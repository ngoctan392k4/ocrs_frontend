import React from "react";
import Menu from "../../menu/Menu";
import menu_instructor from "../../../assets/dataMenu/MenuInstructorData";
import "../../../styles/Home.css";
export default function Home() {
  return (
    <div className="home-container">
      <Menu menus={menu_instructor} role="instructor" />

      <div className="home-content">
        <div className="dashboard-grid">
          <section className="dashboard-main">
            <header
              className="dashboard-header home-hero"
              style={{ "--home-hero-bg": "url('/assets/anhtruong.jpg')" }}
            >
              <div>
                <h1 className="home-title">Instructor Homepage</h1>
                <p className="home-desc">
                  The system allows management of teaching schedule, classes and
                  grades. <br />
                  Use the left menu to access the functions.
                </p>
              </div>
            </header>
            <div className="feature-row">
              <div className="feature-card">
                <div className="feature-title">Established 2025</div>
                <div className="feature-sub">
                  Providing strong pedagogical support and facilities.
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-title">Teaching Excellence</div>
                <div className="feature-sub">
                  Emphasis on effective teaching and student engagement.
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-title">Professional Development</div>
                <div className="feature-sub">
                  Opportunities for continuous learning and training.
                </div>
              </div>
            </div>

            <div className="card quick-card">
              <h2 className="home-subtitle">Quick Start</h2>
              <ul className="home-list">
                <li>
                  📌 Go to <strong>View Schedule</strong> to view teaching
                  schedule.
                </li>
                <li>
                  📌 Go to <strong>Teaching</strong> manage classes and grades
                  for each class.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
