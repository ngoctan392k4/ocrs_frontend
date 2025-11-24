import React from 'react'
import MenuList from './MenuList'
import '../../styles/Menu.css';

const MenuStudent = ({menus = [], currentUser}) => {
  return (
    <div className='tree-view-container'>

        <MenuList list={menus} currentUser={currentUser}/>
    </div>
  )
}

export default MenuStudent
