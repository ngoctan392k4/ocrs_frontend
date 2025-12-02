import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/Student/ViewAvailableClass.css";

export default function ViewAvailableClass() {
    const { courseID } = useParams();
    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);
    const [courseInfo, setCourseInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [opened, setOpened] = useState([]);

    const fetchClasses = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/student/Available-Course/Class", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseID }),
            });

            const data = await res.json();
            setClasses(data);
            setCourseInfo({ courseID, coursename: data[0]?.coursename || courseID });

        } catch (err) {
            console.error(err);
            setError("Cannot fetch classes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [courseID]);

    const toggleOpen = (clsid) => {
        setOpened(prev => {
            if (prev.includes(clsid)) {
                return prev.filter(id => id !== clsid);
            } else {
                return [...prev, clsid];
            }
        });
    };
    return (
        <div className="viewclass-container">
            <Menu menus={menu_student} />

            <div className="viewclass-content">
                <h1 className="viewclass-title">
                    Classes for {courseInfo?.courseID} - {courseInfo?.coursename}
                </h1>

                {loading ? (
                    <div>Loading classes...</div>
                ) : error ? (
                    <div className="viewclass-message error">{error}</div>
                ) : classes.length === 0 ? (
                    <div className="viewclass-message no-class">
                        <i className="fas fa-info-circle" style={{ marginRight: "8px" }}></i>
                        No classes available for this course yet.
                    </div>
                ) : (
                    <div className="viewclass-list">
                        {classes.map((cls) => (
                            <div
                                key={cls.clsid}
                                className="viewclass-item"
                                onClick={() => toggleOpen(cls.clsid)}
                            >
                                <div className="viewclass-header">
                                    <div className="viewclass-name">{cls.classcode}</div>
                                </div>

                                {opened.includes(cls.clsid) && (
                                    <div className="viewclass-detail">
                                        <div className="viewclassdetail-row">
                                            <span className="viewclass-info-label">Class Code:</span>
                                            <span className="viewclass-info-text">{cls.classcode}</span>
                                        </div>

                                        <div className="viewclassdetail-row">
                                            <span className="viewclass-info-label">Class Name:</span>
                                            <span className="viewclass-info-text">{cls.classname}</span>
                                        </div>

                                        <div className="viewclassdetail-row">
                                            <span className="viewclass-info-label">Instructor:</span>
                                            <span className="viewclass-info-text">{cls.instructor_info}</span>
                                        </div>

                                        <div className="viewclassdetail-row">
                                            <span className="viewclass-info-label">Schedule:</span>
                                            <span className="viewclass-info-text">{cls.schedule || "This class has no schedule yet!"}</span>
                                        </div>

                                        <div className="viewclassdetail-row">
                                            <span className="viewclass-info-label">Location:</span>
                                            <span className="viewclass-info-text">{cls.location || "This class has no location yet!"}</span>
                                        </div>

                                        <div className="viewclassdetail-row">
                                            <span className="viewclass-info-label">Capacity:</span>
                                            <span className="viewclass-info-text">{cls.capacity || "-"}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
