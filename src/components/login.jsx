import { useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import { Link } from "react-router-dom";
import GenericModal from "./genericStatusModal";

const Login = () => {
  const [activeTab, setActiveTab] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // Step 1: Submit email + password to backend to verify credentials and generate OTP
  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setModalMessage("Please enter both email and password.");
      setModalOpen(true);
      return;
    }

    try {
      const endpoint =
        activeTab === "user"
          ? `${process.env.REACT_APP_URL}/signin`
          : `${process.env.REACT_APP_URL}/admin_login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        setModalMessage(err.error || "Invalid email or password.");
        setModalOpen(true);
        return;
      }

      if (activeTab === "admin") {
        const data = await response.json();
        const { token, user } = data;
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
        window.location.replace("/admin-portal");
        return;
      }

      // ✅ For user: trigger OTP
      const otpResp = await fetch(`${process.env.REACT_APP_URL}/generate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!otpResp.ok) {
        const err = await otpResp.json();
        setModalMessage(err.error || "Failed to send OTP.");
        setModalOpen(true);
        return;
      }

      setOtpSent(true);
      setModalMessage("OTP sent to your email. Please enter it below.");
      setModalOpen(true);

    } catch (err) {
      console.error("Login error:", err.message);
      setModalMessage("Something went wrong. Please try again later.");
      setModalOpen(true);
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async (enteredOtp) => {
    try {
      const resp = await fetch(`${process.env.REACT_APP_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        setModalMessage(err.error || "OTP verification failed.");
        setModalOpen(true);
        return;
      }

      const data = await resp.json();
      const { token, user } = data; // Make sure your /verify-otp returns token

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      setModalMessage("Login successful!");
      setModalOpen(true);

      setTimeout(() => window.location.replace("/home"), 1000);

    } catch (err) {
      console.error("OTP verification error:", err.message);
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

          <h4 className="text-center mb-4 fw-bold">
            {activeTab === "user" ? "User Sign In" : "Admin Login"}
          </h4>

          {!otpSent ? (
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
          ) : (
            <div>
              <div className="mb-3">
                <label className="form-label fw-bold">Enter OTP</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOtp(val);
                    if (val.length === 6) verifyOtp(val); // auto verify after last digit
                  }}
                  maxLength={6}
                />
              </div>
            </div>
          )}

          {activeTab === "user" && !otpSent && (
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

      <GenericModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default Login;
