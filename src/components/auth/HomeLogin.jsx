import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthSession";
import Login from "./Login";

function HomeLogin() {
  const { loggedIn, user } = useContext(AuthContext);

  if (loggedIn && user) {
    if (user.role === "admin")
      return <Navigate to="/homepageAdmin" replace={true} />;
    if (user.role === "student")
      return <Navigate to="/homepageStudent" replace={true} />;
    if (user.role === "instructor")
      return <Navigate to="/homepageInstructor" replace={true} />;
  }
  return <Login />;
}

export default HomeLogin;
