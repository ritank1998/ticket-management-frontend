import { Route, Routes } from "react-router";
import "./App.css";
import Home from "./components/home";
import Login from "./components/login";
import Register from "./components/register";
import Admin_Portal from "./components/adminPortal";
import AdminDashboard from "./components/adminAnalytics";
import UserAnalyticsDashboard from "./components/userSummary";

function App() {
  return (
    <>
      <main className="flex-grow-1">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-portal" element={<Admin_Portal />} />
          <Route path="/analytics" element={<AdminDashboard />} />
          <Route path="/user-analytics" element={<UserAnalyticsDashboard />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
