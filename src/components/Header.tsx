import "./Header.css";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const auth = useContext(AuthContext);

  return (
    <header>
      <ul className="navbar">
        <li>
          <NavLink to="/">Home</NavLink>
        </li>

        {!auth?.isLoggedIn ? (
          <>
            <li>
              <NavLink to="/register">Register</NavLink>
            </li>
            <li>
              <NavLink to="/login">Log in</NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/my-pages">My pages</NavLink>
            </li>
            <li>
              <span onClick={auth.logout} className="logout-link">
                Log out
              </span>
            </li>
          </>
        )}
      </ul>
    </header>
  );
};

export default Header;
