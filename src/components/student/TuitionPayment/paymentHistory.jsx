import React, { useState, useEffect } from "react";
import "../../../styles/student/TuitionPayment/paymentHistory.css";
import Menu from "../../menu/Menu";
import menu_student from "../../../assets/dataMenu/MenuStudentData";
import Chatbot from "../Chatbot/Chatbot";
import mailBoxIcon from '../../../assets/icon/mailbox.svg';

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
        <Chatbot/>
        <h1 className="history-title">Payment History</h1>

        <div className="table-wrapper">
          {loading ? (
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading payments...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon" /></div>
              <div className="table-empty-text">No payment history found</div>
              <div className="table-empty-subtext">You have no payment records yet</div>
            </div>
          ) : (
            <table className="data-table">
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
                {history.map((item, index) => (
                  <tr key={index}>
                    <td className="table-cell-primary">#{item.order_code || "N/A"}</td>
                    <td>{item.semester}</td>
                    <td className="table-cell-secondary">{formatDate(item.payment_date)}</td>
                    <td className="table-cell-secondary" style={{ fontWeight: "600" }}>
                      {formatCurrency(item.total_amount)}
                    </td>
                    <td>
                      <span className={`table-cell-status ${item.status?.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
