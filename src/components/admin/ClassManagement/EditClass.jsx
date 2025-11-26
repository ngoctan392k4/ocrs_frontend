/** -------------- EDIT CLASS - REFACTORED VERSION ---------------- */

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
    capacity: 0,
    schedule: [],
  });

  const [errors, setErrors] = useState({});
  const [instructors, setInstructors] = useState([]);

  const [scheduleList, setScheduleList] = useState([]);
  const [scheduleErrors, setScheduleErrors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  /* ------------------------- LOAD CLASS ------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/admin/ClassManagement/editClass/${encodeURIComponent(
            clsid
          )}`
        );
        const data = await res.json();

        setInstructors(data.instructors || []);

        const cls = data.classes;
        if (!cls) return;

        // Convert schedule from backend format → FE format
        const safeSchedule = Array.isArray(cls.schedule)
          ? cls.schedule.map((s) => ({
              day: s.day,
              start: s.start,
              end: s.end,
              location: s.location,
            }))
          : [];

        setFormData({
          classcode: cls.classcode,
          courseid: cls.courseid,
          classname: cls.classname,
          instructorid: cls.instructorid,
          semid: cls.semid,
          capacity: cls.capacity,
          schedule: safeSchedule,
        });

        setScheduleList(safeSchedule);
        setScheduleErrors(safeSchedule.map(() => ""));
      } catch (err) {
        console.error(err);
        alert("Error loading class data");
      }
    };

    fetchData();
  }, [clsid]);

  /* ------------------------- HANDLE INPUT ------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHasChanges(true);

    if (name === "capacity") {
      const num = Number(value);
      if (num > 200) return setFormData((p) => ({ ...p, capacity: 200 }));
      if (num < 0) return;
      return setFormData((p) => ({ ...p, capacity: num }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ------------------------- SCHEDULE HANDLER ------------------------- */
  const handleScheduleChange = (index, field, value) => {
    const updated = [...scheduleList];
    updated[index][field] = value;

    setScheduleList(updated);
    setFormData((prev) => ({ ...prev, schedule: updated }));
    setHasChanges(true);

    /* VALIDATE LIKE ADDCLASS */
    const { day, start, end, location } = updated[index];

    let errorMsg = "";
    if (!day || !start || !end || !location) {
      errorMsg = "Please complete all schedule fields.";
    } else if (start >= end) {
      errorMsg = "End time must be later than start time.";
    }

    const newErrors = [...scheduleErrors];
    newErrors[index] = errorMsg;
    setScheduleErrors(newErrors);
  };

  const addScheduleRow = () => {
    setScheduleList((p) => [
      ...p,
      { day: "", start: "", end: "", location: "" },
    ]);
    setScheduleErrors((p) => [...p, "Please complete all schedule fields."]);
  };

  const removeSchedule = (index) => {
    setScheduleList((prev) => prev.filter((_, i) => i !== index));
    setScheduleErrors((prev) => prev.filter((_, i) => i !== index));

    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };

  /* ------------------------- SUBMIT ------------------------- */
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  let validationErrors = {};
  const requiredFields = ["instructorid", "capacity"];
  requiredFields.forEach((f) => {
    if (!formData[f] || formData[f].toString().trim() === "") {
      validationErrors[f] = "This field is required";
    }
  });

  if (scheduleErrors.some((e) => e)) {
    alert("Please fix schedule errors before submitting.");
    setLoading(false);
    return;
  }

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    setLoading(false);
    return;
  }

  const payload = { ...formData, schedule: scheduleList };

  try {
    const response = await fetch(
      `http://localhost:3001/api/admin/ClassManagement/editClass/${encodeURIComponent(clsid)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      if (result.code === "SCHEDULE_OVERLAP_INSIDE") {
        alert("Schedule overlap inside class! Please adjust.");
        setLoading(false);
        return;
      }

      if (result.code === "INSTRUCTOR_CONFLICT") {
        alert(result.message);
        setLoading(false);
        return;
      }

      if (result.code === "LOCATION_CONFLICT") {
        alert(result.message);
        setLoading(false);
        return;
      }

      if (result.field === "classcode") {
        setErrors((prev) => ({ ...prev, classcode: "Class Code is existed!" }));
        setLoading(false);
        return;
      }

      alert(result.message || "Error updating class.");
      setLoading(false);
      return;
    }

    alert("Class updated successfully!");
    navigate("/classManagement");
  } catch (error) {
    console.error("Error updating class:", error);
    alert("Error connecting to server.");
  }

  setLoading(false);
};

  const instructorOptions = instructors.map((i) => ({
    value: i.instructorid,
    label: `${i.instructorid} — ${i.name}`,
  }));

  /* ------------------------- RENDER ------------------------- */
  return (
    <div className="editclass-container">
      <Menu menus={menu_admin} />
      <div className="editclass-content">
        <h1 className="editclass-title">Edit Class — {formData.classcode}</h1>

        <form className="editclass-form" onSubmit={handleSubmit}>
          {/* Class code */}
          <div className="editclasslabel">Class Code:</div>
          <input
            className="editclassreadOnly"
            value={formData.classcode}
            disabled
          />

          {/* Name */}
          <div className="editclasslabel">Class Name:</div>
          <input
            className="editclassreadOnly"
            value={formData.classname}
            disabled
          />

          {/* Instructor */}
          <div className="editclasslabel">Instructor:</div>
          <Select
            value={
              instructorOptions.find(
                (o) => o.value === formData.instructorid
              ) || null
            }
            options={instructorOptions}
            onChange={(opt) =>
              handleChange({
                target: { name: "instructorid", value: opt?.value || "" },
              })
            }
            isClearable
            placeholder="Select Instructor"
          />
          {errors.instructorid && (
            <div className="editclasserror-message">{errors.instructorid}</div>
          )}

          {/* Capacity */}
          <div className="editclasslabel">Capacity:</div>
          <input
            type="number"
            name="capacity"
            min={0}
            max={200}
            value={formData.capacity}
            onChange={handleChange}
          />
          {errors.capacity && (
            <div className="editclasserror-message">{errors.capacity}</div>
          )}

          {/* Schedule */}
          <div className="label">Schedule:</div>
          <div className="editclassschedule-add-btn" onClick={addScheduleRow}>
            +
          </div>

          {scheduleList.map((sch, index) => (
            <div key={index} className="editclassschedule-box">
              <button
                type="button"
                className="editclass-delete-btn"
                onClick={() => {
                  removeSchedule(index)
                  setHasChanges(true);
                  }
                }
              >
                Cancel Schedule
              </button>

              <div className="editclassschedule-label">Day:</div>
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
                  <option key={d}>{d}</option>
                ))}
              </select>

              <div className="editclassschedule-label">Location:</div>
              <select
                value={sch.location}
                onChange={(e) =>
                  handleScheduleChange(index, "location", e.target.value)
                }
              >
                <option value="">Select</option>
                {[...Array(8)].map((_, floor) =>
                  [...Array(10)].map((_, room) => {
                    const val = `ROOM ${floor + 1}${(room + 1)
                      .toString()
                      .padStart(2, "0")}`;
                    return (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    );
                  })
                )}
              </select>

              <div className="editclassschedule-label">Start:</div>
              <select
                value={sch.start}
                onChange={(e) =>
                  handleScheduleChange(index, "start", e.target.value)
                }
              >
                <option value="">Select</option>
                {["07:00", "09:15", "13:00", "15:15", "17:30", "17:45"].map(
                  (t) => (
                    <option key={t}>{t}</option>
                  )
                )}
              </select>

              <div className="editclassschedule-label">End:</div>
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
                  <option key={t}>{t}</option>
                ))}
              </select>

              {scheduleErrors[index] && (
                <div className="editclasserror-message">
                  {scheduleErrors[index]}
                </div>
              )}
            </div>
          ))}

          <div className="editclass-buttons">
            <button
              type="button"
              className="editclassbtn-cancel"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="editclassbtn-save"
              disabled={loading}
            >
              {loading ? "Saving..." : "Update Class"}
            </button>
          </div>
        </form>
      </div>

      {/* Cancel dialog */}
      {showCancelDialog && (
        <div className="editclasscancel-dialog-backdrop">
          <div className="editclasscancel-dialog-box">
            <div className="editclasscancel-dialog-message">
              You have unsaved changes. Do you really want to cancel?
            </div>
            <div className="editclasscancel-dialog-actions">
              <button 
                className="editclasscancel-dialog-btn no"
                onClick={() => setShowCancelDialog(false)}
                >
                    No
              </button>
              <button 
                className="editclasscancel-dialog-btn yes"
                onClick={() => navigate(-1)}
                >
                  Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
