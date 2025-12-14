import React, { useEffect, useState, useRef } from "react";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

import "../../../styles/student/Schedule/studySchedule.css";
import Chatbot from "../Chatbot/Chatbot";

const weekDayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export default function StudySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [semester, setSemester] = useState({});
  const calendarRef = useRef(null);

  useEffect(() => {
    loadStudySchedule();
  }, []);

  const formatTime = (date) =>
    `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

  const loadStudySchedule = async () => {
    try {
      const res = await fetch(
        "http://localhost:3001/api/student/schedule/studySchedule",
        { credentials: "include" }
      );

      const data = await res.json();
      console.log("ENROLLED:", data.enrolled);

      const semesterStart = data.currentSem?.start_date
        ? new Date(data.currentSem.start_date)
        : null;

      const semesterEnd = data.currentSem?.end_date
        ? new Date(data.currentSem.end_date)
        : null;

      const offsetStart = new Date(semesterStart);
      offsetStart.setDate(offsetStart.getDate() + 7);

      if (!semesterStart || !semesterEnd) {
        console.error("Semester start or end date missing");
        return;
      }

      const events = [];

      (data.enrolled || []).forEach((c) => {
        if (!c.schedule || !c.classlocation) return;

        const locationMap = {};

        c.classlocation.split(",").forEach((x) => {
          const part = x.trim();
          if (part.includes(" - ")) {
            const [d, r] = part.split(" - ");
            locationMap[d.trim()] = r.trim();
          }
        });

        const schedules = c.schedule.split(",").map((s) => s.trim());

        schedules.forEach((sch) => {
          if (!sch.includes(" ")) return;

          const [day, timeRange] = sch.split(" ");
          if (!timeRange || !timeRange.includes("-")) return;

          const [start, end] = timeRange.split("-");
          const targetDow = weekDayIndex[day];
          if (targetDow === undefined) return;

          const roomOnly = locationMap[day] || "ROOM ???";

          const [sh, sm] = start.split(":").map(Number);
          const [eh, em] = end.split(":").map(Number);

          const sessionDurationHours = eh + em / 60 - (sh + sm / 60);
          if (sessionDurationHours <= 0) return;

          const sessionsNeeded = Math.ceil(
            c.lecture_hours / sessionDurationHours
          );

          const firstEventDate = new Date(offsetStart);
          firstEventDate.setDate(
            firstEventDate.getDate() +
              ((targetDow - firstEventDate.getDay() + 7) % 7)
          );

          for (let i = 0; i < sessionsNeeded; i++) {
            const eventDate = new Date(firstEventDate);
            eventDate.setDate(eventDate.getDate() + i * 7);
            if (eventDate > semesterEnd) break;

            const startDateTime = new Date(eventDate);
            startDateTime.setHours(sh, sm, 0, 0);

            const endDateTime = new Date(eventDate);
            endDateTime.setHours(eh, em, 0, 0);

            // FINAL TITLE – CHUẨN THEO YÊU CẦU
            events.push({
              title: `${c.classcode} | ${
                c.classname
              } | ${roomOnly} | ${formatTime(startDateTime)} - ${formatTime(
                endDateTime
              )}`,
              start: startDateTime,
              end: endDateTime,
            });
          }
        });
      });

      setSchedule(events);
      setSemester(data.currentSem || {});
    } catch (err) {
      console.error("Error loading schedule:", err);
    }
  };

  const switchView = (view) => {
    const api = calendarRef.current?.getApi();
    api.changeView(view);
  };

  return (
    <div className="schedule-container">
      <div className="sidebar">
        <Menu menus={menu_student} />
      </div>

      <div className="schedule-content">
        <Chatbot/>
        <div className="schedule-box">
          <div className="schedule-title">
            <span>Study Schedule - {semester?.semid}</span>
            <button className="update-btn" onClick={loadStudySchedule}>
              Update!
            </button>
          </div>

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="timeGridWeek"
            events={schedule}
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="21:30:00"
            firstDay={1}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{
              today: "Today",
              month: "Monthly",
              week: "Weekly",
              day: "Daily",
            }}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
          />

        </div>
      </div>
    </div>
  );
}
