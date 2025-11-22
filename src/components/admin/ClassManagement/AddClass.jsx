import React, { useState, useEffect } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import "../../../styles/admin/ClassManagement/addClass.css";

export default function AddClass() {
  const [formData, setFormData] = useState({
    classcode: "",
    courseid: "",
    instructorid: "",
    classname: "",
    semid: "",
    capacity: "",
    schedule: [],
  });

  const [errors, setErrors] = useState({
    courseid: "",
    classcode: "",
    classname: "",
    instructorid: "",
    capacity: "",
  });

  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [semester, setSemester] = useState(null);
  const [scheduleList, setScheduleList] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ------------------------------
      FETCH COURSES, INSTRUCTORS, SEMESTER
  ------------------------------ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "http://localhost:3001/api/admin/CourseManagement"
        );
        const data = await res.json();

        // set courses và instructors
        setCourses(data.courses || []);
        setInstructors(data.instructors || []);

        // set semester mặc định nếu có
        if (data.semesterlat?.length > 0) {
          const sem = data.semesterlat[0];
          setSemester(sem);

          const semFormat = `${sem.id}`;
          setFormData((prev) => ({ ...prev, semid: semFormat }));
        }
      } catch (err) {
        console.error("Fetch error:", err.message);
      }
    };

    fetchData();
  }, []);

  /* ------------------------------
      HANDLE CHANGE
  ------------------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "courseid") {
      const selectedCourse = courses.find((c) => c.courseid === value);
      setFormData((prev) => ({
        ...prev,
        courseid: value,
        classcode: value ? value + " - " : "",
        classname: selectedCourse ? selectedCourse.coursename : "",
      }));
      return;
    }

    if (name === "instructorid") {
      const selectedInstructor = instructors.find(
        (i) => i.instructorid === value
      );

      setFormData((prev) => ({
        ...prev,
        instructorid: value, // luôn lưu instructorid vào DB
        instructorName: selectedInstructor?.name || "", // nếu bạn muốn lưu thêm
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ------------------------------
      SCHEDULE CHANGE
  ------------------------------ */
  const handleScheduleChange = (index, field, value) => {
    const updated = [...scheduleList];
    updated[index][field] = value;
    setScheduleList(updated);
    setFormData((prev) => ({ ...prev, schedule: updated }));
  };

  const addScheduleRow = () => {
    setScheduleList((prev) => [
      ...prev,
      { day: "", start: "", end: "", location: "" },
    ]);
  };

  /* ------------------------------
      SUBMIT
  ------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let validationErrors = {};

    // Kiểm tra các trường bắt buộc
    const requiredFields = [
      "courseid",
      "classcode",
      "classname",
      "instructorid",
      "capacity",
    ];
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        validationErrors[field] = "This field is required";
      }
    }

    // Nếu có lỗi, set state lỗi và dừng
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    if (!semester) {
      alert("Semester data not loaded yet.");
      setLoading(false);
      return;
    }

    const semFormat = semester.semid;

    // Nếu schedule rỗng, gán mặc định
    const schedulePayload =
      scheduleList.length === 0
        ? [
            {
              day: null,
              start: null,
              end: null,
              location: "This class has no schedule yet!",
              note: "This class has no schedule yet!",
            },
          ]
        : scheduleList;

    const payload = {
      courseid: formData.courseid,
      classcode: formData.classcode,
      classname: formData.classname,
      semid: semFormat,
      instructorid: formData.instructorid,
      capacity: formData.capacity,
      schedule: schedulePayload,
    };

    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/ClassManagement/addClass",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Class added successfully!");

        setFormData({
          classcode: "",
          courseid: "",
          instructorid: "",
          classname: "",
          capacity: "",
          schedule: [],
        });
        setScheduleList([]);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Error connecting to server.");
    }

    setLoading(false);
  };

  return (
    <div className="add-container">
      <Menu menus={menu_admin} />
      <div className="add-content">
        <h1 className="add-title">
          Add Class
          {semester &&
            ` - ${semester.semester_name} - School Year ${semester.school_year}`}
        </h1>

        <form className="add-form" onSubmit={handleSubmit}>
          {/* COURSE */}
          <div className="label">Course:</div>
          <select
            name="courseid"
            value={formData.courseid}
            onChange={handleChange}
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.courseid} value={c.courseid}>
                {c.courseid} — {c.coursename}
              </option>
            ))}
          </select>
          {errors.courseid && (
            <div className="error-message">{errors.courseid}</div>
          )}

          {/* CLASS CODE */}
          <div className="label">Class Code:</div>
          <input
            type="text"
            name="classcode"
            value={formData.classcode}
            onChange={handleChange}
          />
          {errors.classcode && (
            <div className="error-message">{errors.classcode}</div>
          )}

          {/* CLASS NAME */}
          <div className="label">Class Name:</div>
          <input
            type="text"
            name="classname"
            className="input-wide"
            value={formData.classname}
            onChange={handleChange}
          />
          {errors.classname && (
            <div className="error-message">{errors.classname}</div>
          )}

          {/* INSTRUCTOR */}
          <div className="label">Instructor:</div>
          <select
            name="instructorid"
            value={formData.instructorid}
            onChange={handleChange}
          >
            <option value="">Select Instructor</option>
            {instructors.map((i) => (
              <option key={i.instructorid} value={i.instructorid}>
                {i.instructorid} — {i.name}
              </option>
            ))}
          </select>
          {errors.instructorid && (
            <div className="error-message">{errors.instructorid}</div>
          )}

          {/* CAPACITY */}
          <div className="label">Capacity:</div>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
          />
          {errors.capacity && (
            <div className="error-message">{errors.capacity}</div>
          )}

          {/* SCHEDULE */}
          <div className="label">Schedule:</div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="schedule-add-btn" onClick={addScheduleRow}>
              +
            </div>
          </div>

          {scheduleList.map((sch, index) => (
            <div key={index} className="schedule-box">
              <div className="schedule-label">Days:</div>
              <select
                value={sch.day}
                onChange={(e) =>
                  handleScheduleChange(index, "day", e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>

              <div className="schedule-label">Location:</div>
              <select
                value={sch.location}
                onChange={(e) =>
                  handleScheduleChange(index, "location", e.target.value)
                }
              >
                <option value="">Select</option>
                {[...Array(8)].map((_, floor) =>
                  [...Array(10)].map((_, room) => {
                    const value =
                      "ROOM " +
                      `${floor + 1}${(room + 1).toString().padStart(2, "0")}`;
                    return (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    );
                  })
                )}
              </select>

              <div className="schedule-label">Start:</div>
              <select
                value={sch.start}
                onChange={(e) =>
                  handleScheduleChange(index, "start", e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="07:00">07:00</option>
                <option value="09:15">09:15</option>
                <option value="13:00">13:00</option>
                <option value="15:15">15:15</option>
                <option value="17:30">17:30</option>
                <option value="17:45">17:45</option>
              </select>

              <div className="schedule-label">End:</div>
              <select
                value={sch.end}
                onChange={(e) =>
                  handleScheduleChange(index, "end", e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="09:00">09:00</option>
                <option value="10:15">10:15</option>
                <option value="11:15">11:15</option>
                <option value="15:00">15:00</option>
                <option value="16:15">16:15</option>
                <option value="17:15">17:15</option>
                <option value="19:30">19:30</option>
                <option value="21:00">21:00</option>
              </select>
            </div>
          ))}

          <div className="add-buttons">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Saving..." : "Add Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
