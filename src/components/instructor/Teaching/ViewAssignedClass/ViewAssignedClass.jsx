import React, { useState, useEffect } from "react";
import Menu from "../../../menu/Menu";
import menu_instructor from "../../../../assets/dataMenu/MenuInstructorData";
import { useNavigate } from "react-router-dom";
import "../../../../styles/instructor/Teaching/ViewAssignedClass.css";
import mailBoxIcon from '../../../../assets/icon/mailbox.svg';

function ViewAssignedClass() {
  const navigate = useNavigate();
  const [semester, setSemester] = useState(null);
  const [searched, setSearched] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [assignedClass, setClasses] = useState([]);

  // Get current semester for displaying
  const fetchInitial = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/instructor/teaching/sem`
      );
      const data = await response.json();
      console.log(data);

      if (data.current_sem?.length > 0) {
        const sem = data.current_sem[0];
        console.log(sem);

        setSemester(sem);
      }
      if (data.message) {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  // Fetch current assigned classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!semester) return;
      try {
        const response = await fetch(
          `http://localhost:3001/api/instructor/teaching/assignedClass?semid=${semester.semid}`,
          { credentials: "include" }
        );
        const data = await response.json();

        setClasses(data.assigned_class || []);
        console.log("class: " + data.assigned_class);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchClasses();
  }, [semester]);

  // Apply search function by class name or class code
  const filteredClasses = assignedClass.filter((cls) => {
    const keyword = searched.toLowerCase();
    return (
      cls.classcode?.toLowerCase().includes(keyword) ||
      cls.classname?.toLowerCase().includes(keyword)
    );
  });

  // toggle assigned class
  const toggleClass = (id) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((clsid) => clsid !== id) : [...prev, id]
    );
  };

  // View list of students of the class
  const handleViewClass = async (classid) => {
    console.log(classid);
    navigate(`/myClasses/studentList/${encodeURIComponent(classid)}`)
  };

  return (
    <div className="view-assignedClass-container">
      <Menu menus={menu_instructor} />
      <div className="view-assignedClass-content">
        <h1 className="page-title">
          View Assigned Classes for
          {semester && ` ${semester.semester_name} - ${semester.school_year}`}
        </h1>

        <div className="filter-container">
          <input
            className="search-input"
            type="text"
            placeholder="Search by class code or name..."
            value={searched}
            onChange={(e) => setSearched(e.target.value)}
          />
        </div>

        {filteredClasses.length === 0 ? (
          <div className="table-wrapper">
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">No assigned classes</div>
              <div className="table-empty-subtext">No assigned classes for this semester</div>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class Code</th>
                  <th>Class Name</th>
                  <th>Schedule</th>
                  <th>Location</th>
                  <th>Students</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((cls) => (
                  <tr key={cls.clsid}>
                    <td className="table-cell-primary">{cls.classcode}</td>
                    <td>{cls.classname}</td>
                    <td className="table-cell-secondary">{cls.schedule || "-"}</td>
                    <td className="table-cell-secondary">{cls.classlocation || "-"}</td>
                    <td className="text-center">{cls.num || "-"}</td>
                    <td className="text-center">
                      <button
                        className="view-btn"
                        onClick={() => handleViewClass(cls.clsid)}
                        title="View student list"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewAssignedClass;
