import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import { useNavigate } from "react-router-dom";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/Student/ViewAvailableCourse.css";

export default function ViewAvailableCourse() {
    const [semester, setSemester] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openCourses, setOpenCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    // GET courses + latest semester
    const fetchCourses = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/student/Available-Course`);
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

    useEffect(() => {
        fetchCourses();
    }, []);

    // handle mở/đóng course (mở nhiều được)
    const handleCourseClick = (course) => {
        setOpenCourses((prev) => {
            if (prev.includes(course.courseid)) {
                return prev.filter((id) => id !== course.courseid);
            } else {
                return [...prev, course.courseid];
            }
        });
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

    return (
        <div className="available-course-container">
            <Menu menus={menu_student} />

            <div className="available-course-content">
                <h1 className="available-course-title">
                    Available Courses for{" "}
                    {semester
                        ? `${semester.semester_name} - ${semester.school_year}`
                        : ""}
                </h1>

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

                {loading ? (
                    <div>Loading courses...</div>
                ) : error ? (
                    <div>{error}</div>
                ) : (
                    <div className="available-course-list">
                        {filteredCourses.length === 0 ? (
                            <div>No course found...</div>
                        ) : (
                            filteredCourses.map((course) => {
                                const isOpen = openCourses.includes(course.courseid);

                                return (
                                    <div
                                        key={course.courseid}
                                        className="course-item"
                                        onClick={() => handleCourseClick(course)}
                                    >
                                        <div className="course-header">
                                            <div className="course-name">
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
                                                    <span className="course-info-text">{course.courseid ?? "-"}</span>
                                                </div>

                                                <div className="detail-row">
                                                    <span className="course-info-label">Course Name:</span>
                                                    <span className="course-info-text">{course.coursename ?? "-"}</span>
                                                </div>

                                                <div className="detail-row">
                                                    <span className="course-info-label">Credit:</span>
                                                    <span className="course-info-text">
                                                        {Object.entries(course.credit_details)
                                                            .filter(([_, value]) => value > 0)
                                                            .map(([type, value]) => (
                                                                <div key={type} className="credit-detail-row">
                                                                    <span className="credit-info-label">{type.toUpperCase()}:</span>
                                                                    <span className="credit-info-text">{value}</span>
                                                                </div>
                                                            ))
                                                        }
                                                    </span>
                                                </div>


                                                <div className="detail-row">
                                                    <span className="course-info-label">Prerequisite:</span>
                                                    <span className="course-info-text">{course.prerequisite ?? "None"}</span>
                                                </div>

                                                <div className="detail-row">
                                                    <span className="course-info-label">Class Available:</span>
                                                    <span className="course-info-text">
                                                        {course.number_of_class_available ?? "-"}
                                                    </span>
                                                </div>

                                                <div className="detail-row">
                                                    <span className="course-info-label">Description:</span>
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
