import './Header.css'
import { NavLink } from "react-router-dom"

const Header = () => {
  return (
    <header>
        <ul className='navbar'>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/login">Log in</NavLink></li>
        </ul>
    </header>
  )
}

export default Header
