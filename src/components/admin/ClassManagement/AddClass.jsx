import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import "../../../styles/admin/ClassManagement/AddClass.css";

export default function AddClass() {
  const navigate = useNavigate();

  // ----------------------------
  // FIX STRICT MODE DOUBLE FETCH
  // ----------------------------
  const fetchedRef = useRef(false);

  const [formData, setFormData] = useState({
    classcode: "",
    classcodeSuffix: "",
    courseid: "",
    instructorid: "",
    classname: "",
    semid: "",
    capacity: 0,
    schedule: [],
  });

  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [semester, setSemester] = useState(null);
  const [scheduleList, setScheduleList] = useState([]);
  const [scheduleErrors, setScheduleErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  /* ------------------------------------------------------
     FETCH DATA — FIXED STRICT MODE DOUBLE RUN
  ------------------------------------------------------ */
  useEffect(() => {
    if (fetchedRef.current) return;  // <--- FIX LẶP 2 LẦN
    fetchedRef.current = true;

    const load = async () => {
      try {
        const res = await fetch(
          "http://localhost:3001/api/admin/ClassManagement/addClass"
        );
        const data = await res.json();

        if (!res.ok) {
          switch (data.code) {
            case "CURRENT_EQUALS_LATEST":
              alert("Next semester not created yet!");
              navigate("/classManagement");
              return;

            case "DEADLINE_EXPIRED_14":
              alert("The deadline for adding classes has expired");
              navigate("/classManagement");
              return;

            case "NO_COURSE_LATEST":
              alert(data.message);
              navigate("/classManagement");
              return;

            case "NO_LATEST_SEMESTER":
              alert("No latest semester found!");
              navigate("/classManagement");
              return;

            default:
              alert(data.message || "Server Error");
              navigate("/classManagement");
              return;
          }
        }

        setSemester(data.semesterInfo);
        setFormData((prev) => ({
          ...prev,
          semid: data.allowSemid,
        }));

        setCourses(data.courses || []);
        setInstructors(data.instructors || []);

      } catch (err) {
        console.error(err);
        alert("Cannot connect to server");
        navigate("/classManagement");
      }
    };

    load();
  }, []);

  /* ------------------------------------------------------
      HANDLE FORM CHANGES
  ------------------------------------------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHasChanges(true);

    if (name === "capacity") {
      let val = value;
      if (val === "") {
        setFormData((p) => ({ ...p, capacity: 0 }));
        return;
      }
      if (val.includes("-")) return;

      const num = Number(val);
      if (num > 200) {
        setFormData((p) => ({ ...p, capacity: 200 }));
        return;
      }
      setFormData((p) => ({ ...p, capacity: num }));
      return;
    }

    if (name === "courseid") {
      const selected = courses.find((c) => c.courseid === value);
      setFormData((prev) => ({
        ...prev,
        courseid: value,
        classname: selected ? selected.coursename : "",
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
      setFormData((p) => ({ ...p, instructorid: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (hasChanges) setShowCancelDialog(true);
    else navigate(-1);
  };

  const handleConfirmCancel = () => navigate(-1);

  const addScheduleRow = () => {
    setScheduleList((prev) => [...prev, { day: "", start: "", end: "", location: "" }]);
    setScheduleErrors((prev) => [...prev, "Please complete all schedule fields."]);
    setHasChanges(true);
  };

  const removeSchedule = (index) => {
    const u = scheduleList.filter((_, i) => i !== index);
    setScheduleList(u);
    setFormData((p) => ({ ...p, schedule: u }));

    const e = scheduleErrors.filter((_, i) => i !== index);
    setScheduleErrors(e);
    setHasChanges(true);
  };

  const handleScheduleChange = (idx, field, value) => {
    const updated = [...scheduleList];
    updated[idx][field] = value;

    setScheduleList(updated);
    setFormData((p) => ({ ...p, schedule: updated }));

    const { day, start, end, location } = updated[idx];
    let error = "";

    if (!day || !start || !end || !location) {
      error = "Please complete all schedule fields.";
    } else if (start >= end) {
      error = "End time must be later than start time.";
    }

    const errCopy = [...scheduleErrors];
    errCopy[idx] = error;
    setScheduleErrors(errCopy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let vErr = {};

    if (!formData.courseid) vErr.courseid = "Required";
    if (!formData.classcodeSuffix.trim()) vErr.classcode = "Required";
    if (!formData.classname) vErr.classname = "Required";
    if (!formData.instructorid) vErr.instructorid = "Required";
    if (!formData.capacity) vErr.capacity = "Required";

    if (Object.keys(vErr).length > 0) {
      setErrors(vErr);
      setLoading(false);
      return;
    }

    if (scheduleErrors.some((e) => e && e !== "")) {
      alert("Fix schedule errors before submitting");
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
      const res = await fetch(
        "http://localhost:3001/api/admin/ClassManagement/addClass",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        switch (result.code) {
          case "INSTRUCTOR_CONFLICT":
          case "LOCATION_CONFLICT":
          case "SCHEDULE_OVERLAP_INSIDE":
          case "SCHEDULE_OVERLAP":
            alert(result.message);
            break;

          case "DUPLICATE_CLASSCODE":
          case "PROC_DUPLICATE":
            setErrors((p) => ({ ...p, classcode: result.message }));
            break;

          default:
            alert(result.message || "Error adding class");
        }
        setLoading(false);
        return;
      }

      alert("Class added successfully!");
      navigate("/classManagement");
    } catch (err) {
      alert("Server error");
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
            options={courseOptions}
            value={courseOptions.find((x) => x.value === formData.courseid)}
            isClearable
            placeholder="Select Course"
            onChange={(x) =>
              handleChange({
                target: { name: "courseid", value: x?.value || "" },
              })
            }
          />
          {errors.courseid && <div className="addclasserror-message">{errors.courseid}</div>}

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
                const suf = e.target.value.replace(/\s/g, "");
                setFormData((p) => ({
                  ...p,
                  classcodeSuffix: suf,
                  classcode: p.courseid ? `${p.courseid}-${suf}` : suf,
                }));
              }}
            />
          </div>
          {errors.classcode && (
            <div className="addclasserror-message">{errors.classcode}</div>
          )}

          {/* CLASS NAME */}
          <div className="addclasslabel">Class Name:</div>
          <input className="addclassreadOnly" value={formData.classname} disabled />

          {/* INSTRUCTOR */}
          <div className="addclasslabel">Instructor:</div>
          <Select
            name="instructorid"
            options={instructorOptions}
            value={instructorOptions.find((x) => x.value === formData.instructorid)}
            isClearable
            placeholder="Select Instructor"
            onChange={(x) =>
              handleChange({
                target: { name: "instructorid", value: x?.value || "" },
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
            min={10}
            max={200}
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
                onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
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
                {[...Array(8)].map((_, f) =>
                  [...Array(10)].map((_, r) => {
                    const val = `ROOM ${f + 1}${(r + 1)
                      .toString()
                      .padStart(2, "0")}`;
                    return (
                      <option value={val} key={val}>
                        {val}
                      </option>
                    );
                  })
                )}
              </select>

              <div className="addclassschedule-label">Start:</div>
              <select
                value={sch.start}
                onChange={(e) => handleScheduleChange(index, "start", e.target.value)}
              >
                <option value="">Select</option>
                {["07:00", "09:15", "13:00", "15:15", "17:30", "17:45"].map((t) => (
                  <option value={t} key={t}>
                    {t}
                  </option>
                ))}
              </select>

              <div className="addclassschedule-label">End:</div>
              <select
                value={sch.end}
                onChange={(e) => handleScheduleChange(index, "end", e.target.value)}
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
                  <option value={t} key={t}>
                    {t}
                  </option>
                ))}
              </select>

              {scheduleErrors[index] && (
                <div className="addclasserror-message">{scheduleErrors[index]}</div>
              )}
            </div>
          ))}

          {/* BUTTONS */}
          <div className="addclass-buttons">
            <button type="button" className="addclassbtn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="addclassbtn-save" disabled={loading}>
              {loading ? "Saving..." : "Add Class"}
            </button>
          </div>
        </form>
      </div>

      {/* CANCEL DIALOG */}
      {showCancelDialog && (
        <div className="addclasscancel-dialog-backdrop">
          <div className="addclasscancel-dialog-box">
            <div>You have unsaved changes. Cancel?</div>
            <div className="addclasscancel-dialog-actions">
              <button onClick={() => setShowCancelDialog(false)}>No</button>
              <button onClick={handleConfirmCancel}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
