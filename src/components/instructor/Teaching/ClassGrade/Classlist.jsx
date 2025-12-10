import React, { useState, useEffect } from "react";
import Menu from "../../../menu/Menu";
import menu_instructor from "../../../../assets/dataMenu/MenuInstructorData";
import { useNavigate } from "react-router-dom";
import "../../../../styles/instructor/Teaching/ViewAssignedClass.css";

function Classlist() {
  const navigate = useNavigate();

  const [semester, setSemester] = useState(null); // current sem
  const [semList, setSemList] = useState([]); // all sem
  const [selectedSem, setSelectedSem] = useState(null); // filter semid

  const [searched, setSearched] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [assignedClass, setClasses] = useState([]);

  // Load current semester + all semesters
  const fetchInitial = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/instructor/classgrade/sem`
      );
      const data = await response.json();

      if (data.current_sem?.length > 0) {
        setSemester(data.current_sem[0]); // current semester
        setSelectedSem(data.current_sem[0].semid); // default selected
      }

      if (data.allSem) {
        setSemList(data.allSem);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  // Fetch assigned classes by semester filter
  useEffect(() => {
    const fetchClasses = async () => {
      if (!selectedSem) return;
      try {
        const response = await fetch(
          `http://localhost:3001/api/instructor/classgrade/assignedClass?semid=${selectedSem}`,
          { credentials: "include" }
        );
        const data = await response.json();

        setClasses(data.assigned_class || []);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchClasses();
  }, [selectedSem]);

  // Search filter
  const filteredClasses = assignedClass.filter((cls) => {
    const keyword = searched.toLowerCase();
    return (
      cls.classcode?.toLowerCase().includes(keyword) ||
      cls.classname?.toLowerCase().includes(keyword)
    );
  });

  const toggleClass = (id) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((clsid) => clsid !== id) : [...prev, id]
    );
  };

  const handleViewClassGrade = (classid) => {
    navigate(`/gradeManagement/gradeclassList/${encodeURIComponent(classid)}`);
  };

  const isCurrentSem = selectedSem === semester?.semid;

  return (
    <div className="view-assignedClass-container">
      <Menu menus={menu_instructor} />

      <div className="view-assignedClass-content">
        <h1>Grade Management</h1>

        {/* SEARCH BAR */}
        <input
          className="view-assignedClasssearch-bar"
          type="text"
          placeholder="Search Class"
          value={searched}
          onChange={(e) => setSearched(e.target.value)}
        />

        {/* SEMESTER FILTER */}
        <div className="semester-filter">
          <label>Select Semester:</label>
          <select
            value={selectedSem || ""}
            onChange={(e) => setSelectedSem(e.target.value)}
          >
            {semList.map((s) => (
              <option value={s.semid} key={s.semid}>
                {s.semid}
              </option>
            ))}
          </select>
        </div>

        {/* CLASS LIST */}
        <div className="view-assignedClass-list">
          {filteredClasses.length === 0 && (
            <div className="no-classes-message">
              No assigned classes for this semester
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

                {/* ENTER GRADE BUTTON DISABLED IF NOT CURRENT SEM */}
                {isCurrentSem && (
                  <span
                    className="view-studentList-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewClassGrade(cls.clsid);
                    }}
                  >
                    Enter Grade
                  </span>
                )}
              </div>

              {/* DETAILS */}
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

