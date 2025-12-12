import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ChartSection() {
  const [major, setMajor] = useState([]);
  const [regisCourse, setRegisCourse] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialFetch = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/admin/majorDistribution"
        );
        const response_2 = await fetch(
          "http://localhost:3001/api/admin/enrollment"
        );
        const data = await response.json();
        const data_2 = await response_2.json();

        setMajor(data);
        setRegisCourse(data_2);
      } catch (err) {
        setError("Error with statistics");
      }
    };

    initialFetch();
  }, []);

  const COLORS = [
    "#5DADE2",
    "#52BE80",
    "#F39C12",
    "#E74C3C",
    "#9B59B6",
    "#3498DB",
    "#1ABC9C",
    "#E67E22",
  ];

  return (
    <div className="charts-container">
      {/* Bar Chart */}
      <div className="chart-card chart-card-bar">
        <div className="chart-header">
          <h3 className="chart-title">Course Registration Distribution</h3>
          <p className="chart-subtitle">Current Semester</p>
        </div>
        <div className="chart-wrapper">
          {regisCourse.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={regisCourse}
                margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5DADE2" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#2E86C1" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E0E7FF"
                  vertical={false}
                />
                <XAxis
                  dataKey="coursename"
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={{ stroke: "#E0E7FF" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={{ stroke: "#E0E7FF" }}
                />
                <Bar
                  dataKey="totalstudent"
                  fill="url(#barGradient)"
                  radius={[12, 12, 0, 0]}
                  name="Student Count"
                  barSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-loading">Loading data...</div>
          )}
        </div>
      </div>

      {/* Pie Chart */}
      <div className="chart-card chart-card-pie">
        <div className="chart-header">
          <h3 className="chart-title">Major Distribution</h3>
          <p className="chart-subtitle">Percentage Distribution</p>
        </div>
        <div className="chart-wrapper-pie">
          {major.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={major}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  dataKey="total"
                  nameKey="major"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {major.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-loading">Loading...</div>
          )}
        </div>
        {major.length > 0 && (
          <div className="chart-legend pie-legend">
            {major.map((course, index) => (
              <div className="legend-item" key={index}>
                <span
                  className="legend-color"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <div className="legend-info">
                  <span className="legend-name">{course.major}</span>
                  <span className="legend-count">{course.total} students</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartSection;
