import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeAdmin from "./components/admin/Home/Home";
import HomeInstructor from "./components/instructor/Home/Home";
import HomeStudent from "./components/student/Home/Home";
import ViewCourse from "./components/admin/CourseManagement/ViewCourse";
import ViewAccount from "./components/admin/AccountManagement/ViewAccount";
import HomeLogin from "./components/auth/HomeLogin";
import EnsureLoggedToRoutes from "./components/auth/EnsureLoggedToRoutes";
import RoleBasedAuthorization from "./components/auth/RoleBasedAuthorization";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

import AddAccount from "./components/admin/AccountManagement/AddAccount";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Routes>
      {/* Common Routes */}
      <Route path="/" element={<HomeLogin />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/resetPassword" element={<ResetPassword />} />

      {/* Admin Routes */}
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
        path="/accountManagement/addAccount"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <AddAccount />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      <Route
        path="/courseManagement"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <ViewCourse />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      <Route
        path="/accountManagement"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <ViewAccount />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      {/* <Route
        path="/accountManagement/edit/:accountid"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <EditAccount />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      /> */}

      {/* Student Routes */}
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

      {/* Instructor Routes */}
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
