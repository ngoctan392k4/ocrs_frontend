import React from "react";
import "../../../styles/admin/AccountManagement/DeleteAccount.css";

export default function DeleteAccount({ accountId, onNo, onYes, content }) {
  return (
    <div className="dialog-backdrop">
      <div className="dialog-box dialog-error">
        <p className="dialog-message">{content}</p>
        <div className="dialog-actions">
          <button className="btn-cancel" onClick={onNo}>No</button>
          <button className="btn-delete" onClick={onYes}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}
