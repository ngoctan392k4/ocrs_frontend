import React from 'react'
import MenuList from './MenuList'
import '../../styles/Menu.css';

const MenuStudent = ({menus = []}) => {
  return (
    <div className='tree-view-container'>

        <MenuList list={menus}/>
    </div>
  )
}

export default MenuStudent
