import { Link } from "react-router-dom";
import "./Navbar.css"; // Modern CSS for Navbar

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>🐊 GatorHive</h1>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/create">Create Event</Link>
      </div>
    </nav>
  );
};

export default Navbar;
