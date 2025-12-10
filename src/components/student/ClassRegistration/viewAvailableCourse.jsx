import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import { useNavigate } from "react-router-dom";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/Student/ViewAvailableCourse.css";
import Chatbot from "../Chatbot/chatbot";

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
        <div className="header">
          <h1 className="available-course-title">
            Available Courses for{" "}
            {semester
              ? `${semester.semester_name} - ${semester.school_year}`
              : ""}
          </h1>

          <button className={recommendProcess ? "invalid" : "valid"} disabled={recommendProcess} onClick={handleRecommend}>Recommend</button>
        </div>

        {/* SEARCH BAR */}
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

        {recommendProcess ? (<div className="recommend-noti">Please wait a few seconds. The system is analyzing</div>) : ""}
        {limitAPI ? (<div className="recommend-noti">The recommend system reached limit. Please try again later.</div>) : ""}

        {loading ? (
          <div>Loading courses...</div>
        ) : error ? (
          <div>{error}</div>
        ) : !canView() ? (
          // Show message khi chưa tới 20 ngày cho xem
          <div>
            There is no available course right now.
            <br />
            You can view courses from:{" "}
            {semester &&
              new Date(
                new Date(semester.start_date).setDate(
                  new Date(semester.start_date).getDate() - 20
                )
              ).toLocaleDateString()}
          </div>
        ) : (
          <div className="available-course-list">
            {sortedCourses.length === 0 ? (
              <div>No course found...</div>
            ) : (
              sortedCourses.map((course) => {
                const isOpen = openCourses.includes(course.courseid);

                return (
                  <div
                    key={course.courseid}
                    className="course-item"
                    onClick={() => handleCourseClick(course)}
                  >
                    <div className="course-header">
                      <div className={`course-name ${
                      recommendCourse.includes(course.courseid)
                        ? "recommended"
                        : ""
                    }`}>
                        {course.courseid} - {course.coursename}
                      </div>

                      <span
                        className="view-class-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClass(course.courseid);
                        }}
                      >
                        View Class
                      </span>
                    </div>

                    {isOpen && (
                      <div className="course-detail">
                        <div className="detail-row">
                          <span className="course-info-label">Course ID:</span>
                          <span className="course-info-text">
                            {course.courseid ?? "-"}
                          </span>
                        </div>

                        <div className="detail-row">
                          <span className="course-info-label">
                            Course Name:
                          </span>
                          <span className="course-info-text">
                            {course.coursename ?? "-"}
                          </span>
                        </div>

                        <div className="detail-row">
                          <span className="course-info-label">Credit:</span>
                          <span className="course-info-text">
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
                          </span>
                        </div>

                        <div className="detail-row">
                          <span className="course-info-label">
                            Prerequisite:
                          </span>
                          <span className="course-info-text">
                            {course.prerequisite ?? "None"}
                          </span>
                        </div>

                        <div className="detail-row">
                          <span className="course-info-label">
                            Class Available:
                          </span>
                          <span className="course-info-text">
                            {course.number_of_class_available ?? "-"}
                          </span>
                        </div>

                        <div className="detail-row">
                          <span className="course-info-label">
                            Description:
                          </span>
                          <span className="course-info-text">
                            {course.description ?? "-"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
