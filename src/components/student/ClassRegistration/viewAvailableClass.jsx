import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/Student/ViewAvailableClass.css";
import Chatbot from "../Chatbot/Chatbot";
import mailBoxIcon from "../../../assets/icon/mailbox.svg";
import star from "../../../assets/icon/star.svg";

export default function ViewAvailableClass() {
  const { courseID } = useParams();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedClasses, setSelectedClasses] = useState([]);
  const [openedRows, setOpenedRows] = useState(new Set());

  const [recommendedClasses, setRecommendedClasses] = useState([]);
  const [selector, setSelector] = useState(false);

  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorActive, setAdvisorActive] = useState(false);
  const [recommendProcess, setRecommendProcess] = useState(true);
  const [limitAPI, setLimitAPI] = useState(false);

  
  const [errorMsg, setErrorMsg] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());

  const setProcessing = (id, val) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      if (val) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleOpen = (id) => {
    setOpenedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addClassToTimetable = async (clsid, schedule, location) => {
    try {
      const res = await fetch(
        "http://localhost:3001/api/student/SmartTimeTable",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clsid,
            schedule,
            location,
          }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const serverMsg = data?.message || `Failed to add class. Status: ${res.status}`;
        throw new Error(serverMsg);
      }

      return data;
    } catch (error) {
      console.error("Error adding class to timetable:", error);
      throw error;
    }
  };

  const removeClassFromTimetable = async (clsid) => {
    try {
      const res = await fetch(
        "http://localhost:3001/api/student/SmartTimeTable",
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clsid,
          }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const serverMsg = data?.message || `Failed to remove class. Status: ${res.status}`;
        throw new Error(serverMsg);
      }

      return data;
    } catch (error) {
      console.error("Error removing class from timetable:", error);
      throw error;
    }
  };

  const handleCheckboxChange = async (e, cls) => {
    e.stopPropagation();

    const willCheck = e.target.checked;
    setErrorMsg(null);

    setProcessing(cls.clsid, true);
    try {
      if (willCheck) {
        await addClassToTimetable(cls.clsid, cls.schedule, cls.location);
        setSelectedClasses((prev) => {
          if (prev.includes(cls.clsid)) return prev;
          return [...prev, cls.clsid];
        });
      } else {
        await removeClassFromTimetable(cls.clsid);
        setSelectedClasses((prev) => prev.filter((id) => id !== cls.clsid));
      }
    } catch (err) {
      console.error("Error updating timetable:", err);

      // If server message contains 'conflict', show friendly text
      const raw = err?.message || "An error occurred";
      const msg =
        raw.toLowerCase().includes("conflict")
          ? "Selected Class schedule is conflict"
          : raw;

      setErrorMsg(msg);
    } finally {
      setProcessing(cls.clsid, false);
    }
  };

  const handleSelectClass = async (clsid, schedule, location, isChecked) => {
    try {
      if (isChecked) {
        await addClassToTimetable(clsid, schedule, location);
        setSelectedClasses((prev) => [...prev, clsid]);
        console.log(`Class ${clsid} added to timetable`);
      } else {
        await removeClassFromTimetable(clsid);
        setSelectedClasses((prev) => prev.filter((id) => id !== clsid));
        console.log(`Class ${clsid} removed from timetable`);
      }
    } catch (error) {
      console.error("Error updating timetable:", error);
      const raw = error?.message || "An error occurred";
      setErrorMsg(raw.toLowerCase().includes("conflict") ? "Selected Class schedule is conflict" : raw);
    }
  };

  const toggleSelector = () => {
    setSelector(!selector);
  };

  const advisor = () => {
    setAdvisorActive(!advisorActive);

    if (!advisorActive) {
      setAdvisorLoading(true);
      fetchAIRecommendations().finally(() => {
        setAdvisorLoading(false);
      });
    } else {
      setRecommendedClasses([]);
      setRecommendProcess(true);
    }
  };

  const fetchAIRecommendations = async () => {
    try {
      console.log("Course ID:", courseID);
      const res = await fetch(
        "http://localhost:3001/api/student/AISmartTimeTable",
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseID: courseID }),
        }
      );
      const data = await res.json();
      console.log("AI Recommendations Response:", data);
      if (!res.ok) {
        setRecommendProcess(false);
        setLimitAPI(true);
      } else {
        setRecommendedClasses(data);
        setRecommendProcess(false);
        setLimitAPI(false);
      }
    } catch (error) {
      setRecommendProcess(false);
      setRecommendedClasses([]);
      setLimitAPI(false);
    }
  };

  useEffect(() => {
    console.log("Updated Recommended Classes:", recommendedClasses);
  }, [recommendedClasses]);

  const fetchClasses = async () => {
    try {
      const res = await fetch(
        "http://localhost:3001/api/student/Available-Course/Class",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseID }),
        }
      );

      const data = await res.json();
      console.log(data.classes);

      if (data.classes && data.classes.length > 0) {
        setClasses(data.classes);
        setCourseInfo({
          courseID,
          coursename: data.classes[0]?.coursename || "Course Name Not Found",
        });
        setSelectedClasses(data.advised || []);
        console.log(data.advised);
      } else {
        setClasses([]);
        setCourseInfo({
          courseID,
          coursename: "No classes available",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Cannot fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const sortedClasses = [...classes].sort((a, b) => {
    const aRec = recommendedClasses.includes(a.classcode);
    const bRec = recommendedClasses.includes(b.classcode);

    if (aRec && !bRec) return -1;
    if (!aRec && bRec) return 1;
    return 0;
  });

  useEffect(() => {
    fetchClasses();
  }, [courseID]);

  return (
    <div className="viewclass-container">
      <Menu menus={menu_student} />

      <div className="viewclass-content">
        <Chatbot />
        <h1 className="viewclass-title">
          Classes for {courseInfo?.courseID} - {courseInfo?.coursename}
        </h1>

        <button
          className={selector ? "Active" : "Inactive"}
          onClick={toggleSelector}
          disabled={advisorLoading}
        >
          Select
        </button>

        <button
          className="advisor-btn"
          onClick={() => {
            const alreadySelected = classes.some((cls) =>
              selectedClasses.includes(cls.clsid)
            );

            if (alreadySelected) {
              setErrorMsg("You have selected a class in this course");
            } else {
              advisor();
            }
          }}
          disabled={advisorLoading}
        >
          {advisorLoading ? (
            <>
              <div className="spinner"></div>
              <span className="btn-text">Loading...</span>
            </>
          ) : (
            <span className="btn-text">Advisor</span>
          )}
        </button>

        {errorMsg !== null && (
          <div className="notify-warning">{errorMsg}</div>
        )}

        {limitAPI && (
          <div className="notify-warning">
            The recommend system reached limit. Please try again later.
          </div>
        )}
        {!recommendProcess && recommendedClasses.length === 0 && (
          <div className="notify-warning">
            There is no suitable class for current schedule
          </div>
        )}

        <div className="table-wrapper">
          {loading ? (
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading classes...</p>
            </div>
          ) : error ? (
            <div className="table-empty-state">
              <div className="table-empty-icon">
                <img src={mailBoxIcon} alt="mailBoxIcon" />
              </div>
              <div className="table-empty-text">Error loading classes</div>
              <div className="table-empty-subtext">{error}</div>
            </div>
          ) : classes.length === 0 ? (
            <div className="table-empty-state">
              <div className="table-empty-icon">
                <img src={mailBoxIcon} alt="mailBoxIcon" />
              </div>
              <div className="table-empty-text">No classes available</div>
              <div className="table-empty-subtext">
                No classes available for this course yet
              </div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class Code</th>
                  <th>Class Name</th>
                  <th>Instructor</th>
                  <th>Schedule</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  {selector && <th>Select</th>}
                </tr>
              </thead>
              <tbody>
                {sortedClasses.map((cls) => {
                  const isOpen = openedRows.has(cls.clsid);
                  const isProcessing = processingIds.has(cls.clsid);
                  const isSelected = selectedClasses.includes(cls.clsid);

                  return (
                    <tr
                      key={cls.clsid}
                      className={
                        recommendedClasses.includes(cls.classcode)
                          ? "recommended-row"
                          : ""
                      }
                    >
                      <td className="table-cell-primary">
                        {recommendedClasses.includes(cls.classcode) && (
                          <span className="badge-recommended">
                            <img src={star} alt="starIcon" />
                          </span>
                        )}
                        {cls.classcode}
                      </td>
                      <td>{cls.classname}</td>
                      <td className="table-cell-secondary">
                        {cls.instructor_info}
                      </td>
                      <td className="table-cell-secondary">
                        {cls.schedule || "-"}
                      </td>
                      <td className="table-cell-secondary">
                        {cls.location || "-"}
                      </td>
                      <td className="table-cell-secondary text-center">
                        {cls.capacity || "-"}
                      </td>
                      {selector && (
                        <td>
                          <input
                            className={
                              selector ? "checkbox-active" : "checkbox-inactive"
                            }
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              handleToggleOpen(cls.clsid);
                              handleCheckboxChange(e, cls);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isProcessing}
                          />
                          {isProcessing && <span className="row-spinner" />}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
