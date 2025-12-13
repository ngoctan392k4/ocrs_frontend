import React, { useState, useEffect } from "react";
import Menu from "../../../menu/Menu";
import menu_instructor from "../../../../assets/dataMenu/MenuInstructorData";
import { useNavigate } from "react-router-dom";
import "../../../../styles/instructor/Teaching/ViewAssignedClass.css";
import mailBoxIcon from '../../../../assets/icon/mailbox.svg';

function Classlist() {
  const navigate = useNavigate();

  const [semester, setSemester] = useState(null);
  const [semList, setSemList] = useState([]);
  const [selectedSem, setSelectedSem] = useState(""); // DEFAULT EMPTY

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
        setSemester(data.current_sem[0]);
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

  // Fetch assigned classes when a semester is selected
  useEffect(() => {
    const fetchClasses = async () => {
      if (!selectedSem) {
        setClasses([]);
        return;
      }

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

  return (
    <div className="view-assignedClass-container">
      <Menu menus={menu_instructor} />

      <div className="view-assignedClass-content">
        <h1 className="page-title">Grade Management</h1>

        {/* SEMESTER FILTER */}
        <div className="filter-container">
          <div className="filter-wrapper">
            <label className="filter-label">Select Semester:</label>
            <select
              className="filter-select"
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
            >
              <option value="">-- Select Semester --</option>
              {semList.map((s) => (
                <option value={s.semid} key={s.semid}>
                  {s.semid}
                </option>
              ))}
            </select>
          </div>

          <input
            className="search-input"
            type="text"
            placeholder="Search by class code or name..."
            value={searched}
            onChange={(e) => setSearched(e.target.value)}
          />
        </div>

        {/* REQUIRE SELECT SEMESTER */}
        {!selectedSem && (
          <div className="table-wrapper">
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">Please select a semester</div>
              <div className="table-empty-subtext">Select semester above to manage grades</div>
            </div>
          </div>
        )}

        {/* CLASS LIST */}
        {selectedSem && (
          <>
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
                            onClick={() => handleViewClassGrade(cls.clsid)}
                            title="View and manage grades"
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
          </>
        )}
      </div>
    </div>
  );
}
//them default
export default Classlist;
