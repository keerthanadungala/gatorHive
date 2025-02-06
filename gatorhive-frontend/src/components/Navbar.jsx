import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>GatorHive</h1>
      <div>
        <Link to="/">Home</Link>
      </div>
    </nav>
  );
};

export default Navbar;
