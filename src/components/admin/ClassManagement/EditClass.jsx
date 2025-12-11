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
    <div className="addclass-container">
      <Menu menus={menu_admin} />
      <div className="addclass-content">
        <h1 className="page-title">Edit Class — {formData.classcode}</h1>

        <form className="form-container" onSubmit={handleSubmit}>
          {/* Class code */}
          <div className="form-row">
            <label className="form-label">Class Code</label>
            <input
              className="form-readonly"
              value={formData.classcode}
              disabled
            />
          </div>

          {/* Name */}
          <div className="form-row">
            <label className="form-label">Class Name</label>
            <input
              className="form-readonly"
              value={formData.classname}
              disabled
            />
          </div>

          {/* Instructor */}
          <div className="form-row">
            <label className="form-label">Instructor</label>
            <div className="form-select-container">
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
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#f5f7fa",
                    borderColor: "#d9e8f5",
                    "&:hover": { borderColor: "#8db3d4" },
                    "&:focus-within": { borderColor: "#8db3d4" },
                  }),
                  option: (base, { isSelected }) => ({
                    ...base,
                    backgroundColor: isSelected ? "#8db3d4" : "white",
                    color: isSelected ? "white" : "#3a5a7a",
                  }),
                }}
              />
            </div>
          </div>
          {errors.instructorid && (
            <div className="form-error">{errors.instructorid}</div>
          )}

          {/* Capacity */}
          <div className="form-row">
            <label className="form-label">Capacity</label>
            <input
              className="form-input"
              type="number"
              name="capacity"
              min={0}
              max={200}
              value={formData.capacity}
              onChange={handleChange}
            />
          </div>
          {errors.capacity && (
            <div className="form-error">{errors.capacity}</div>
          )}

          {/* Schedule */}
          <div className="form-row">
            <label className="form-label">Schedule</label>
            <div className="addclassschedule-add-btn" onClick={addScheduleRow}>
              +
            </div>
          </div>

          {scheduleList.map((sch, index) => (
            <div key={index} className="addclassschedule-box">
              <button
                type="button"
                className="btn-delete"
                onClick={() => {
                  removeSchedule(index);
                  setHasChanges(true);
                }}
              >
                × Remove
              </button>

              <div className="schedule-field">
                <label className="addclassschedule-label">Days</label>
                <select
                  className="form-input"
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
              </div>

              <div className="schedule-field">
                <label className="addclassschedule-label">Location</label>
                <select
                  className="form-input"
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
              </div>

              <div className="schedule-field">
                <label className="addclassschedule-label">Start</label>
                <select
                  className="form-input"
                  value={sch.start}
                  onChange={(e) =>
                    handleScheduleChange(index, "start", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {["07:00", "09:15", "13:00", "15:15", "17:30", "17:45"].map(
                    (t) => (
                      <option value={t} key={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="schedule-field">
                <label className="addclassschedule-label">End</label>
                <select
                  className="form-input"
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
                    <option value={t} key={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {scheduleErrors[index] && (
                <div className="form-error">{scheduleErrors[index]}</div>
              )}
            </div>
          ))}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Update Class"}
            </button>
          </div>
        </form>
      </div>

      {/* Cancel dialog */}
      {showCancelDialog && (
        <div className="dialog-backdrop">
          <div className="dialog-box">
            <p className="dialog-message">
              You have unsaved changes. Do you really want to cancel?
            </p>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowCancelDialog(false)}
              >
                No
              </button>
              <button
                type="button"
                className="btn-primary"
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
