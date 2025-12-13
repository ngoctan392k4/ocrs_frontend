import React from "react";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/Home.css";
import Chatbot from "../Chatbot/Chatbot";

export default function Home() {
  return (
    <div className="home-container">
      <Menu menus={menu_student} role="student" />

      <div className="home-content">
        <div className="dashboard-grid">
          <section className="dashboard-main">
            <header
              className="dashboard-header home-hero"
              style={{ "--home-hero-bg": "url('/assets/anhtruong.jpg')" }}
            >
              <div>
                <h1 className="home-title">Student Homepage</h1>
                <p className="home-desc">
                  The system allows management of schedule, study transcripts,
                  payment and supports course registration. <br />
                  Use the left menu to access the functions.
                </p>
              </div>
            </header>

            <div className="feature-row">
              <div className="feature-card">
                <div className="feature-title">Established 2025</div>
                <div className="feature-sub">
                  Decades of experience educating students across many
                  disciplines.
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-title">Academic Excellence</div>
                <div className="feature-sub">
                  A commitment to research, teaching quality and student
                  success.
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-title">Extensive Library</div>
                <div className="feature-sub">
                  A large collection of resources supporting learning and
                  research.
                </div>
              </div>
            </div>

            <div className="card quick-card">
              <h2 className="home-subtitle">Quick Start</h2>
              <ul className="home-list">
                <li>
                  📌 Go to <strong>Course Registration</strong> to view
                  available course for upcoming semester, register classes and
                  manage registered classes.
                </li>
                <li>
                  📌 Go to <strong>View Schedule</strong> view study schedule.
                </li>
                <li>
                  📌 Go to <strong>Study</strong> to view overall and detailed
                  academic transcript.
                </li>
                <li>
                  📌 Go to <strong>Payment</strong> to pay tuition fees and
                  manage payment history.
                </li>
              </ul>
            </div>
          </section>

          <div className="chatbot-float">
            <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );
}
