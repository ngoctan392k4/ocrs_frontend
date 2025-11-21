import React from "react";
import "../../../styles/admin/AccountManagement/DeleteAccount.css";

export default function DeleteAccount({ accountId, onNo, onYes, content }) {
  return (
    <div className="dialog-container">
      <div className="dialog-content">
        <p>{content}</p>
        <div>
          <button onClick={onYes}>Yes</button>
          <button onClick={onNo}>No</button>
        </div>
      </div>
    </div>
  );
}
