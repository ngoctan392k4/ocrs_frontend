import MenuList from "./MenuList";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import '../../styles/Menu.css';

export default function MenuItem({ item }) {

  const [displayCurrentChildren, setDisplayCurrentChildren] = useState({});

  function handleToggleChildren(currentLabel) {
    setDisplayCurrentChildren({
      ...displayCurrentChildren,
      [currentLabel]: !displayCurrentChildren[currentLabel],
    });
  }

  const hasChildren = item && item.children && item.children.length > 0;

  return (
    <li>
      <div
        className={`menu-item ${hasChildren ? 'has-children' : ''}`}
        onClick={hasChildren ? () => handleToggleChildren(item.label) : <Navigate to={item.to} replace/>}
      >
        <p>{item.label}</p>
      </div>

      {hasChildren ? (
        <div
          className="child-list-container"
          style={{
            maxHeight: displayCurrentChildren[item.label] ? '500px' : '0px'
          }}
        >
          <MenuList list={item.children} />
        </div>
      ) : null}
    </li>
  );
}