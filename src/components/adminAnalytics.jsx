import { useEffect, useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get user object from sessionStorage
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user || !user.email) {
      setError("Admin email not found in session.");
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/admin-analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Failed to fetch dashboard.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Something went wrong while fetching dashboard.");
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="text-center mt-10 text-lg font-semibold">Loading dashboard...</div>;
  if (error) return <div className="text-center mt-10 text-red-600 font-semibold">{error}</div>;

  const { totalTickets, statusCount, assignedUsers, allTickets } = dashboardData;

  // Create a mapping of assigned user IDs to names for easy display
  const userIdNameMap = assignedUsers.reduce((acc, user) => {
    acc[user.user_id] = user.name;
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow text-center">
            <h2 className="font-semibold text-gray-700">Total Tickets</h2>
            <p className="text-3xl font-bold">{totalTickets}</p>
          </div>

          {Object.keys(statusCount).map((status) => (
            <div key={status} className="bg-white p-4 rounded shadow text-center">
              <h2 className="font-semibold text-gray-700">{status}</h2>
              <p className="text-2xl font-bold">{statusCount[status]}</p>
            </div>
          ))}
        </div>

        {/* Tickets Assigned to Users */}
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="font-bold mb-4 text-lg">Tickets Assigned to Users</h2>
          {assignedUsers.length === 0 && <p>No tickets assigned yet.</p>}
          {assignedUsers.map((user) => (
            <div key={user.user_id} className="mb-3 border-b pb-2">
              <p className="font-semibold">{user.name} ({user.email})</p>
              <p className="text-sm text-gray-600">Tickets: {user.tickets_assigned.length}</p>
            </div>
          ))}
        </div>

        {/* All Tickets Table */}
        <div className="bg-white rounded shadow p-4 overflow-x-auto">
          <h2 className="font-bold mb-4 text-lg">All Tickets</h2>
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">Ticket ID</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {allTickets.map((t) => (
                <tr key={t.ticket_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{t.ticket_id.slice(0, 8)}...</td>
                  <td className="px-4 py-2">{t.ticket_description}</td>
                  <td className="px-4 py-2">{t.status}</td>
                  <td className="px-4 py-2">{t.assigned_to ? userIdNameMap[t.assigned_to] || "Unknown" : "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
