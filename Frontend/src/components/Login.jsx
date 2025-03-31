import "./Login.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

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

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setMessage("⚠️ Please enter both email and password.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/login", {
        email,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token || "dummy-token");
        localStorage.setItem("user_email", email);
        setMessage("✅ Login successful!");
        setTimeout(() => navigate("/events"), 1000);
      }
      
    } catch (error) {
      console.error("Login error:", error);
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

      <p style={{ marginTop: "15px" }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
