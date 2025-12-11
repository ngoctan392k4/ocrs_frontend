import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import "../../../styles/Student/ViewAvailableClass.css";
import Chatbot from "../Chatbot/Chatbot";
import mailBoxIcon from '../../../assets/icon/mailbox.svg'

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
                <Chatbot/>
                <h1 className="viewclass-title">
                    Classes for {courseInfo?.courseID} - {courseInfo?.coursename}
                </h1>

                <div className="table-wrapper">
                    {loading ? (
                        <div className="table-loading">
                            <div className="spinner"></div>
                            <p>Loading classes...</p>
                        </div>
                    ) : error ? (
                        <div className="table-empty-state">
                            <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
                            <div className="table-empty-text">Error loading classes</div>
                            <div className="table-empty-subtext">{error}</div>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="table-empty-state">
                            <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
                            <div className="table-empty-text">No classes available</div>
                            <div className="table-empty-subtext">No classes available for this course yet</div>
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
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map((cls) => (
                                    <tr key={cls.clsid}>
                                        <td className="table-cell-primary">{cls.classcode}</td>
                                        <td>{cls.classname}</td>
                                        <td className="table-cell-secondary">{cls.instructor_info}</td>
                                        <td className="table-cell-secondary">{cls.schedule || "-"}</td>
                                        <td className="table-cell-secondary">{cls.location || "-"}</td>
                                        <td className="table-cell-secondary text-center">{cls.capacity || "-"}</td>
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
