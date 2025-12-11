import React from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import { useNavigate } from "react-router-dom";
import "../../../styles/Common/TableView.css";
import { useEffect, useState } from "react";
import DeleteAccount from "./DeleteAccount";
import deleteIcon from '../../../assets/icon/delete.svg';
import editIcon from '../../../assets/icon/edit.svg';
import mailBoxIcon from '../../../assets/icon/mailbox.svg';

export default function ViewAccount() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [searched, setSearched] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [searchMode, setSearchMode] = useState("accountid");

  // State for deleting account
  const [showDialog, setShowDialog] = useState(false);
  // const [errorDialog, setErrorDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState("");
  const [deleteAccountId, setDeleteAccountId] = useState(null);

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

  // Process deleting account via accountID
  const handleDeleteClick = (accountid) => {
    setDeleteAccountId(accountid);
    setContentDialog(
      `Ensure your deleting on ${accountid} will delete all related users`
    );
    setShowDialog(true);
  };

  // Perform when click Yes for deleting
  const handleYesDelete = async () => {
    if (!deleteAccountId) return;
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/accountManagement/${deleteAccountId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setContentDialog("An error occurred. Please try again later.");
        // setErrorDialog(true);
      } else {
        setAccounts((prev) =>
          prev.filter((c) => c.accountid !== deleteAccountId)
        );
        setSelectedAccounts((prev) =>
          prev.filter((id) => id !== deleteAccountId)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowDialog(false);
      setDeleteAccountId(null);
      // setErrorDialog(false);
    }
  };

  // Perform when click Yes for deleting
  const handleNoDelete = () => {
    setShowDialog(false);
    setDeleteAccountId(null);
  };

  return (
    <div className="table-view-container">
      <Menu menus={menu_admin} />

      <div className="table-view-content">
        <div className="table-view-header">
          <h1 className="table-view-title">Account Management</h1>
          <p className="table-view-subtitle">Manage and view all system accounts</p>
        </div>

        <div className="table-search-filter">
          <input
            className="table-search-bar"
            type="text"
            placeholder={`Search by ${searchMode}`}
            value={searched}
            onChange={(e) => setSearched(e.target.value)}
          />
          <select
            className="table-search-select"
            value={searchMode}
            onChange={(e) => setSearchMode(e.target.value)}
          >
            <option value="accountid">Account ID</option>
            <option value="username">Username</option>
          </select>
        </div>

        {loading ? (
          <div className="table-wrapper">
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading accounts...</p>
            </div>
          </div>
        ) : error ? (
          <div className="table-error">
            <strong>Error:</strong> {error}
          </div>
        ) : searchAccount.length === 0 ? (
          <div className="table-wrapper">
            <div className="table-empty-state">
              <div className="table-empty-icon"><img src={mailBoxIcon} alt="mailBoxIcon"/></div>
              <div className="table-empty-text">No accounts found</div>
              <div className="table-empty-subtext">Try adjusting your search criteria</div>
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchAccount.map((account) => (
                  <tr key={account.accountid}>
                    <td className="table-cell-primary">{account.accountid}</td>
                    <td>{account.full_name}</td>
                    <td className="table-cell-secondary">{account.username}</td>
                    <td className="table-cell-secondary">{account.email || "—"}</td>
                    <td>
                      <span style={{
                        textTransform: 'capitalize',
                        fontWeight: '500',
                        color: 'var(--color-blue-600)'
                      }}>
                        {account.role}
                      </span>
                    </td>
                    <td>
                      <span className={`table-cell-status ${account.status?.toLowerCase()}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="table-cell-secondary">{account.phone_number || "—"}</td>
                    <td>
                      <div className="table-cell-actions">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => handleEdit(account.accountid)}
                          title="Edit account"
                        >
                          <img src={editIcon} alt="deleteIcon"/>
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => handleDeleteClick(account.accountid)}
                          title="Delete account"
                        >
                          <img src={deleteIcon} alt="deleteIcon"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          className="fab-button"
          onClick={() => navigate("/accountManagement/addAccount")}
          title="Add new account"
        >
          +
        </button>
      </div>

      {showDialog && (
        <DeleteAccount
          accountId={deleteAccountId}
          onYes={handleYesDelete}
          onNo={handleNoDelete}
          content={contentDialog}
        />
      )}
    </div>
  );
}
