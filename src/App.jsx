import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeAdmin from "./components/admin/Home/Home";
import HomeInstructor from "./components/instructor/Home/Home";
import HomeStudent from "./components/student/Home/Home";
import ViewClass from "./components/admin/ClassManagement/ViewClass";
import ViewCourse from "./components/admin/CourseManagement/ViewCourse";
import Menu from "./components/menu/Menu";
import menu_admin from "./assets/dataMenu/MenuAdminData";
import ViewAccount from "./components/admin/AccountManagement/ViewAccount";
import HomeLogin from "./components/auth/HomeLogin";
import EnsureLoggedToRoutes from "./components/auth/EnsureLoggedToRoutes";
import RoleBasedAuthorization from "./components/auth/RoleBasedAuthorization";
import AddCourse from "./components/admin/CourseManagement/AddCourse";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import AddClass from "./components/admin/ClassManagement/AddClass";
import EditClass from "./components/admin/ClassManagement/EditClass";
import AddAccount from "./components/admin/AccountManagement/AddAccount";
import EditCourse from "./components/admin/CourseManagement/EditCourse";
import ViewRegistered from "./components/student/ClassRegistration/RegisteredClass"
import EditAccount from "./components/admin/AccountManagement/EditAccount";
import OpenCourse from "./components/admin/OpenCourse/OpenCourse";
import ClassRegistration from "./components/student/ClassRegistration/ClassRegistration";
import ViewAssignedClass from "./components/instructor/Teaching/ViewAssignedClass/ViewAssignedClass";
import ViewStudentList from "./components/instructor/Teaching/ViewStudentList/ViewStudentList";
import TeachingSchedule from "./components/instructor/Schedule/teachingSchedule";
import StudySchedule from "./components/student/Schedule/studySchedule";

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
        path="/accountManagement"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <ViewAccount />
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
        path="/accountManagement/edit/:accountid"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <EditAccount />
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
        path="/courseManagement/addCourse"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <AddCourse />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      <Route
        path="/courseManagement/editCourse/:courseid"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <EditCourse />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      <Route
        path="/ClassManagement/editClass/:clsid"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <EditClass />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

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

      <Route
        path="/classManagement/addClass"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <AddClass />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      <Route
        path="/openCourse"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["admin"]}>
              <OpenCourse />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

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

      <Route
        path="/register"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["student"]}>
              <ClassRegistration />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      <Route
        path="/registeredClass"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["student"]}>
              <ViewRegistered />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      <Route
        path="studySchedule"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["student"]}>
              <StudySchedule />
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


      <Route
        path="/myClasses"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["instructor"]}>
              <ViewAssignedClass />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      <Route
        path="/myClasses/studentList/:classID"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["instructor"]}>
              <ViewStudentList />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />

      <Route
        path="teachingSchedule"
        element={
          <EnsureLoggedToRoutes>
            <RoleBasedAuthorization allowRole={["instructor"]}>
              <TeachingSchedule />
            </RoleBasedAuthorization>
          </EnsureLoggedToRoutes>
        }
      />
    </Routes>
  );
}

export default App;
