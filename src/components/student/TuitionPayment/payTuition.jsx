import React, { useState, useEffect } from "react";
import "../../../styles/student/TuitionPayment/TuitionPayment.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import Chatbot from "../Chatbot/Chatbot";
import mailBoxIcon from '../../../assets/icon/mailbox.svg';

export default function TuitionPayment() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  // State for the Blocking Popup
  const [restrictionPopup, setRestrictionPopup] = useState({
    show: false,
    type: "", // 'early' or 'late'
    limitDate: null,
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    return new Intl.DateTimeFormat("en-GB").format(dateObj); // dd/mm/yyyy
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

  const checkPaymentWindow = (dateString) => {
    if (!dateString) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(dateString);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    if (today < startDate) {
      setRestrictionPopup({
        show: true,
        type: "early",
        limitDate: startDate,
      });
      return false;
    } else if (today > endDate) {
      setRestrictionPopup({
        show: true,
        type: "late",
        limitDate: endDate,
      });
      return false;
    }

    return true;
  };

  const fetchTuitionData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/student/tuition`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await res.json();

      if (data && data.length > 0) {
        const semesterStart = data[0].sem_start_date;
        checkPaymentWindow(semesterStart);
      }

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

  useEffect(() => {
    const handlePageLoad = async () => {
      await fetchTuitionData();

      const status = searchParams.get("status");
      const code = searchParams.get("code");
      const cancel = searchParams.get("cancel");

      if (status === "PAID" || code === "00") {
        setSuccessMessage("Payment successful!");
        setSuccessDialog(true);

        setTimeout(() => {
          fetchTuitionData();
        }, 2000);

        setSearchParams({});
      } else if (cancel === "true") {
        setPopupNotiError("Payment was cancelled");
        setShowPopupError(true);
        setSearchParams({});
      }
    };

    handlePageLoad();
  }, []);

  const totalCost = courses
    .filter((c) => c.payment_status === "Unpaid")
    .reduce((acc, course) => acc + course.total_amount, 0);

  const handlePayment = async () => {
    if (courses.length > 0) {
      const isOpen = checkPaymentWindow(courses[0].sem_start_date);
      if (!isOpen) return;
    }

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
          credentials: "include",
          body: JSON.stringify({
            amount: totalCost,
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

  const handleRestrictionRedirect = () => {
    navigate("/homepageStudent");
  };

  const openConfirmPay = () => setPopupConfirmPay(true);
  const closeConfirmPay = () => setPopupConfirmPay(false);

  return (
    <div className="tuition-payment-container">
      <Menu menus={menu_student} />
      <div className="tuition-payment-content">
        <Chatbot/>
        <h1 className="tuition-title">Pay Tuition Fee</h1>

        <div className="table-wrapper">
          {loading ? (
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">No courses found</div>
              <div className="table-empty-subtext">You have no registered courses</div>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course ID</th>
                    <th>Course Name</th>
                    <th>Credit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr key={index}>
                      <td className="table-cell-primary">{course.courseid}</td>
                      <td>{course.coursename}</td>
                      <td className="table-cell-secondary">{course.credit}</td>
                      <td>
                        <span className={`table-cell-status ${course.payment_status?.toLowerCase()}`}>
                          {course.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="payment-footer">
                <div className="total-cost">
                  Total cost: <strong>{formatCurrency(totalCost)} VND</strong>
                </div>
                <button
                  className="pay-btn"
                  onClick={openConfirmPay}
                  disabled={totalCost === 0 || loading || restrictionPopup.show}
                  style={{
                    opacity: totalCost === 0 || restrictionPopup.show ? 0.5 : 1,
                    cursor:
                      totalCost === 0 || restrictionPopup.show
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Pay Now
                </button>
              </div>
            </>
          )}
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
              {/* Used var(--color-green) */}
              <h3 style={{ color: "var(--color-green)" }}>Success</h3>
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
                  style={{
                    marginRight: "10px",
                    backgroundColor: "var(--color-gray-ccc)",
                  }}
                >
                  Cancel
                </button>
                <button onClick={handlePayment}>Yes, Pay Now</button>
              </div>
            </div>
          </div>
        )}

        {restrictionPopup.show && (
          <div className="popup-container" style={{ zIndex: 99999 }}>
            <div className="popup-content">
              <h3 style={{ color: "var(--color-red-alert)" }}>
                Access Restricted
              </h3>

              {restrictionPopup.type === "early" ? (
                <p>
                  Payment is not yet open.
                  <br />
                  Please return on{" "}
                  <strong>{formatDate(restrictionPopup.limitDate)}</strong>.
                </p>
              ) : (
                <p>
                  Payment period has expired.
                  <br />
                  Deadline was{" "}
                  <strong>{formatDate(restrictionPopup.limitDate)}</strong>.
                </p>
              )}

              <button
                onClick={handleRestrictionRedirect}
                style={{ backgroundColor: "var(--color-blue-900)" }}
              >
                Okay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
