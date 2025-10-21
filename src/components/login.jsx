import { useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import { Link } from "react-router-dom";
import GenericModal from "./genericStatusModal";

const Login = () => {
  const [activeTab, setActiveTab] = useState("user"); // "user" | "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setModalMessage("Please enter both email and password.");
      setModalOpen(true);
      return;
    }

    const payload = { email, password };

    try {
      const endpoint =
        activeTab === "user"
          ? `${process.env.REACT_APP_URL}/signin`
          : `${process.env.REACT_APP_URL}/admin_login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user } = data;

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));

        setModalMessage(
          activeTab === "admin"
            ? "Admin login successful!"
            : "Login successful!"
        );
        setModalOpen(true);

        // redirect after 1.5s delay or after modal close
        setTimeout(() => {
          if (activeTab === "admin") {
            window.location.replace("/admin-portal");
          } else {
            window.location.replace("/home");
          }
        }, 1500);
      } else {
        const err = await response.json();
        setModalMessage(err.error || "Invalid email or password.");
        setModalOpen(true);
      }
    } catch (err) {
      console.error("Login error:", err.message);
      setModalMessage("Something went wrong. Please try again later.");
      setModalOpen(true);
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

      {/* ✅ Generic Modal */}
      <GenericModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default Login;
