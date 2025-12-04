import React, { useState, useEffect } from "react";
import "../../../styles/student/TuitionPayment/TuitionPayment.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";

export default function TuitionPayment() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [currentStudentID, setCurrentStudentID] = useState(null);

  // menu height state used to align footer bottom with menu bottom
  const [menuHeight, setMenuHeight] = useState(null);

  const isPaymentReturn =
    searchParams.get("status") || searchParams.get("cancel");

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const [summary, setSummary] = useState({
    registered: 0,
    failed: 0,
    currentStage: ``,
  });

  const [popupNotiError, setPopupNotiError] = useState("");
  const [showPopupError, setShowPopupError] = useState(false);

  const [successDialog, setSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [popupConfirmPay, setPopupConfirmPay] = useState(false);

  // Fetch tuition data
  const fetchTuitionData = async (student_id) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/student/tuition?student_id=${student_id}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await res.json();

      setCourses(data);
      setSummary({
        registered: data.length,
        failed: 0,
        currentStage: ``,
      });

      return data;
    } catch (e) {
      setPopupNotiError(`Error loading data: ${e.message}`);
      setShowPopupError(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the current user
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/student/me", {
        credentials: "include",
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const student_id = data.get_studentid_by_accountid;
      setCurrentStudentID(student_id);
      return student_id;
    } catch (e) {
      console.error("Auth Check Failed: ", e);
      return null;
    }
  };

  useEffect(() => {
    const handlePageLoad = async () => {
      const fetchedId = await fetchCurrentUser();

      if (fetchedId) {
        await fetchTuitionData(fetchedId);
      } else {
        setLoading(false);
      }

      const status = searchParams.get("status");
      const code = searchParams.get("code");
      const cancel = searchParams.get("cancel");

      //IF Payment is Successful
      if (status === "PAID" || code === "00") {
        setSuccessMessage("Payment successful!");
        setSuccessDialog(true);

        if (fetchedId) {
          setTimeout(() => {
            fetchTuitionData(fetchedId);
          }, 2000);
        }
        setSearchParams({});
      } else if (cancel === "true") {
        setPopupNotiError("Payment was cancelled");
        setShowPopupError(true);
        setSearchParams({});
      }
    };

    handlePageLoad();
  }, []);

  // measure menu height and set to state so we can align footer bottom
  useEffect(() => {
    const getMenuHeight = () => {
      // try common menu/ sidebar selectors; add your real selector if different
      const selectors = [
        ".menu-container",
        "#menu",
        ".menu",
        ".sidebar",
        ".student-menu",
      ];

      let el = null;
      for (const sel of selectors) {
        el = document.querySelector(sel);
        if (el) break;
      }

      if (!el) {
        // also try any element with role navigation
        el = document.querySelector('[role="navigation"]');
      }

      if (el) {
        const rect = el.getBoundingClientRect();
        // add small padding so footer doesn't overlap
        setMenuHeight(Math.ceil(rect.height));
      } else {
        setMenuHeight(null);
      }
    };

    // initial
    getMenuHeight();
    // update on resize
    window.addEventListener("resize", getMenuHeight);
    // If menu may change dynamically, you could observe DOM changes here (omitted for brevity)
    return () => window.removeEventListener("resize", getMenuHeight);
  }, []);

  const totalCost = courses
    .filter((c) => c.payment_status === "Unpaid")
    .reduce((acc, course) => acc + course.total_amount, 0);

  const handlePayment = async () => {
    if (totalCost === 0) {
      setPopupNotiError("No unpaid tuition fees remaining.");
      setShowPopupError(true);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:3001/api/student/payment/create-link",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalCost,
            student_id: currentStudentID,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Payment creation failed");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (e) {
      setPopupNotiError(`Payment Error: ${e.message}`);
      setShowPopupError(true);
      setPopupConfirmPay(false);
    }
  };

  const handleCloseError = () => {
    setShowPopupError(false);
    setSearchParams({});
  };

  const handleCloseSuccess = () => {
    setSuccessDialog(false);
    setSearchParams({});
  };

  const openConfirmPay = () => setPopupConfirmPay(true);
  const closeConfirmPay = () => setPopupConfirmPay(false);

  // apply inline minHeight so the content area matches menu height (if detected)
  const contentStyle = menuHeight ? { minHeight: `${menuHeight}px` } : {};

  return (
    <div className="tuition-payment-container">
      <Menu menus={menu_student} />
      <div className="tuition-payment-content" style={contentStyle}>
        <div className="payment-header">Pay Tuition Fee</div>

        <div className="payment-header">List of registered courses</div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="tuition-table">
            <thead>
              <tr>
                <th>Course ID</th>
                <th>Course Name</th>
                <th>Credit</th>
                <th>Payment date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? (
                courses.map((course, index) => (
                  <tr key={index}>
                    <td>{course.courseid}</td>
                    <td>{course.coursename}</td>
                    <td>{course.credit}</td>
                    <td>{course.date ? course.date.split("T")[0] : ""}</td>
                    <td>
                      {/* Wrap status in a centered container */}
                      <div className="status-cell">
                        <span
                          className={
                            course.payment_status === "Unpaid"
                              ? "status-unpaid"
                              : "status-paid"
                          }
                        >
                          {course.payment_status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="payment-footer">
          <div className="total-cost">
            Total cost: {formatCurrency(totalCost)} vnd
          </div>
          <button
            className="pay-btn"
            onClick={openConfirmPay}
            disabled={totalCost === 0 || loading}
            style={{
              opacity: totalCost === 0 ? 0.5 : 1,
              cursor: totalCost === 0 ? "not-allowed" : "pointer",
            }}
          >
            Pay
          </button>
        </div>

        {showPopupError && (
          <div className="popup-container">
            <div className="popup-content">
              <h3>Error</h3>
              <p>{popupNotiError}</p>
              <button onClick={handleCloseError}>Close</button>
            </div>
          </div>
        )}

        {successDialog && (
          <div className="popup-container">
            <div className="popup-content">
              <h3 style={{ color: "green" }}>Success</h3>
              <p>{successMessage}</p>
              <button onClick={handleCloseSuccess}>OK</button>
            </div>
          </div>
        )}

        {popupConfirmPay && (
          <div className="popup-container">
            <div className="popup-content">
              <h3>Confirm Payment</h3>
              <p>
                Pay <strong>{formatCurrency(totalCost)} VND</strong> via PayOS?
              </p>
              <div className="popup-buttons" style={{ marginTop: "15px" }}>
                <button
                  onClick={closeConfirmPay}
                  style={{ marginRight: "10px", backgroundColor: "#ccc" }}
                >
                  Cancel
                </button>
                <button onClick={handlePayment}>Yes, Pay Now</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
