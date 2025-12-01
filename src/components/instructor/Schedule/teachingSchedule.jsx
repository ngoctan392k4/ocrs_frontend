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

  // Helper format thời gian HH:mm
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

      // Lấy ngày bắt đầu và kết thúc kỳ học từ data.currentSem
      const semesterStart = data.currentSem?.start_date ? new Date(data.currentSem.start_date) : null;
      const semesterEnd = data.currentSem?.end_date ? new Date(data.currentSem.end_date) : null;

      if (!semesterStart || !semesterEnd) {
        console.error("Semester start or end date missing");
        return;
      }

      const events = [];

      (data.assigned || []).forEach((c) => {
        if (!c.schedule || !c.schedule.includes(" ")) return;

        const [day, timeRange] = c.schedule.split(" ");
        if (!timeRange || !timeRange.includes("-")) return;

        const [start, end] = timeRange.split("-");
        const targetDow = weekDayIndex[day];
        if (targetDow === undefined) return;

        // Tính thời lượng 1 buổi học (giờ)
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        const sessionDurationHours = (eh + em / 60) - (sh + sm / 60);

        if (sessionDurationHours <= 0) return;

        // Số buổi cần dạy để đủ lecture_hours
        const sessionsNeeded = Math.ceil(c.lecture_hours / sessionDurationHours);

        // Tìm ngày đầu tuần chứa semesterStart cho đúng thứ ngày dạy
        const firstEventDate = new Date(semesterStart);
        firstEventDate.setDate(
          firstEventDate.getDate() + ((targetDow - firstEventDate.getDay() + 7) % 7)
        );

        // Tạo các sự kiện lặp hàng tuần
        for (let i = 0; i < sessionsNeeded; i++) {
          const eventDate = new Date(firstEventDate);
          eventDate.setDate(eventDate.getDate() + i * 7);

          if (eventDate > semesterEnd) break;

          // Đặt thời gian bắt đầu và kết thúc
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
