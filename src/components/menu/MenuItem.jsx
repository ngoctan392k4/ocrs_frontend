import MenuList from "./MenuList";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Menu.css";
import LogoutButton from "../admin/ViewProfile/Logout";

export default function MenuItem({ item, currentUser }) {
  const [displayCurrentChildren, setDisplayCurrentChildren] = useState({});
  const navigate = useNavigate();

  function handleToggleChildren(currentLabel) {
    setDisplayCurrentChildren({
      ...displayCurrentChildren,
      [currentLabel]: !displayCurrentChildren[currentLabel],
    });
  }

  function handleClick() {
    if (hasChildren) {
      handleToggleChildren(item.label);
    } else {
      if (item.to === "/Profile") {
        if (currentUser) {
          console.log(currentUser.accountid);
          navigate(`/Profile/${currentUser.accountid}`);
        }
      } else {
        navigate(item.to);
      }
    }
  }

  const hasChildren = item && item.children && item.children.length > 0;

  return (
    <li>
      <div
        className={`menu-item ${hasChildren ? "has-children" : ""}`}
        onClick={handleClick}
      >
        {item.label === "Logout" ? (<LogoutButton />) : <p>{item.label}</p>}
      </div>

      {hasChildren ? (
        <div
          className="child-list-container"
          style={{
            maxHeight: displayCurrentChildren[item.label] ? "500px" : "0px",
          }}
        >
          <MenuList list={item.children} currentUser={currentUser} />
        </div>
      ) : null}
    </li>
  );
}
