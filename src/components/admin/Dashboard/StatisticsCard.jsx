import React from "react";
import '../../../styles/Admin/Dashboard/Dashboard.css'
import classIcon from '../../../assets/icon/class.svg'
import courseIcon from '../../../assets/icon/course.svg'
import instrucIcon from '../../../assets/icon/instruc.svg'
import openedIcon from '../../../assets/icon/opend.svg'
import paidIcon from '../../../assets/icon/paid.svg'
import regisIcon from '../../../assets/icon/regis.svg'
import studentIcon from '../../../assets/icon/students.svg'
import unpaidIcon from '../../../assets/icon/unpaid.svg'

function StatisticsCard({ title, subtitle, value, color, icon }) {
  const getIconElement = () => {
    const iconMap = {
      students: studentIcon,
      instructors: instrucIcon,
      classes: classIcon,
      courses: courseIcon,
      opened: openedIcon,
      registration: regisIcon,
      paid: paidIcon,
      unpaid: unpaidIcon,
    };
    return <img src={iconMap[icon]} alt={icon} />;
  };

  return (
    <div className="statistics-card" style={{ borderLeftColor: color }}>
      <div className="card-top-section">
        <div className="card-icon-wrapper" style={{ backgroundColor: `${color}20` }}>
          <span className="card-icon">{getIconElement()}</span>
        </div>
        <div className="card-header">
          <span className="card-title">{title}</span>
          <span className="card-sub-title">{subtitle}</span>
        </div>
      </div>
      <div className="card-body">
        <div className="card-value">{value}</div>
      </div>
      <div className="card-accent" style={{ backgroundColor: color }}></div>
    </div>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '93, 173, 226';
}

export default StatisticsCard;
