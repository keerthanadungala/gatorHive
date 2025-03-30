import { Link } from "react-router-dom";
import "./Navbar.css";
const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>🐊 GatorHive</h1>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/create">CreateEvent</Link>
        <Link to="/events">ViewEvents</Link>
        <Link to="/calendar">Calendar</Link>

      </div>
    </nav>
  );
};

export default Navbar;
