import React from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import { useNavigate } from "react-router-dom";
import "../../../styles/Admin/AccountManagement/ViewAccount.css";
import { useEffect, useState } from "react";

export default function ViewAccount() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [searched, setSearched] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [searchMode, setSearchMode] = useState("accountid");

  async function fetchAccounts() {
    try {
      const res = await fetch(
        "http://localhost:3001/api/admin/AccountManagement"
      );
      const data = await res.json();
      console.log("Fetched data:", data);
      setAccounts(data);
    } catch (e) {
      console.log(e.message);
      setError("Lost connection to the database");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  const searchAccount = accounts.filter((account) => {
    const searchTerm = searched.toLowerCase();
    if (searchMode === "accountid") {
      return account.accountid.toLowerCase().includes(searchTerm);
    } else if (searchMode === "username") {
      return account.username.toLowerCase().includes(searchTerm);
    } else return false;
  });

  const toggleAccount = (id) => {
    setSelectedAccounts((otherAccounts) =>
      otherAccounts.includes(id)
        ? otherAccounts.filter((accountID) => accountID !== id)
        : [...otherAccounts, id]
    );
  };

  const handleEdit = (accountid) => {
    navigate(`/accountManagement/edit/${accountid}`);
  };

  const handleDelete = (accountid) => {
    navigate(`/accountManagement/delete/${accountid}`);
  };

  return (
    <div className="view-account-container">
      <Menu menus={menu_admin} />

      <div className="view-account-content">
        <h1 className="view-account-title">View Account</h1>

        <div className="search-container">
          <input
            className="account-search-bar"
            type="text"
            placeholder={`Search by ${searchMode}`}
            value={searched}
            onChange={(e) => setSearched(e.target.value)}
          />
          <select
            className="account-search-mode-select"
            value={searchMode}
            onChange={(e) => setSearchMode(e.target.value)}
          >
            <option value="accountid">Account ID</option>
            <option value="username">Username</option>
          </select>
        </div>

        <div className="account-list">
          {loading ? (
            <div>loading...</div>
          ) : error ? (
            <div>{error}</div>
          ) : (
            searchAccount.map((account, index) => (
              <div
                key={account.accountid}
                className="account-item"
                onClick={() => toggleAccount(account.accountid)}
              >
                <div className="account-header">
                  <div className="account-sequential">
                    {account.full_name} - Role: {account.role}
                  </div>
                </div>
                {selectedAccounts.includes(account.accountid) && (
                  <div className="account-detail">
                    <div className="detail-row">
                      <span className="account-info-label">Account ID: </span>
                      <span className="account-info-text">
                        {account.accountid}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="account-info-label">Name: </span>
                      <span className="account-info-text">
                        {account.full_name}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="account-info-label">Email: </span>
                      <span className="account-info-text">
                        {account.email || "null"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="account-info-label">Status: </span>
                      <span className="account-info-text">
                        {account.status}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="account-info-label">Role: </span>
                      <span className="account-info-text">{account.role}</span>
                    </div>
                    {/* Personalize additional row for Instructor and Students */}
                    {account.role === "instructor" && (
                      <div className="detail-row">
                        <span className="account-info-label">Department</span>
                        <span className="account-info-text">
                          {account.role}
                        </span>
                      </div>
                    )}
                    {account.role === "student" && (
                      <div className="detail-row">
                        <span className="account-info-label">Major</span>
                        <span className="account-info-text">
                          {account.role}
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="account-info-label">Username: </span>
                      <span className="account-info-text">
                        {account.username}
                      </span>
                    </div>
                    <div className="account-action">
                      <button
                        className="edit-btn account-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(account.accountid);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn account-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(account.accountid);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <button
          className="add-account-btn"
          onClick={() => navigate("/accountManagement/addAccount")}
        >
          +
        </button>
      </div>
    </div>
  );
}
