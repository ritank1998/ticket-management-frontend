import { useEffect, useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";

const UserAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (!user || !user.email) {
      setError("User email not found in session.");
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/user-summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Failed to fetch user summary.");
          setLoading(false);
          return;
        }

        const data = await res.json();

        // Apply status filter if selected
        if (statusFilter) {
          data.tickets = data.tickets.filter((t) => t.status === statusFilter);
        }

        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        console.error("User dashboard fetch error:", err);
        setError("Something went wrong while fetching dashboard.");
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [statusFilter]);

  if (loading) return <div className="text-center mt-10 text-lg font-semibold">Loading dashboard...</div>;
  if (error) return <div className="text-center mt-10 text-red-600 font-semibold">{error}</div>;

  const { totalTickets, tickets } = dashboardData;

  // Calculate counts per status
  const statusCount = {};
  tickets.forEach((t) => {
    statusCount[t.status] = (statusCount[t.status] || 0) + 1;
  });

  return (
    <>
      <Navbar />
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">User Analytics Dashboard</h1>

        {/* Status Filter */}
        <div className="mb-6 max-w-sm mx-auto">
          <label className="block font-semibold mb-2">Filter by Status</label>
          <select
            className="w-full p-2 border rounded-lg shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Resolved">Resolved</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        {/* Tickets Table */}
        <div className="bg-white rounded shadow p-4 overflow-x-auto">
          <h2 className="font-bold mb-4 text-lg">Your Tickets</h2>
          {tickets.length === 0 ? (
            <p>No tickets available.</p>
          ) : (
            <table className="w-full text-left table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2">Ticket ID</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Project</th>
                  <th className="px-4 py-2">Created At</th>
                  <th className="px-4 py-2">Completion Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.ticket_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{t.ticket_id.slice(0, 8)}...</td>
                    <td className="px-4 py-2">{t.ticket_description}</td>
                    <td className="px-4 py-2">{t.status}</td>
                    <td className="px-4 py-2">{t.project_name || "N/A"}</td>
                    <td className="px-4 py-2">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{t.completion_date ? new Date(t.completion_date).toLocaleDateString() : "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserAnalyticsDashboard;
