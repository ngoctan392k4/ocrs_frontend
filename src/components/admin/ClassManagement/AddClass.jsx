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

  const [errors, setErrors] = useState({});
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
      HANDLE INPUTS
  ------------------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "capacity") {
      const val = Number(value);
      setErrors((prev) => ({
        ...prev,
        capacity: val < 10 || val > 200 ? "Capacity available 10-200" : "",
      }));
      setFormData((prev) => ({ ...prev, capacity: value }));
      return;
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
      setFormData((prev) => ({ ...prev, instructorid: value }));
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

    const { day, start, end, location } = updated[index];

    let errorMsg = "";
    if (!day || !start || !end || !location) {
      errorMsg = "Please complete all schedule fields.";
    } else if (start >= end) {
      errorMsg = "End time must be later than start time.";
    }

    setScheduleErrors((prev) => {
      const errList = [...prev];
      errList[index] = errorMsg;
      return errList;
    });
  };

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

    const errUpdated = scheduleErrors.filter((_, i) => i !== index);
    setScheduleErrors(errUpdated);
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

    const cap = Number(formData.capacity);
    if (cap < 10 || cap > 200)
      validationErrors.capacity = "Capacity available 10-200";

    if (scheduleErrors.some((e) => e && e !== "")) {
      alert("Please fix schedule errors before submitting.");
      setLoading(false);
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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

      if (!response.ok) {
        if (result.field) {
          setErrors((prev) => ({ ...prev, [result.field]: result.message }));
        } else {
          alert(result.message || "Error adding class.");
        }
      } else {
        // <-- Thêm phần này
        alert("Class added successfully!");
        navigate("/classManagement");
      }
    } catch (error) {
      alert("Error connecting to server.");
    }

    setLoading(false);
  };

  /* ------------------------------
      OPTIONS SELECT
  ------------------------------ */
  const courseOptions = courses.map((c) => ({
    value: c.courseid,
    label: `${c.courseid} — ${c.coursename}`,
  }));

  const instructorOptions = instructors.map((i) => ({
    value: i.instructorid,
    label: `${i.instructorid} — ${i.name}`,
  }));

  /* ------------------------------
      UI
  ------------------------------ */
  return (
    <div className="addclass-container">
      <Menu menus={menu_admin} />
      <div className="addclass-content">
        <h1 className="addclass-title">
          Add Class{" "}
          {semester &&
            ` - ${semester.semester_name} - School Year ${semester.school_year}`}
        </h1>

        <form className="addclass-form" onSubmit={handleSubmit}>
          {/* COURSE */}
          <div className="addclasslabel">Course:</div>
          <Select
            name="courseid"
            value={
              courseOptions.find((o) => o.value === formData.courseid) || null
            }
            options={courseOptions}
            isClearable
            placeholder="Select Course"
            onChange={(selected) =>
              handleChange({
                target: { name: "courseid", value: selected?.value || "" },
              })
            }
          />
          {errors.courseid && (
            <div className="addclasserror-message">{errors.courseid}</div>
          )}

          {/* CLASS CODE */}
          <div className="addclasslabel">Class Code:</div>
          <div className="addclasscode-row">
            <span className="addclasscode-prefix">
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
            <div className="addclasserror-message">{errors.classcode}</div>
          )}

          {/* CLASS NAME */}
          <div className="addclasslabel">Class Name:</div>
          <input
            className="addclassreadOnly"
            name="classname"
            value={formData.classname}
            disabled
          />
          {errors.classname && (
            <div className="addclasserror-message">{errors.classname}</div>
          )}

          {/* INSTRUCTOR */}
          <div className="addclasslabel">Instructor:</div>
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
            onChange={(selected) =>
              handleChange({
                target: { name: "instructorid", value: selected?.value || "" },
              })
            }
          />
          {errors.instructorid && (
            <div className="addclasserror-message">{errors.instructorid}</div>
          )}

          {/* CAPACITY */}
          <div className="addclasslabel">Capacity:</div>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
          />
          {errors.capacity && (
            <div className="addclasserror-message">{errors.capacity}</div>
          )}

          {/* SCHEDULE */}
          <div className="addclasslabel">Schedule:</div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="addclassschedule-add-btn" onClick={addScheduleRow}>
              +
            </div>
          </div>

          {scheduleList.map((sch, index) => (
            <div key={index} className="addclassschedule-box">
              <button
                type="button"
                className="addclass-delete-btn"
                onClick={() => removeSchedule(index)}
              >
                Cancel Schedule
              </button>

              <div className="addclassschedule-label">Days:</div>
              <select
                value={sch.day}
                onChange={(e) =>
                  handleScheduleChange(index, "day", e.target.value)
                }
              >
                <option value="">Select</option>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <div className="addclassschedule-label">Location:</div>
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

              <div className="addclassschedule-label">Start:</div>
              <select
                value={sch.start}
                onChange={(e) =>
                  handleScheduleChange(index, "start", e.target.value)
                }
              >
                <option value="">Select</option>
                {["07:00", "09:15", "13:00", "15:15", "17:30", "17:45"].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  )
                )}
              </select>

              <div className="addclassschedule-label">End:</div>
              <select
                value={sch.end}
                onChange={(e) =>
                  handleScheduleChange(index, "end", e.target.value)
                }
              >
                <option value="">Select</option>
                {[
                  "09:00",
                  "10:15",
                  "11:15",
                  "15:00",
                  "16:15",
                  "17:15",
                  "19:30",
                  "21:00",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {scheduleErrors[index] && (
                <div className="addclasserror-message" style={{ marginTop: 6 }}>
                  {scheduleErrors[index]}
                </div>
              )}
            </div>
          ))}

          <div className="addclass-buttons">
            <button
              type="submit"
              className="addclassbtn-save"
              disabled={loading}
            >
              {loading ? "Saving..." : "Add Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
