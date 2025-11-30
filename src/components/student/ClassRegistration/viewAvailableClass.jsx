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
    const [opened, setOpened] = useState(null);

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
                    <div>{error}</div>
                ) : classes.length === 0 ? (
                    <div>No classes found.</div>
                ) : (
                    <div className="viewclass-list">
                        {classes.map((cls) => (
                            <div
                                key={cls.clsid}
                                className="viewclass-item"
                                onClick={() => setOpened(opened === cls.clsid ? null : cls.clsid)}
                            >
                                <div className="viewclass-header">
                                    <div className="viewclass-name">
                                        {cls.clsid}
                                    </div>
                                </div>

                                {opened === cls.clsid && (
                                    <div className="viewclass-detail">
                                        <div className="viewclassdetail-row">
                                            <span className="viewclass-info-label">Class ID:</span>
                                            <span className="viewclass-info-text">{cls.clsid}</span>
                                        </div>

                                        <div className="viewclassdetail-row">
                                            <span className="viewclass-info-label">Instructor:</span>
                                            <span className="viewclass-info-text">{cls.instructor_name}</span>
                                        </div>

                                        <div className="viewclassdetail-row">
                                            <span className="viewclass-info-label">Schedule:</span>
                                            <span className="viewclass-info-text">{cls.schedule || "-"}</span>
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

                <button className="viewclass-back-btn" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>
        </div>
    );
}
