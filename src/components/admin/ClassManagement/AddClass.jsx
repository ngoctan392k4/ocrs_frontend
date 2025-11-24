import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import "../../../styles/admin/ClassManagement/AddClass.css";

export default function AddClass() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    classcode: "",
    classcodeSuffix: "",
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
  const [scheduleErrors, setScheduleErrors] = useState([]);

  const [loading, setLoading] = useState(false);

  /* ------------------------------
      FETCH DATA
  ------------------------------ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "http://localhost:3001/api/admin/ClassManagement/addClass"
        );
        const data = await res.json();

        setCourses(data.courses || []);
        setInstructors(data.instructors || []);

        if (data.semesterlat?.length > 0) {
          const sem = data.semesterlat[0];
          setSemester(sem);
          setFormData((prev) => ({ ...prev, semid: sem.semid }));
        }
      } catch (err) {
        console.error("Fetch error:", err.message);
      }
    };

    fetchData();
  }, []);

  /* ------------------------------
      HANDLE INPUT CHANGE
  ------------------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "capacity") {
      if (value < 10 || value > 200) {
        setErrors((prev) => ({
          ...prev,
          capacity: "Capacity available 10-200",
        }));
      } else {
        setErrors((prev) => ({ ...prev, capacity: "" }));
      }
    }

    if (name === "courseid") {
      const selectedCourse = courses.find((c) => c.courseid === value);

      setFormData((prev) => ({
        ...prev,
        courseid: value,
        classname: selectedCourse ? selectedCourse.coursename : "",
        classcode:
          value && prev.classcodeSuffix
            ? `${value}-${prev.classcodeSuffix}`
            : value
            ? `${value}-`
            : "",
      }));

      return;
    }

    if (name === "instructorid") {
      setFormData((prev) => ({
        ...prev,
        instructorid: value,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ------------------------------
      SCHEDULE CHANGE + VALIDATION
  ------------------------------ */
  const handleScheduleChange = (index, field, value) => {
    const updated = [...scheduleList];
    updated[index][field] = value;

    setScheduleList(updated);
    setFormData((prev) => ({ ...prev, schedule: updated }));

    const { day, start, end, location } = updated[index];

    if (!day || !start || !end || !location) {
      setScheduleErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = "Please complete all schedule fields.";
        return newErrors;
      });
      return;
    }

    if (start >= end) {
      setScheduleErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = "End time must be later than start time.";
        return newErrors;
      });
      return;
    }

    setScheduleErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = "";
      return newErrors;
    });
  };

  /* ------------------------------
      ADD SCHEDULE ROW
  ------------------------------ */
  const addScheduleRow = () => {
    setScheduleList((prev) => [
      ...prev,
      { day: "", start: "", end: "", location: "" },
    ]);

    setScheduleErrors((prev) => [
      ...prev,
      "Please complete all schedule fields.",
    ]);
  };
  const removeSchedule = (index) => {
    const updated = scheduleList.filter((_, i) => i !== index);
    setScheduleList(updated);
    setFormData((prev) => ({ ...prev, schedule: updated }));
  };

  /* ------------------------------
      SUBMIT
  ------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let validationErrors = {};

    if (!formData.courseid)
      validationErrors.courseid = "This field is required";
    if (!formData.classcodeSuffix.trim())
      validationErrors.classcode = "This field is required";
    if (!formData.classname)
      validationErrors.classname = "This field is required";
    if (!formData.instructorid)
      validationErrors.instructorid = "This field is required";
    if (!formData.capacity)
      validationErrors.capacity = "This field is required";

    if (formData.capacity < 10 || formData.capacity > 200) {
      validationErrors.capacity = "Capacity available 10-200";
    }

    // Schedule validation
    const foundError = scheduleErrors.some((err) => err !== "");

    if (foundError) {
      alert("Please fix schedule errors before submitting.");
      setLoading(false);
      return;
    }

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
      semid: formData.semid,
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
        navigate("/classManagement");
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Error connecting to server.");
    }

    setLoading(false);
  };

  const courseOptions = courses.map((c) => ({
    value: c.courseid,
    label: `${c.courseid} — ${c.coursename}`,
  }));

  const instructorOptions = instructors.map((i) => ({
    value: i.instructorid,
    label: `${i.instructorid} — ${i.name}`,
  }));

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
          <Select
            name="courseid"
            value={
              courseOptions.find((o) => o.value === formData.courseid) || null
            }
            options={courseOptions}
            isClearable
            placeholder="Select Course"
            onChange={(selectedOption) => {
              handleChange({
                target: {
                  name: "courseid",
                  value: selectedOption?.value || "",
                },
              });
            }}
          />

          {errors.courseid && (
            <div className="error-message">{errors.courseid}</div>
          )}

          {/* CLASS CODE */}
          <div className="label">Class Code:</div>
          <div className="classcode-row">
            <span className="classcode-prefix">
              {formData.courseid ? formData.courseid + "-" : ""}
            </span>
            <input
              type="text"
              name="classcodeSuffix"
              value={formData.classcodeSuffix}
              onChange={(e) => {
                const suffix = e.target.value.replace(/\s/g, "");
                setFormData((prev) => ({
                  ...prev,
                  classcodeSuffix: suffix,
                  classcode: prev.courseid
                    ? `${prev.courseid}-${suffix}`
                    : suffix,
                }));
              }}
            />
          </div>

          {errors.classcode && (
            <div className="error-message">{errors.classcode}</div>
          )}

          {/* CLASS NAME */}
          <div className="label">Class Name:</div>
          <input
            className="readOnly"
            name="classname"
            value={formData.classname}
            disabled
          />
          {errors.classname && (
            <div className="error-message">{errors.classname}</div>
          )}

          {/* INSTRUCTOR */}
          <div className="label">Instructor:</div>
          <Select
            name="instructorid"
            value={
              instructorOptions.find(
                (o) => o.value === formData.instructorid
              ) || null
            }
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
              <button
                type="button"
                className="addclass-delete-btn"
                onClick={() => removeSchedule(index)}
              >
                Cancel Schedule
              </button>
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

              {/* SCHEDULE ERROR */}
              {scheduleErrors[index] && (
                <div className="error-message" style={{ marginTop: "6px" }}>
                  {scheduleErrors[index]}
                </div>
              )}
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
