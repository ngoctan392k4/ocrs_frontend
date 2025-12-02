import React, { useEffect, useState, useRef } from "react";
import Menu from "../../menu/Menu";
import menu_instructor from "../../../assets/dataMenu/MenuInstructorData";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

import "../../../styles/instructor/Schedule/teachingSchedule.css";

const weekDayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export default function TeachingSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [semester, setSemester] = useState({});
  const calendarRef = useRef(null);

  useEffect(() => {
    loadTeachingSchedule();
  }, []);

  const formatTime = (date) =>
    `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

  const loadTeachingSchedule = async () => {
    try {
      const res = await fetch(
        "http://localhost:3001/api/instructor/schedule/teachingSchedule",
        { credentials: "include" }
      );

      const data = await res.json();
      console.log("ASSIGNED:", data.assigned);

      const semesterStart = data.currentSem?.start_date
        ? new Date(data.currentSem.start_date)
        : null;
      const semesterEnd = data.currentSem?.end_date
        ? new Date(data.currentSem.end_date)
        : null;

      if (!semesterStart || !semesterEnd) {
        console.error("Semester start or end date missing");
        return;
      }

      const events = [];

      (data.assigned || []).forEach((c) => {
        if (!c.schedule) return;

        // Tách nhiều ca theo dấu phẩy
        const schedules = c.schedule.split(",").map((s) => s.trim());
        const totalWeeklySessions = schedules.length;

        // Tính thời lượng mỗi buổi (giờ)
        const sessionDurations = schedules.map((sch) => {
          const [day, timeRange] = sch.split(" ");
          const [start, end] = timeRange.split("-");
          const [sh, sm] = start.split(":").map(Number);
          const [eh, em] = end.split(":").map(Number);
          return eh + em / 60 - (sh + sm / 60);
        });

        // Tổng số buổi cần học cho môn này
        const totalSessions = Math.ceil(
          c.lecture_hours / sessionDurations[0] // giả sử các ca có thời lượng bằng nhau
        );

        for (let i = 0; i < totalSessions; i++) {
          // Xác định ca tuần hiện tại
          const schIndex = i % totalWeeklySessions;
          const sch = schedules[schIndex];

          const [day, timeRange] = sch.split(" ");
          const [start, end] = timeRange.split("-");
          const targetDow = weekDayIndex[day];
          if (targetDow === undefined) continue;

          const [sh, sm] = start.split(":").map(Number);
          const [eh, em] = end.split(":").map(Number);

          // Xác định tuần: Math.floor(i / totalWeeklySessions)
          const weekOffset = Math.floor(i / totalWeeklySessions);
          const eventDate = new Date(semesterStart);
          eventDate.setDate(
            eventDate.getDate() + ((targetDow - eventDate.getDay() + 7) % 7) + weekOffset * 7
          );
          if (eventDate > semesterEnd) break;

          const startDateTime = new Date(eventDate);
          startDateTime.setHours(sh, sm, 0, 0);

          const endDateTime = new Date(eventDate);
          endDateTime.setHours(eh, em, 0, 0);

          events.push({
            title: `${c.classcode} | ${c.classname} | ${day} - ${c.classlocation} | ${formatTime(
              startDateTime
            )} - ${formatTime(endDateTime)}`,
            start: startDateTime,
            end: endDateTime,
          });
        }
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
        <Menu menus={menu_instructor} />
      </div>

      <div className="schedule-content">
        <div className="schedule-box">
          <div className="schedule-title">
            Study Schedule - {semester?.semid}
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

          <button className="update-btn" onClick={loadTeachingSchedule}>
            Update!
          </button>
        </div>
      </div>
    </div>
  );
}
