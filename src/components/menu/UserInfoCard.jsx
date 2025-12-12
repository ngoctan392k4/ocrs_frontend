import React, { useContext } from "react";
import { AuthContext } from "../auth/AuthSession";
import "../../styles/UserInfoCard.css";

const UserInfoCard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  // Ưu tiên lấy name, full_name từ database
  const userName = user.username;

  // Get role with proper formatting
  const userRole = user.role || "Guest";
  const formattedRole =
    userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase();
  const getRoleConfig = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return { class: "role-badge-admin", icon: "👑" };
      case "instructor":
        return { class: "role-badge-instructor", icon: "📚" };
      case "student":
        return { class: "role-badge-student", icon: "🎓" };
      default:
        return { class: "role-badge-default", icon: "👤" };
    }
  };

  const roleConfig = getRoleConfig(formattedRole);
  console.log("UserInfoCard render with user:", user);

  return (
    <div className="user-info-card">
      <div className="user-details">
        <div className="user-name-wrapper">
          <div className="user-name" title={userName}>
            {userName}
          </div>
        </div>
        <span className={`role-badge ${roleConfig.class}`}>
          <span className="role-icon">{roleConfig.icon}</span>
          <span className="role-text">{formattedRole}</span>
        </span>
      </div>
    </div>
  );
};

export default UserInfoCard;
