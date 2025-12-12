import React, { useEffect, useState, useRef, useContext } from "react";
import logo from "../../assets/logo/logotruong.png";
import campus from "../../assets/logo/campus.svg";
import "../../styles/common/header.css";
import LogoutButton from "../auth/Logout";
import { AuthContext } from "../auth/AuthSession";

const Header = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const tickClass = now.getSeconds() % 2 === 0 ? "tick" : "";

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  // avatar dropdown state + outside click
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const { user } = useContext(AuthContext);

  // announcement ticker (micro-messages) - role-agnostic messages suitable for admin/instructor/student
  const messages = [
    "Welcome to XYZ University portal — check recent updates.",
    "Merry Christmas and Happy New Year from XYZ University! 🎄🎉",
    "Reminder: complete your profile for better experience. ✍️",
  ];
  const [currentMsg, setCurrentMsg] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);

  useEffect(() => {
    if (tickerPaused) return;
    const id = setInterval(() => setCurrentMsg((i) => (i + 1) % messages.length), 4500);
    return () => clearInterval(id);
  }, [tickerPaused]);

  // helper to compute initials from user object
  function getInitials(u) {
    if (!u) return "--";
    // try common fields
    const name = u.displayName || u.fullname || u.name || u.username || `${u.firstname || ""} ${u.lastname || ""}`;
    if (!name) return "--";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <a href="/" className="app-header-left" aria-label="XYZ University home">
          <div className="app-logo">
            <img src={logo} alt="XYZ University logo" />
          </div>
          <div className="app-univ">
            <div className="app-univ-name">XYZ University</div>
            <div className="app-univ-tag">Excellence &amp; Integrity</div>
          </div>
          <div className="campus-deco" aria-hidden="true">
            <img src={campus} alt="" />
          </div>
        </a>

        <div className="app-header-center">
          {/* Announcement ticker (rotating micro-messages with emoji) */}
          <div
            className="header-ticker"
            onMouseEnter={() => setTickerPaused(true)}
            onMouseLeave={() => setTickerPaused(false)}
            aria-live="polite"
          >
            <div className="ticker-icon" aria-hidden="true">📢</div>
            <div className="ticker-text" role="text">{messages[currentMsg]}</div>
          </div>
        </div>

        <div className="app-header-right">
          <div className={`app-clock ${tickClass}`} aria-live="polite" title={now.toLocaleString()}>
            <div className="clock-time" role="timer" aria-atomic="true">
              <span className="clock-h" aria-label={`${hours} hours`}>{hours}</span>
              <span className="clock-sep" aria-hidden= "true">:</span>
              <span className="clock-m" aria-label={`${minutes} minutes`}>{minutes}</span>
              <span className="clock-sep" aria-hidden= "true">:</span>
              <span className="clock-s" aria-label={`${seconds} seconds`}>{seconds}</span>
            </div>
            <div className="clock-date">{dateStr}</div>
          </div>

          <div className="header-actions">
                        <div className="avatar" title="User" ref={avatarRef} onClick={() => setMenuOpen((v) => !v)}>
              <span>{getInitials(user)}</span>
                <div className={`avatar-menu ${menuOpen ? "open" : ""}`} role="menu">
                  <button className="menuitem" role="menuitem">Profile</button>
                  <button className="menuitem" role="menuitem">Settings</button>
                  <LogoutButton className="menuitem" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
