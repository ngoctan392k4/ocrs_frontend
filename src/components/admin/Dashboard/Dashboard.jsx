import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import '../../../styles/Admin/Dashboard/Dashboard.css'
import StatisticsCard from "./StatisticsCard";
import ChartSection from "./ChartSection";
import statisticIcon from '../../../assets/icon/statistic.svg';

function Dashboard() {
  const [stats, setStats] = useState({
    totalstudent: 0,
    totalinstructor: 0,
    totalclass: 0,
    totalcourse: 0,
    totalopenedcourse: 0,
    totalregistration: 0,
    totalpaidtuition: 0,
    totalunpaidtuition: 0,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/statistic');
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu thống kê");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <Menu menus={menu_admin} />
      <div className="dashboard-content">
        <div className="dashboard-header-section">
          <div className="header-content">
            <h1 className="dashboard-title"><img src={statisticIcon} alt="" />Overview Dashboard</h1>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <section className="dashboard-stats-section">
          <h2 className="section-title">General Statistics</h2>
          <div className="stats-grid">
            <StatisticsCard
              title="No. Students"
              subtitle="Total of system"
              value={stats.totalstudent || 0}
              color="#5DADE2"
              icon="students"
            />
            <StatisticsCard
              title="No. Instructors"
              subtitle="Total of system"
              value={stats.totalinstructor || 0}
              color="#52BE80"
              icon="instructors"
            />
            <StatisticsCard
              title="No. Active Classes"
              subtitle="Current Semester"
              value={stats.totalclass || 0}
              color="#F39C12"
              icon="classes"
            />
            <StatisticsCard
              title="No. Active Courses"
              subtitle="Total of system"
              value={stats.totalcourse || 0}
              color="#E74C3C"
              icon="courses"
            />
            <StatisticsCard
              title="No. Opened Courses"
              subtitle="Current Semester"
              value={stats.totalopenedcourse || 0}
              color="#9B59B6"
              icon="opened"
            />
            <StatisticsCard
              title="No. Registrations"
              subtitle="Current Semester"
              value={stats.totalregistration || 0}
              color="#3498DB"
              icon="registration"
            />
            <StatisticsCard
              title="Paid Tuition"
              subtitle="Current Semester"
              value={`${(stats.totalpaidtuition || 0).toLocaleString()} VND`}
              color="#1ABC9C"
              icon="paid"
            />
            <StatisticsCard
              title="Unpaid Tuition"
              subtitle="Current Semester"
              value={`${(stats.totalunpaidtuition || 0).toLocaleString()} VND`}
              color="#E67E22"
              icon="unpaid"
            />
          </div>
        </section>

        <section className="dashboard-charts-section">
          <h2 className="section-title">Analytics Charts</h2>
          <ChartSection />
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
