import { NavLink } from "react-router-dom"

const Header = () => {
  return (
    <header>
        <ul>
            <li><NavLink to="/">Startsidan</NavLink></li>
            <li><NavLink to="/login">Logga in</NavLink></li>
        </ul>
    </header>
  )
}

export default Header
