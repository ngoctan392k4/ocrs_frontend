import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import { useNavigate } from "react-router-dom";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/Student/ViewAvailableCourse.css";
import Chatbot from "../Chatbot/Chatbot";
import mailBoxIcon from '../../../assets/icon/mailbox.svg'
import star from '../../../assets/icon/star.svg'

export default function ViewAvailableCourse() {
  const [semester, setSemester] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCourses, setOpenCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [recommendCourse, setRecommendCourse] = useState([]);
  const [recommendProcess, setRecommendProcess] = useState(false);
  const [limitAPI, setLimitAPI] = useState(false);

  const navigate = useNavigate();

  // GET courses + latest semester
  const fetchCourses = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/student/Available-Course`
      );
      const data = await res.json();

      if (data.semester) setSemester(data.semester);
      if (Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else {
        setCourses([]);
        setError(data.message || "Invalid data from server");
      }
    } catch (err) {
      setError("Cannot fetch courses");
    } finally {
      setLoading(false);
    }
  };

  // Handle recommend course function
  const handleRecommend = async () => {
    try {
      setRecommendProcess(true);
      setLimitAPI(false);
      const response = await fetch(
        "http://localhost:3001/api/student/recommendCourse",
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ semester: semester.semid }),
        }
      );

      const data = await response.json();
      console.log(data);
      if (!response.ok){
        setRecommendProcess(false);
        setLimitAPI(true);
      }else {
        setRecommendCourse(data);
        setRecommendProcess(false);
        setLimitAPI(false);
      }
    } catch (error) {
      setRecommendProcess(false);
      setRecommendCourse([]);
      setLimitAPI(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const canView = () => {
    if (!semester || !semester.start_date) return false;

    const today = new Date();
    const start = new Date(semester.start_date);

    const viewStart = new Date(start);
    viewStart.setDate(viewStart.getDate() - 20);

    return today >= viewStart;
  };

  // handle mở/đóng course (mở nhiều được)
  const handleCourseClick = (course) => {
    setOpenCourses((prev) =>
      prev.includes(course.courseid)
        ? prev.filter((id) => id !== course.courseid)
        : [...prev, course.courseid]
    );
  };

  const handleViewClass = (courseid) => {
    navigate(`/availableCourse/availableClass/${encodeURIComponent(courseid)}`);
  };

  const filteredCourses = courses.filter((c) => {
    const text = searchTerm.toLowerCase();
    return (
      c.courseid?.toLowerCase().includes(text) ||
      c.coursename?.toLowerCase().includes(text)
    );
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const aRec = recommendCourse.includes(a.courseid);
    const bRec = recommendCourse.includes(b.courseid);

    if (aRec && !bRec) return -1;
    if (!aRec && bRec) return 1;
    return 0;
  });

  return (
    <div className="available-course-container">
      <Menu menus={menu_student} />

      <div className="available-course-content">
        <Chatbot/>
        <h1 className="available-course-title">
          Available Courses {semester ? `- ${semester.semester_name} ${semester.school_year}` : ""}
        </h1>

        <div className="action-bar">
          <div className="search-container">
            <i className="bx bx-search search-icon"></i>
            <input
              type="text"
              className="available-course-search"
              placeholder="Search course by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className={`recommend-btn ${recommendProcess ? "disabled" : ""}`}
            disabled={recommendProcess}
            onClick={handleRecommend}
          >
            {recommendProcess ? "Recommending..." : "Recommend"}
          </button>
        </div>

        {limitAPI && (
          <div className="notify-warning">
            The recommend system reached limit. Please try again later.
          </div>
        )}

        <div className="table-wrapper">
          {loading ? (
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading courses...</p>
            </div>
          ) : error ? (
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">Error loading courses</div>
              <div className="table-empty-subtext">{error}</div>
            </div>
          ) : !canView() ? (
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">Courses not yet available</div>
              <div className="table-empty-subtext">
                Available from: {semester && new Date(
                  new Date(semester.start_date).setDate(
                    new Date(semester.start_date).getDate() - 20
                  )
                ).toLocaleDateString()}
              </div>
            </div>
          ) : sortedCourses.length === 0 ? (
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">No courses found</div>
              <div className="table-empty-subtext">Try adjusting your search filters</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Course Name</th>
                  <th>Credit</th>
                  <th>Classes</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedCourses.map((course) => (
                  <tr key={course.courseid} className={recommendCourse.includes(course.courseid) ? "recommended-row" : ""}>
                    <td className="table-cell-primary">
                      {recommendCourse.includes(course.courseid) && <span className="badge-recommended"><img src={star} alt="starIcon" /></span>}
                      {course.courseid}
                    </td>
                    <td>{course.coursename}</td>
                    <td className="table-cell-secondary">
                      {Object.entries(course.credit_details)
                              .filter(([_, value]) => value > 0)
                              .map(([type, value]) => (
                                <div key={type} className="credit-detail-row">
                                  <span className="credit-info-label">
                                    {type.toUpperCase()}:
                                  </span>
                                  <span className="credit-info-text">
                                    {value}
                                  </span>
                                </div>
                              ))}
                    </td>
                    <td className="table-cell-secondary">{course.number_of_class_available || "-"}</td>
                    <td className="table-cell-description">
                      <span className="description-text" title={course.description}>
                        {course.description ? course.description.substring(0, 40) + "..." : "-"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-class-btn"
                        onClick={() => handleViewClass(course.courseid)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
