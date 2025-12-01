import React, { useState, useEffect } from "react";
import Menu from "../../../menu/Menu";
import menu_instructor from "../../../../assets/dataMenu/MenuInstructorData";
import { useNavigate } from "react-router-dom";
import "../../../../styles/instructor/Teaching/ViewAssignedClass.css";

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
        <h1>
          View Assigned Classes for
          {semester && ` ${semester.semester_name} - ${semester.school_year}`}
        </h1>
        <input
          className="view-assignedClasssearch-bar"
          type="text"
          placeholder="Search Class"
          value={searched}
          onChange={(e) => setSearched(e.target.value)}
        />

        <div className="view-assignedClass-list">
          {filteredClasses.length === 0 && (
            <div className="no-classes-message">
              There are no assigned classes for the current semester
            </div>
          )}

          {filteredClasses.map((cls) => (
            <div
              key={cls.clsid}
              className="view-assignedClass-item"
              onClick={() => toggleClass(cls.clsid)}
            >
              <div className="view-assignedClass-header">
                <div className="view-assignedClass-name">
                  {cls.classname} - {cls.classcode?.split("-")[1]}
                </div>

                <span
                  className="view-studentList-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClass(cls.clsid);
                  }}
                >
                  View Student List
                </span>
              </div>

              {/* Detailed infor of class */}
              {selectedClasses.includes(cls.clsid) && (
                <div className="view-assignedClass-detail">
                  <div className="view-assignedClassdetail-row">
                    <span className="view-assignedClass-info-label">
                      Class Code:
                    </span>
                    <span className="view-assignedClass-info-text">
                      {cls.classcode}
                    </span>
                  </div>

                  <div className="view-assignedClassdetail-row">
                    <span className="view-assignedClass-info-label">
                      Schedule:
                    </span>
                    <span className="view-assignedClass-info-text">
                      {cls.schedule}
                    </span>
                  </div>

                  <div className="view-assignedClassdetail-row">
                    <span className="view-assignedClass-info-label">
                      Location:
                    </span>
                    <span className="view-assignedClass-info-text">
                      {cls.classlocation}
                    </span>
                  </div>

                  <div className="view-assignedClassdetail-row">
                    <span className="view-assignedClass-info-label">
                      Number of Enrollments:
                    </span>
                    <span className="view-assignedClass-info-text">
                      {cls.num}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewAssignedClass;
