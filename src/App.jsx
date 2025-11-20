import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeAdmin from "./components/admin/Home/Home";
import HomeInstructor from "./components/instructor/Home/Home";
import HomeStudent from "./components/student/Home/Home";
import ViewClass from "./components/admin/ClassManagement/ViewClass";
import Menu from "./components/menu/Menu";
import menu_admin from "./assets/dataMenu/MenuAdminData";
import HomeLogin from "./components/auth/HomeLogin";
import EnsureLoggedToRoutes from "./components/auth/EnsureLoggedToRoutes";
import RoleBasedAuthorization from "./components/auth/RoleBasedAuthorization";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";



function App() {
  const [count, setCount] = useState(0);

  return (
    <Routes>
      <Route path="/" element={<HomeLogin />} />


      <Route
        path="/classManagement"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <ViewClass />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/resetPassword" element={<ResetPassword />} />
      
      <Route
        path="/homepageAdmin"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <HomeAdmin />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      <Route
        path="/courseManagement" element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <ViewCourse />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />
 
      <Route
        path="/homepageStudent"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["student"]}>
              <HomeStudent />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      <Route
        path="/homepageInstructor"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["instructor"]}>
              <HomeInstructor />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />
    </Routes>
  );
}

export default App;
