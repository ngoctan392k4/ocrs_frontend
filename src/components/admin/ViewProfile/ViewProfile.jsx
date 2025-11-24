import React, { useEffect, useState } from "react";
import Menu from "../../menu/Menu";
import menu_admin from "../../../assets/dataMenu/MenuAdminData";
import '../../../styles/Admin/AccountManagement/ViewAccount.css'

export default function ViewProfile() {
  const [profile, setProfile] = useState(null);

  async function fetchProfile() {
    try {
      const res = await fetch("http://localhost:3001/api/profile/me", {
        credentials: "include",
      });

      if (res.status === 401) {
        setError("Not authenticated");
        return;
      }

      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.log(error);
    } 
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!profile) return null;

  return (
    <div className="view-account-container">
      <Menu menus={menu_admin} />

      <div className="view-account-content">
        <h1 className="view-account-title">Your Profile</h1>

        <div className="account-list">
          <div className="account-item selected">
            <div className="account-header">
              <div className="account-sequential">{profile.full_name} - Role: {profile.role}</div>
            </div>

            <div className="account-detail">
              <div className="detail-row">
                <span className="account-info-label">Account ID: </span>
                <span className="account-info-text">{profile.accountid}</span>
              </div>
              <div className="detail-row">
                <span className="account-info-label">Name: </span>
                <span className="account-info-text">{profile.full_name}</span>
              </div>
              <div className="detail-row">
                <span className="account-info-label">Email: </span>
                <span className="account-info-text">{profile.email}</span>
              </div>
              <div className="detail-row">
                <span className="account-info-label">Status: </span>
                <span className="account-info-text">{profile.status}</span>
              </div>
              <div className="detail-row">
                <span className="account-info-label">Role: </span>
                <span className="account-info-text">{profile.role}</span>
              </div>
              <div className="detail-row">
                <span className="account-info-label">Username: </span>
                <span className="account-info-text">{profile.username}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
