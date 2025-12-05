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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "http://localhost:3001/api/admin/ClassManagement/addClass"
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Failed to load data");
          return navigate("/classManagement");
        }

        setCourses(data.courses || []);
        setInstructors(data.instructors || []);

        let semesterToUse = data.semesterInfo;

        if (!semesterToUse) {
          semesterToUse = {
            semester_name: data.latestSemester?.semester_name || "",
            school_year: data.latestSemester?.school_year || "",
          };
        }

        setSemester(semesterToUse);

        setFormData((prev) => ({
          ...prev,
          semid: data.allowSemid,
        }));

      } catch (err) {
        console.error("Fetch error:", err.message);
        alert("Cannot connect to server");
        navigate("/classManagement");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHasChanges(true);

    if (name === "capacity") {
      let v = value;

      if (v === "") {
        setFormData((prev) => ({ ...prev, capacity: 0 }));
        return;
      }

      if (v.includes("-")) return;

      const num = Number(v);
      if (num > 200) v = 200;

      setFormData((prev) => ({ ...prev, capacity: v }));
      return;
    }

    if (name === "courseid") {
      const selected = courses.find((c) => c.courseid === value);
      setFormData((prev) => ({
        ...prev,
        courseid: value,
        classname: selected ? selected.coursename : "",
        classcode:
          value && prev.classcodeSuffix ? `${value}-${prev.classcodeSuffix}` : value ? `${value}-` : "",
      }));
      return;
    }

    if (name === "instructorid") {
      setFormData((prev) => ({ ...prev, instructorid: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (hasChanges) setShowCancelDialog(true);
    else navigate(-1);
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    navigate(-1);
  };

  const handleScheduleChange = (idx, field, value) => {
    const updated = [...scheduleList];
    updated[idx][field] = value;

    setScheduleList(updated);
    setFormData((prev) => ({ ...prev, schedule: updated }));

    const { day, start, end, location } = updated[idx];

    let err = "";
    if (!day || !start || !end || !location) err = "Please complete all schedule fields.";
    else if (start >= end) err = "End time must be later than start time.";

    const newErr = [...scheduleErrors];
    newErr[idx] = err;
    setScheduleErrors(newErr);
  };

  const addScheduleRow = () => {
    setScheduleList((prev) => [...prev, { day: "", start: "", end: "", location: "" }]);
    setScheduleErrors((prev) => [...prev, "Please complete all schedule fields."]);
  };

  const removeSchedule = (i) => {
    setScheduleList(scheduleList.filter((_, x) => x !== i));
    setScheduleErrors(scheduleErrors.filter((_, x) => x !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validation = {};

    if (!formData.courseid) validation.courseid = "This field is required";
    if (!formData.classcodeSuffix.trim()) validation.classcode = "This field is required";
    if (!formData.classname) validation.classname = "This field is required";
    if (!formData.instructorid) validation.instructorid = "This field is required";
    if (!formData.capacity) validation.capacity = "This field is required";

    if (formData.capacity < 10 || formData.capacity > 200)
      validation.capacity = "Capacity must be between 10 and 200";

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setLoading(false);
      return;
    }

    if (scheduleErrors.some((e) => e && e !== "")) {
      alert("Please fix schedule errors first.");
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
      classcode: formData.classcode,
      courseid: formData.courseid,
      instructorid: formData.instructorid,
      semid: formData.semid,
      classname: formData.classname,
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
        switch (result.code) {
          case "INSTRUCTOR_CONFLICT":
          case "LOCATION_CONFLICT":
          case "SCHEDULE_OVERLAP_INSIDE":
          case "SCHEDULE_OVERLAP":
            alert(result.message);
            break;

          case "DUPLICATE_CLASSCODE":
          case "PROC_DUPLICATE":
            setErrors((prev) => ({ ...prev, classcode: result.message }));
            break;

          default:
            alert(result.message || "Error adding class");
            break;
        }
      } else {
        alert("Class added successfully!");
        navigate("/classManagement");
      }
    } catch {
      alert("Cannot connect to server");
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
            value={courseOptions.find((o) => o.value === formData.courseid) || null}
            options={courseOptions}
            isClearable
            placeholder="Select Course"
            onChange={(selected) =>
              handleChange({ target: { name: "courseid", value: selected?.value || "" } })
            }
          />
          {errors.courseid && <div className="addclasserror-message">{errors.courseid}</div>}

          {/* CLASS CODE */}
          <div className="addclasslabel">Class Code:</div>
          <div className="addclasscode-row">
            <span className="addclasscode-prefix">
              {formData.courseid ? formData.courseid + "-" : ""}
            </span>

            {/* CLASSCODE SUFFIX WITH MAX LENGTH VALIDATION */}
            <input
              type="text"
              name="classcodeSuffix"
              value={formData.classcodeSuffix}
              onChange={(e) => {
                let suffix = e.target.value.replace(/\s/g, "");

                if (suffix.length > 5) {
                  setErrors((prev) => ({
                    ...prev,
                    classcode: "Classcode is too long (max 5 characters)",
                  }));
                  return;
                }

                setErrors((prev) => ({ ...prev, classcode: "" }));

                setFormData((prev) => ({
                  ...prev,
                  classcodeSuffix: suffix,
                  classcode: prev.courseid ? `${prev.courseid}-${suffix}` : suffix,
                }));
                setHasChanges(true);
              }}
            />
          </div>

          {errors.classcode && <div className="addclasserror-message">{errors.classcode}</div>}

          {/* CLASS NAME */}
          <div className="addclasslabel">Class Name:</div>
          <input className="addclassreadOnly" value={formData.classname} disabled />
          {errors.classname && <div className="addclasserror-message">{errors.classname}</div>}

          {/* INSTRUCTOR */}
          <div className="addclasslabel">Instructor:</div>
          <Select
            name="instructorid"
            value={instructorOptions.find((o) => o.value === formData.instructorid) || null}
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
            min="0"
            max="200"
            onChange={handleChange}
          />
          {errors.capacity && <div className="addclasserror-message">{errors.capacity}</div>}

          {/* SCHEDULE */}
          <div className="addclasslabel">Schedule:</div>
          <div className="addclassschedule-add-btn" onClick={addScheduleRow}>
            +
          </div>

          {scheduleList.map((sch, index) => (
            <div key={index} className="addclassschedule-box">
              <button
                type="button"
                className="addclass-delete-btn"
                onClick={() => {
                  removeSchedule(index);
                  setHasChanges(true);
                }}
              >
                Cancel Schedule
              </button>

              <div className="addclassschedule-label">Days:</div>
              <select
                value={sch.day}
                onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
              >
                <option value="">Select</option>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  )
                )}
              </select>

              <div className="addclassschedule-label">Location:</div>
              <select
                value={sch.location}
                onChange={(e) => handleScheduleChange(index, "location", e.target.value)}
              >
                <option value="">Select</option>
                {[...Array(8)].map((_, floor) =>
                  [...Array(10)].map((_, room) => {
                    const value =
                      "ROOM " + `${floor + 1}${(room + 1).toString().padStart(2, "0")}`;
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
                onChange={(e) => handleScheduleChange(index, "start", e.target.value)}
              >
                <option value="">Select</option>
                {["07:00", "09:15", "13:00", "15:15", "17:30", "17:45"].map((t) => (
                  <option key={t} value={t}>
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
                {["09:00", "10:15", "11:15", "15:00", "16:15", "17:15", "19:30", "21:00"].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  )
                )}
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

            {/* DISABLE ADD BUTTON WHEN ERROR EXISTS */}
            <button
              type="submit"
              className="addclassbtn-save"
              disabled={loading || errors.classcode}
            >
              {loading ? "Saving..." : "Add Class"}
            </button>
          </div>
        </form>
      </div>

      {/* CANCEL DIALOG */}
      {showCancelDialog && (
        <div className="addclasscancel-dialog-backdrop">
          <div className="addclasscancel-dialog-box">
            <div className="addclasscancel-dialog-message">
              You have unsaved changes. Do you really want to cancel?
            </div>
            <div className="addclasscancel-dialog-actions">
              <button className="addclasscancel-dialog-btn no" onClick={() => setShowCancelDialog(false)}>
                No
              </button>
              <button className="addclasscancel-dialog-btn yes" onClick={handleConfirmCancel}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
