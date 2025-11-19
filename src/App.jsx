import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeAdmin from "./components/admin/Home/Home";
import HomeInstructor from "./components/instructor/Home/Home";
import HomeStudent from "./components/student/Home/Home";
import ViewClass from "./components/admin/ClassManagement/ViewClass";
import Menu from "./components/menu/Menu";
import menu_admin from "./assets/dataMenu/MenuAdminData";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/classManagement" element={<ViewClass />} />
          <Route path="/classManagement/addClass" element={<AddClass />} />
        </Routes>
      </Router>
      {/* <HomeAdmin></HomeAdmin> */}
      {/* <HomeStudent></HomeStudent> */}
      {/* <HomeInstructor></HomeInstructor> */}
    </>
  );
}

export default App;
