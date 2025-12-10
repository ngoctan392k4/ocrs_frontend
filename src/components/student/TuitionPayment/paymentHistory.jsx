import React, { useState, useEffect } from "react";
import "../../../styles/student/TuitionPayment/paymentHistory.css";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";

export default function PaymentHistory() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // Helper to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-GB").format(new Date(dateString));
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          "http://localhost:3001/api/student/payment-history",
          {
            credentials: "include",
          }
        );

        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="history-container">
      <Menu menus={menu_student} />

      <div className="history-content">
        <div className="history-header">Payment History</div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Order Code</th>
                <th>Semester</th>
                <th>Payment Date</th>
                <th>Amount (VND)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((item, index) => (
                  <tr key={index}>
                    <td>#{item.order_code || "N/A"}</td>
                    <td>{item.semester}</td>
                    <td>{formatDate(item.payment_date)}</td>
                    <td
                      style={{
                        fontWeight: "bold",
                        color: "var(--color-blue-900)",
                      }}
                    >
                      {formatCurrency(item.total_amount)}
                    </td>
                    <td>
                      <div className="status-cell">
                        <span
                          className={
                            item.status === "Paid"
                              ? "status-paid"
                              : "status-unpaid"
                          }
                        >
                          {item.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No payment history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
