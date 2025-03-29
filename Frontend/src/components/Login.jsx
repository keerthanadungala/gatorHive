import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Optional: create your own styles

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const { email, password } = formData;

    // Simple validation
    if (!email || !password) {
      setMessage("⚠️ Please enter both email and password.");
      return;
    }

    // Dummy login logic
    if (email === "user@gatorhive.com" && password === "password123") {
      setMessage("✅ Login successful!");
      setTimeout(() => {
        navigate("/events"); // Redirect to events or dashboard
      }, 1000);
    } else {
      setMessage("❌ Invalid credentials. Try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>🔐 GatorHive Login</h2>
      {message && <p className="message">{message}</p>}
      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input 
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@ufl.edu"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input 
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </div>

        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
};

export default Login;



