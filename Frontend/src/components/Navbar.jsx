import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../hooks/useAuth";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h1>🐊 GatorHive</h1>
      <div className="nav-links">
        <Link to="/">Home</Link>

        {isAuthenticated() ? (
          <>
            <Link to="/create">CreateEvent</Link>
            <Link to="/events">ViewEvents</Link>
            <Link to="/calendar">Calendar</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


