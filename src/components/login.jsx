import { useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import { Link } from "react-router-dom";

const Login = () => {
  const [activeTab, setActiveTab] = useState("user"); // "user" | "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const payload = { email, password };

    try {
      // Choose API endpoint based on active tab
      const endpoint =
        activeTab === "user"
          ? `${process.env.REACT_APP_URL}/signin`
          : `${process.env.REACT_APP_URL}/admin_login`; // Admin API endpoint

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user } = data;

        // Store JWT token and optional user info
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));

        alert(
          activeTab === "admin"
            ? "Admin login successful!"
            : "Login successful!"
        );
        window.location.replace("/home");
      } else {
        const err = await response.json();
        alert(err.error || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error:", err.message);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div
          className="card shadow-lg p-4"
          style={{ width: "100%", maxWidth: "420px", borderRadius: "1rem" }}
        >
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item w-50 text-center">
              <button
                className={`nav-link w-100 ${activeTab === "user" ? "active" : ""}`}
                onClick={() => setActiveTab("user")}
              >
                User Sign In
              </button>
            </li>
            <li className="nav-item w-50 text-center">
              <button
                className={`nav-link w-100 ${activeTab === "admin" ? "active" : ""}`}
                onClick={() => setActiveTab("admin")}
              >
                Admin Login
              </button>
            </li>
          </ul>

          {/* Form */}
          <h4 className="text-center mb-4 fw-bold">
            {activeTab === "user" ? "User Sign In" : "Admin Login"}
          </h4>
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Email address</label>
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 btn-lg bg-gray-950"
            >
              {activeTab === "user" ? "Login" : "Admin Login"}
            </button>
          </form>

          {activeTab === "user" && (
            <p className="text-center mt-3 mb-0">
              Don’t have an account?{" "}
              <Link to="/register" className="text-decoration-none">
                Register
              </Link>
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
