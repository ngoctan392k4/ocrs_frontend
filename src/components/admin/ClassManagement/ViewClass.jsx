import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import "../../../styles/ViewClass.css";

export default function ViewClass() {
  const [searched, setSearched] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchClasses() {
    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/ClassManagement"
      );
      const data = await response.json();
      console.log("Fetched classes:", data);
      setClasses(data);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  const searchClass = classes.filter((cls) =>
    cls.clsid?.toLowerCase().includes(searched.toLowerCase())
  );

  const toggleClass = (id) => {
    setSelectedClasses((otherClasses) =>
      otherClasses.includes(id)
        ? otherClasses.filter((clsid) => clsid !== id)
        : [...otherClasses, id]
    );
  };

  return (
    <div className="view-container">
      <Menu menus={menu_admin} />

      <div className="view-content">
        <h1 className="view-title">View Class</h1>

        <input
          className="search-bar"
          type="text"
          placeholder="Search Class ID"
          value={searched}
          onChange={(e) => setSearched(e.target.value)}
        />

        <div className="class-list">
          {searchClass.map((cls) => (
            <div
              key={cls.clsid}
              className="class-item"
              onClick={() => toggleClass(cls.clsid)}
            >
              <div className="class-header">
                <div className="class-name">{cls.classname}</div>

                <button className="delete-btn class-delete-btn">x</button>
              </div>
              {selectedClasses.includes(cls.clsid) && (
                <div className="class-detail">
                  <div className="detail-row">
                    <span className="class-info-label">Class ID: </span>
                    <span className="class-info-text">{cls.clsid}</span>
                  </div>
                  <div className="detail-row">
                    <span className="class-info-label">Class Name: </span>
                    <span className="class-info-text">{cls.classname}</span>
                  </div>
                  {/* <div className="detail-row">
                    <span className="class-info-label">
                      Available Course ID:{" "}
                    </span>
                    <span className="class-info-text">
                      {cls.availableCourseID}
                    </span>
                  </div> */}
                  {/* <div className="detail-row">
                    <span className="class-info-label">Instructor: </span>
                    <span className="class-info-text">
                      {cls.instructorID}
                    </span>
                  </div> */}
                  <div className="detail-row">
                    <span className="class-info-label">Schedule: </span>
                    <span className="class-info-text">{cls.schedule}</span>
                  </div>
                  <div className="detail-row">
                    <span className="class-info-label">
                      Class Location: <br />
                    </span>
                    <span className="class-info-text">
                      {cls.classlocation || "null"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="class-info-label">Capacity: </span>
                    <span className="class-info-text">{cls.capacity}</span>
                  </div>

                  <div className="class-action">
                    <button className="edit-btn">Edit</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="add-class-btn">+</button>
      </div>
    </div>
  );
}
