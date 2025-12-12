import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from './AuthSession'
import '../../styles/Menu.css'

export default function LogoutButton({ className }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Are you sure logout the system?")) {
      try {
        const response = await fetch("http://localhost:3001/api/auth/logout", {
          method: "POST",
          credentials: "include"
        });

        if (response.ok) {
          await logout();
          navigate("/");
        } else {
          alert("Logout failed");
        }
      } catch (error) {
        alert("An error occurred during logout. Please try again later");
      }
    }
  };

  const btnClass = className ? className : "logout-btn menuitem";

  return (
    <button
      className={btnClass}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}
