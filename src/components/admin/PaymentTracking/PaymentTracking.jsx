import React, { useEffect, useState } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import "../../../styles/Admin/PaymentTracking/PaymentTracking.css";

export default function TrackPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);

  // State to hold the transaction pending confirmation
  // Structure: { payment: Object, newStatus: String } | null
  const [pendingUpdate, setPendingUpdate] = useState(null);

  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [filters, setFilters] = useState({
    semester: "All",
    studentId: "",
    status: "All",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (val) => new Intl.NumberFormat("vi-VN").format(val);
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-GB").format(new Date(dateString));
  };

  async function fetchPayments() {
    try {
      const res = await fetch(
        "http://localhost:3001/api/admin/paymentTracking"
      );
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setPayments(data);
      setFilteredPayments(data);

      const uniqueSemesters = [
        ...new Set(data.map((item) => item.semester).filter(Boolean)),
      ];
      setAvailableSemesters(uniqueSemesters);
    } catch (e) {
      console.log(e.message);
      setError("Lost connection to the database");
    } finally {
      setLoading(false);
    }
  }

  // Filter Logic
  useEffect(() => {
    let result = [...payments];

    if (filters.studentId) {
      result = result.filter(
        (p) => p.studentid.toLowerCase().includes(filters.studentId.toLowerCase())
      );
    }

    if (filters.status !== "All") {
      result = result.filter((p) => p.status === filters.status);
    }

    if (filters.semester !== "All") {
      result = result.filter((p) => p.semester === filters.semester);
    }

    setFilteredPayments(result);
  }, [filters, payments]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // --- NEW: Handle Status Dropdown Change ---
  const initiateStatusChange = (payment, newStatus) => {
    // Don't update list yet, just open confirmation dialog
    setPendingUpdate({
      payment: payment,
      newStatus: newStatus,
    });
  };

  // --- NEW: Cancel Update ---
  const cancelUpdate = () => {
    setPendingUpdate(null); // Just close modal, React re-renders table with old values
  };

  // --- NEW: Proceed Update (API Call) ---
  const proceedUpdate = async () => {
    if (!pendingUpdate) return;

    const { payment, newStatus } = pendingUpdate;

    try {
      const res = await fetch(
        "http://localhost:3001/api/admin/paymentTracking/updateStatus",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentid: payment.paymentid,
            status: newStatus,
          }),
        }
      );

      if (res.ok) {
        // Update Local State on success
        const updatedList = payments.map((p) =>
          p.paymentid === payment.paymentid ? { ...p, status: newStatus } : p
        );
        setPayments(updatedList);
        setPendingUpdate(null); // Close modal
      } else {
        alert("Failed to update status on server.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error occurred.");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="tracking-container">
      <Menu menus={menu_admin} />

      <div className="tracking-content">
        <div className="tracking-header">Payment Tracking</div>

        {/* --- FILTER SECTION --- */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>Student ID</label>
            <input
              type="text"
              placeholder="Search ID (e.g., STU1)"
              value={filters.studentId}
              onChange={(e) => handleFilterChange("studentId", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Semester</label>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange("semester", e.target.value)}
            >
              <option value="All">All Semesters</option>
              {availableSemesters.map((sem, index) => (
                <option key={index} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <button
            className="reset-btn"
            onClick={() =>
              setFilters({ semester: "All", studentId: "", status: "All" })
            }
          >
            Reset Filters
          </button>
        </div>

        {/* --- TABLE SECTION --- */}
        {loading ? (
          <div>Loading transactions...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <table className="tracking-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Student ID</th>
                <th>Order Code</th>
                <th>Semester</th>
                <th>Date</th>
                <th>Amount (VND)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p, index) => (
                  <tr key={index}>
                    <td>{p.paymentid}</td>
                    <td>{p.studentid}</td>
                    <td>{p.order_code || "N/A"}</td>
                    <td>{p.semester}</td>
                    <td>{formatDate(p.date)}</td>
                    <td style={{ fontWeight: "bold" }}>
                      {formatCurrency(p.total_amount)}
                    </td>
                    <td>
                      {/* EDITABLE DROPDOWN */}
                      <select
                        className={`status-select ${
                          p.status === "Paid" ? "st-paid" : "st-unpaid"
                        }`}
                        value={p.status}
                        onChange={(e) =>
                          initiateStatusChange(p, e.target.value)
                        }
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* --- CONFIRMATION DIALOG --- */}
        {pendingUpdate && (
          <div className="popup-container">
            <div
              className="popup-content"
              style={{ width: "500px", textAlign: "left" }}
            >
              <h3
                style={{
                  borderBottom: "1px solid var(--color-white-300)",
                  paddingBottom: "10px",
                  marginTop: 0,
                }}
              >
                Confirm Status Change
              </h3>

              <div
                style={{
                  margin: "20px 0",
                  fontSize: "14px",
                  lineHeight: "1.8",
                }}
              >
                <p>
                  Are you sure you want to update the status for this payment?
                </p>
                <div
                  style={{
                    background: "var(--color-white-100)",
                    padding: "15px",
                    borderRadius: "8px",
                    marginTop: "10px",
                  }}
                >
                  <div>
                    <strong>Payment ID:</strong>{" "}
                    {pendingUpdate.payment.paymentid}
                  </div>
                  <div>
                    <strong>Student ID:</strong>{" "}
                    {pendingUpdate.payment.studentid}
                  </div>
                  <div>
                    <strong>Amount:</strong>{" "}
                    {formatCurrency(pendingUpdate.payment.total_amount)} VND
                  </div>
                  <div>
                    <strong>Change Status:</strong>
                    <span style={{ color: "gray" }}>
                      {" "}
                      {pendingUpdate.payment.status}{" "}
                    </span>
                    ➜
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "var(--color-blue-900)",
                      }}
                    >
                      {" "}
                      {pendingUpdate.newStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="popup-buttons"
                style={{
                  justifyContent: "flex-end",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  onClick={cancelUpdate}
                  style={{
                    backgroundColor: "var(--color-gray-ccc)",
                    color: "var(--color-black)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={proceedUpdate}
                  style={{ backgroundColor: "var(--color-blue-900)" }}
                >
                  Proceed change
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
