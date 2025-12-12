import React, { useContext, useState, useRef, useEffect } from "react";
import MenuList from "./MenuList";
import UserInfoCard from "./UserInfoCard";
import "../../styles/Menu.css";

const MenuStudent = ({ menus = [] }) => {
  return (
    <div className="tree-view-container">
      <UserInfoCard />
      <MenuList list={menus} />
    </div>
  );
};

export default MenuStudent;
