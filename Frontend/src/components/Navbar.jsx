import { Link } from "react-router-dom";
import "./Navbar.css"; // Modern CSS for Navbar

import "./Navbar.css"; // Modern CSS for Navbar

import "./Navbar.css"; // Modern UF-Themed Navbar Styles


const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>🐊 GatorHive</h1>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/create">Create Event</Link>




        <Link to="/events">View Events</Link>


      </div>
    </nav>
  );
};

export default Navbar;
