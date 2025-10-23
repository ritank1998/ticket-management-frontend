import { useEffect, useState } from "react";
import { LogOut, UserStar } from "lucide-react";
import { useLocation } from "react-router-dom"; // ✅ Correct import
import "../App.css";

const Navbarlogin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userRole, setUserRole] = useState("");
  const location = useLocation(); // ✅ now works correctly

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.replace("/login");
  };

  const handleRedirectAdminPortal = () => {
    window.location.replace("/admin-portal");
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser.role_id);
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  console.log("Current path:", location.pathname); // ✅ Now logs correctly

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark px-3 py-2 shadow-sm"
      style={{ background: "#1E40AF" }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center flex-nowrap">
        {/* 🧾 Brand Name */}
        <a className="navbar-brand fw-bold text-white" href="#">
          T-Metrix
        </a>

        {/* 🧭 Buttons */}
        {isLoggedIn && (
          <div
            className="d-flex flex-row gap-2 align-items-center"
            style={{ minWidth: "fit-content" }}
          >
            {userRole === 1 && (
              <button
                className="btn btn-light fw-semibold px-3 py-1"
                onClick={handleRedirectAdminPortal}
              >
                <UserStar size={18} />
              </button>
            )}

            <button
              className="btn btn-danger fw-semibold d-flex align-items-center justify-content-center px-3 py-1"
              onClick={handleLogout}
            >
              <LogOut size={18} />
            </button>

            
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbarlogin;
