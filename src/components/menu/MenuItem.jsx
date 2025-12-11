import MenuList from "./MenuList";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Menu.css";
import LogoutButton from "../auth/Logout";

export default function MenuItem({ item }) {
  const [displayCurrentChildren, setDisplayCurrentChildren] = useState({});
  const navigate = useNavigate();

  function handleToggleChildren(currentLabel) {
    setDisplayCurrentChildren({
      ...displayCurrentChildren,
      [currentLabel]: !displayCurrentChildren[currentLabel],
    });
  }

  function handleClick() {
    hasChildren ? handleToggleChildren(item.label) : navigate(item.to);
  }

  const hasChildren = item && item.children && item.children.length > 0;
  const isLogoutItem = item.isLogout;
  const isOpen = displayCurrentChildren[item.label];

  return (
    <li>
      {isLogoutItem ? (
        <div className="menu-item logout-item">
          <LogoutButton />
        </div>
      ) : (
        <>
          <div
            className={`menu-item ${hasChildren ? "has-children" : ""}`}
            onClick={handleClick}
            title={item.label}
          >
            <p>{item.label}</p>
          </div>

          {hasChildren ? (
            <div
              className="child-list-container"
              style={{
                maxHeight: isOpen ? "500px" : "0px",
              }}
            >
              <MenuList list={item.children} />
            </div>
          ) : null}
        </>
      )}
    </li>
  );
}
