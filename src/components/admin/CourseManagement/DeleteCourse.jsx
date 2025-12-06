export default function DeleteCourse({ courseId, onCancel, onConfirm, errorMessage }) {
    return (
        <div className="dialog-backdrop">
            <div className="dialog-box">

                <div className="dialog-message">
                    {errorMessage ? (
                        <span style={{ color: "red" }}>{errorMessage}</span>
                    ) : (
                        <>Delete Course {courseId}?</>
                    )}
                </div>

                <div className="dialog-actions">
                    {!errorMessage && (
                        <button className="dialog-btn yes" onClick={onConfirm}>
                            Yes
                        </button>
                    )}
                    <button className="dialog-btn no" onClick={onCancel}>
                        {errorMessage ? "Close" : "No"}
                    </button>
                </div>
            </div>
        </div>
    );
}
