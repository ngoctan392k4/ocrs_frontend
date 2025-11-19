import React from "react";
import "../../../styles/admin/CourseManagement/DeleteCourse.css";

export default function DeleteCourse({ courseId, onCancel, onConfirm }) {
    return (
        <div className="dialog-backdrop">
            <div className="dialog-box">
                <div className="dialog-message">
                    Delete Course {courseId}?
                </div>
                <div className="dialog-actions">
                    <button className="dialog-btn yes" onClick={onConfirm}>
                        Yes
                    </button>
                    <button className="dialog-btn no" onClick={onCancel}>
                        No
                    </button>
                </div>
            </div>
        </div>
    );
}
