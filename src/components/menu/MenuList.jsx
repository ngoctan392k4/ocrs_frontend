import MenuItem from "./MenuItem";
import '../../styles/Menu.css';

export default function MenuList({list = []}) {
    return <ul className="menu-list-container">
        {
            list && list.length ?
            list.map((listItem) => <MenuItem item={listItem}/>)
            : null
        }
    </ul>
}