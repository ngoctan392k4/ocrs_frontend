import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeAdmin from "./components/admin/Home/Home";
import HomeInstructor from "./components/instructor/Home/Home";
import HomeStudent from "./components/student/Home/Home";
import ViewCourse from "./components/admin/CourseManagement/ViewCourse";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      {/* <HomeAdmin></HomeAdmin> */}
      {/* <HomeStudent></HomeStudent> */}
      {/* <HomeInstructor></HomeInstructor> */}
    </>
  );
}

export default App;
