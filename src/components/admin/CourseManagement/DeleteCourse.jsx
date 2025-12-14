import React from "react";
import "../../../styles/admin/CourseManagement/DeleteCourse.css";

export default function DeleteCourse({ courseId, error, onCancel, onConfirm }) {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div
            className="dialog-backdrop"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div className="dialog-box">
                <div className="dialog-message">
                    Delete Course <strong>{courseId}</strong>?

                    {error && (
                        <div className="dialog-error">
                            <span className="error-icon">⚠️</span>
                            <span className="error-text">{error}</span>
                        </div>
                    )}
                </div>

                <div className="dialog-actions">
                    <button
                        className="dialog-btn no"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="dialog-btn yes"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}