import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import "../../../styles/admin/ClassManagement/EditClass.css";

export default function EditClass() {
  const { clsid } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    classcode: "",
    courseid: "",
    instructorid: "",
    classname: "",
    semid: "",
    capacity: "",
    schedule: [],
  });

  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================ LOAD DATA ============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/admin/ClassManagement/editClass/${encodeURIComponent(
            clsid
          )}`
        );
        const data = await res.json();

        setCourses(data.courses || []);
        setInstructors(data.instructors || []);

        const classData = data.classes || {};
        const safeSchedule =
          classData.schedule && Array.isArray(classData.schedule)
            ? classData.schedule.map((s) => ({
                day: s.day,
                start: s.start,
                end: s.end,
                location: s.location,
              }))
            : [];

        setFormData({
          classcode: classData.classcode || "",
          courseid: classData.courseid || "",
          instructorid: classData.instructorid || "",
          classname: classData.classname || "",
          semid: classData.semid || "",
          capacity: classData.capacity || "",
          schedule: safeSchedule,
        });
        setScheduleList(safeSchedule);
      } catch (err) {
        console.error(err);
        alert("Error loading class data");
      }
    };

    if (clsid) fetchData();
  }, [clsid]);

  // ============================ INPUT CHANGE ============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "courseid") {
      const selectedCourse = courses.find((c) => c.courseid === value);
      setFormData((prev) => ({
        ...prev,
        courseid: value,
        classcode: value ? value + " - " : prev.classcode,
        classname: selectedCourse ? selectedCourse.coursename : "",
      }));
      return;
    }

    if (name === "capacity") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value < 10 || value > 200) {
        setErrors((prev) => ({
          ...prev,
          capacity: "Capacity must be between 10 and 200",
        }));
      } else {
        setErrors((prev) => ({ ...prev, capacity: "" }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ============================ SCHEDULE CHANGE ============================
  const handleScheduleChange = (index, field, value) => {
    const updated = [...scheduleList];
    updated[index] = { ...updated[index], [field]: value };
    setScheduleList(updated);
    setFormData((prev) => ({ ...prev, schedule: updated }));
  };

  const addScheduleRow = () =>
    setScheduleList((prev) => [
      ...prev,
      { day: "", start: "", end: "", location: "" },
    ]);

  const removeSchedule = (index) => {
    const updated = scheduleList.filter((_, i) => i !== index);
    setScheduleList(updated);
    setFormData((prev) => ({ ...prev, schedule: updated }));
  };

  // ============================ SUBMIT ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requiredFields = [
      "courseid",
      "classcode",
      "classname",
      "instructorid",
      "capacity",
    ];

    let validationErrors = {};

    // Kiểm tra required
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        validationErrors[field] = "This field is required";
      }
    });

    // Kiểm tra capacity
    if (formData.capacity && (formData.capacity < 10 || formData.capacity > 200)) {
      validationErrors.capacity = "Capacity must be between 10 and 200";
    }

    // Kiểm tra schedule đầy đủ
    scheduleList.forEach((sch, i) => {
      if (!sch.day || !sch.location || !sch.start || !sch.end) {
        validationErrors[`schedule-${i}`] = "Please fill full schedule information!";
      } else {
        // Kiểm tra start < end
        const [sh, sm] = sch.start.split(":").map(Number);
        const [eh, em] = sch.end.split(":").map(Number);
        if (sh > eh || (sh === eh && sm >= em)) {
          validationErrors[`schedule-${i}`] = "End time must be later than start time";
        }
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      schedule: scheduleList,
    };

    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/ClassManagement/editClass/${encodeURIComponent(
          clsid
        )}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert("Class updated successfully!");
        navigate("/classManagement");
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Error updating class.");
    }

    setLoading(false);
  };

  // ============================ RENDER ============================
  const instructorOptions = instructors.map((i) => ({
    value: i.instructorid,
    label: `${i.instructorid} — ${i.name}`,
  }));

  return (
    <div className="editclass-container">
      <Menu menus={menu_admin} />
      <div className="editclass-content">
        <h1 className="editclass-title">Edit Class — {formData.classcode}</h1>
        <form className="editclass-form" onSubmit={handleSubmit}>
          {/* COURSE */}
          <div className="editclasslabel">Course:</div>
          <input className="editclassreadOnly" value={formData.courseid} disabled />

          {/* CLASS CODE */}
          <div className="editclasslabel">Class Code:</div>
          <input className="editclassreadOnly" value={formData.classcode} disabled />

          {/* CLASS NAME */}
          <div className="editclasslabel">Class Name:</div>
          <input className="editclassreadOnly" value={formData.classname} disabled />

          {/* INSTRUCTOR */}
          <div className="editclasslabel">Instructor:</div>
          <Select
            name="instructorid"
            className={errors.instructorid ? "error-select" : ""}
            value={instructorOptions.find((o) => o.value === formData.instructorid) || null}
            options={instructorOptions}
            isClearable
            placeholder="Select Instructor"
            onChange={(selectedOption) => {
              handleChange({
                target: {
                  name: "instructorid",
                  value: selectedOption?.value || "",
                },
              });
            }}
          />
          {errors.instructorid && <div className="editclasserror-message">{errors.instructorid}</div>}

          {/* CAPACITY */}
          <div className="editclasslabel">Capacity:</div>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className={errors.capacity ? "error" : ""}
          />
          {errors.capacity && <div className="editclasserror-message">{errors.capacity}</div>}

          {/* SCHEDULE */}
          <div className="label">Schedule:</div>
          <div className="editclassschedule-add-btn" onClick={addScheduleRow}>+</div>

          {scheduleList.map((sch, index) => (
            <div key={index} className="editclassschedule-box">
              <button
                type="button"
                className="editclass-delete-btn"
                onClick={() => removeSchedule(index)}
              >
                Cancel Schedule
              </button>

              <div className="editclassschedule-label">Day:</div>
              <select
                value={sch.day || ""}
                onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
              >
                <option value="">Select</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>

              <div className="editclassschedule-label">Location:</div>
              <select
                value={sch.location || ""}
                onChange={(e) => handleScheduleChange(index, "location", e.target.value)}
              >
                <option value="">Select</option>
                {[...Array(8)].map((_, floor) =>
                  [...Array(10)].map((_, room) => {
                    const val = `ROOM ${floor + 1}${(room + 1).toString().padStart(2, "0")}`;
                    return <option key={val} value={val}>{val}</option>;
                  })
                )}
              </select>

              <div className="editclassschedule-label">Start:</div>
              <select
                value={sch.start || ""}
                onChange={(e) => handleScheduleChange(index, "start", e.target.value)}
              >
                <option value="">Select</option>
                <option>07:00</option>
                <option>09:15</option>
                <option>13:00</option>
                <option>15:15</option>
                <option>17:30</option>
                <option>17:45</option>
              </select>

              <div className="editclassschedule-label">End:</div>
              <select
                value={sch.end || ""}
                onChange={(e) => handleScheduleChange(index, "end", e.target.value)}
              >
                <option value="">Select</option>
                <option>09:00</option>
                <option>10:15</option>
                <option>11:15</option>
                <option>15:00</option>
                <option>16:15</option>
                <option>17:15</option>
                <option>19:30</option>
                <option>21:00</option>
              </select>

              {errors[`schedule-${index}`] && (
                <div className="editclasserror-message">{errors[`schedule-${index}`]}</div>
              )}
            </div>
          ))}

          <div className="editclass-buttons">
            <button type="button" className="editclassbtn-cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="editclassbtn-save" disabled={loading}>
              {loading ? "Saving..." : "Update Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
