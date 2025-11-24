import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../auth/AuthSession'

export default function LogoutButton() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();   
      navigate("/");     
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--color-red-500)",
      }}
    >
      Logout
    </button>
  );
}
