import "../../../styles/student/ClassRegistration.css";

const renderCourseDetail = (course) => {
  if (!course) return null;

  const creditTypes = Object.keys(course)
    .filter((key) => key.toLowerCase().startsWith("credit_"))
    .map((key) => ({
      key: key,
      keyLabel: key.replace("credit_", "").replaceAll("_", " ").toUpperCase(),
    }));

  return (
    <div className="course-detail">
      <div className="detail-row">
        <span className="course-info-label">Course ID: </span>
        <span className="course-info-text">{course.courseid}</span>
      </div>
      <div className="detail-row">
        <span className="course-info-label">Course Name: </span>
        <span className="course-info-text">{course.coursename}</span>
      </div>
      <div className="detail-row">
        <span className="course-info-label">Type of study unit: </span>
        <span className="course-info-text">{course.type_of_study_unit}</span>
      </div>
      <div className="detail-row">
        <span className="course-info-label">Prerequisite: </span>
        <span className="course-info-text">
          {course.prerequisite || "No prerequisite"}
        </span>
      </div>
      <div className="detail-row">
        <span className="course-info-label">Parallel Course: </span>
        <span className="course-info-text">
          {course.parallel_course || "No parallel courses"}
        </span>
      </div>
      <div className="detail-row">
        <span className="course-info-label">Description: </span>
        <span className="course-info-text">
          {course.description || "No description"}
        </span>
      </div>

      <div className="detail-row">
        <span className="course-info-label">Credit: </span>
        <span className="course-info-text">
          {creditTypes
            .filter((credit) => Number(course[credit.key]) > 0)
            .map((credit) => (
              <div key={credit.key} className="credit-detail-row">
                <span className="credit-info-label">{credit.keyLabel}: </span>
                <span className="credit-info-text">{course[credit.key]}</span>
              </div>
            ))}
        </span>
      </div>
    </div>
  );
};

export default renderCourseDetail;
