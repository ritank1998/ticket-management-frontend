 import { useState, useEffect } from "react";
import TicketModal from "./ticketInformationModal";

const Body = () => {
  const [department, setDepartment] = useState(""); // stack_id
  const [des, setDes] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [stacksList, setStacksList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [tickets, setTickets] = useState([]);
const [selectedTicket, setSelectedTicket] = useState(null);

  const userData = JSON.parse(sessionStorage.getItem("user"));


  useEffect(() => {
    if(!userData){
      window.location.replace("/login")
    }
    const deleteToken = setInterval(() => {
      sessionStorage.removeItem("token");
      alert("Session Expired, Please Login Again !!!");
      window.location.replace("/login");
    }, 60 * 60 * 1000);

    fetchStacks();
    fetchProjects();
    fetchTickets();

    return () => clearInterval(deleteToken);
  }, []);

  const fetchStacks = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/all_stacks`);
      const data = await res.json();
      setStacksList(data);
    } catch (err) {
      console.error("Error fetching stacks:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/getProject`, {
        method: "POST",
      });
      const data = await res.json();
      setProjectsList(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchTickets = async () => {
    try {
      let res;
      if (userData.role_id === 2) {
        res = await fetch(`${process.env.REACT_APP_URL}/allTickets`);
      } else {
        res = await fetch(`${process.env.REACT_APP_URL}/getTicketForUsers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userData.email }),
        });
      }
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Session Expired, Please Login Again !!!");
      window.location.replace("/login");
      return;
    }

    if (!projectId || !department) {
      alert("Please select a project and a department!");
      return;
    }

    const payload = {
      des,
      status,
      stack_id: department,
      project_id: projectId,
      email: userData.email, // ✅ send email to backend to resolve created_by
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/sendticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Your Ticket Has Been Sent Successfully 🎉");
        setDepartment("");
        setDes("");
        setStatus("");
        setProjectId("");
        fetchTickets();
      } else {
        const err = await response.json();
        alert("Error: " + (err.error || "Please try again."));
      }
    } catch (error) {
      console.error("Error:", error.message);
      alert("There was an error. Please try again.");
    }
  };

  return (
    <div className="container my-5">
      {/* Create Ticket Form */}
      <div className="d-flex justify-content-center align-items-center mb-5">
        <div className="card shadow-lg p-4 w-100" style={{ maxWidth: "600px", borderRadius: "1rem" }}>
          <h3 className="text-center mb-4 fw-bold">Create New Ticket</h3>
          <form onSubmit={handleSubmit}>
            {/* Department Dropdown */}
            <div className="mb-4">
              <label className="form-label fw-bold">Department</label>
              <select
                className="form-control form-control-lg"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {stacksList.map((s) => (
                  <option key={s.stack_id} value={s.stack_id}>
                    {s.stack_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Dropdown */}
            <div className="mb-4">
              <label className="form-label fw-bold">Project</label>
              <select
                className="form-control form-control-lg"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              >
                <option value="">Select Project</option>
                {projectsList.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="mb-4">
              <label className="form-label fw-bold">Status</label>
              <select
                className="form-control form-control-lg"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="">Select Status</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Resolved">Resolved</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>

            {/* Ticket Description */}
            <div className="mb-4">
              <label className="form-label fw-bold">Ticket Description</label>
              <textarea
                className="form-control form-control-lg"
                rows="4"
                placeholder="Describe your issue in detail..."
                value={des}
                onChange={(e) => setDes(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-dark w-100 btn-lg bg-slate-950" style={{ borderRadius: "0.5rem" }}>
              🚀 Submit Ticket
            </button>
          </form>
        </div>
      </div>

      {/* Tickets Grid */}
      <h3 className="mb-4 fw-bold text-center">Tickets</h3>
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {tickets.length === 0 ? (
    <div className="col-span-full">
      <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
        <i className="bi bi-inbox text-6xl mb-4"></i>
        <h3 className="text-lg font-semibold mb-2">No Tickets Available</h3>
        <p className="text-sm">Create a new ticket to get started</p>
      </div>
    </div>
  ) : (
    tickets.map((ticket) => (
      <div
        key={ticket.ticket_id}
        onClick={() => setSelectedTicket(ticket)}
        className="bg-white rounded-2xl shadow-md border hover:shadow-xl transition-transform transform hover:-translate-y-2 p-5 flex flex-col"
      >
        {/* Ticket Status & Date */}
        <div className="flex justify-between items-center mb-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              ticket.status === "High"
                ? "bg-red-800 text-white"
                : ticket.status === "Medium"
                ? "bg-orange-500 text-white"
                : ticket.status === "Low"
                ? "bg-yellow-400 text-gray-800"
                : ticket.status === "In Progress"
                ? "bg-blue-500 text-white"
                : ticket.status === "Resolved"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {ticket.status}
          </span>
          <span className="text-gray-400 text-xs">
            {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "-"}
          </span>
        </div>

        {/* Ticket Description */}
        <h4
          className="font-semibold text-gray-900 mb-4 line-clamp-2"
          title={ticket.ticket_description}
        >
          {ticket.ticket_description}
        </h4>

        {/* Ticket Details with Headlines */}
        <div className="mt-auto space-y-2 text-sm text-gray-600">
          <div>
            <h6 className="text-gray-400 uppercase text-xs mb-1">Project</h6>
            <p className="font-medium">{ticket.project_name || "Not Assigned"}</p>
          </div>

          <div>
            <h6 className="text-gray-400 uppercase text-xs mb-1">Assigned To</h6>
            <p className="font-medium">{ticket.assigned_user_name || "Unassigned"}</p>
          </div>

          <div>
            <h6 className="text-gray-400 uppercase text-xs mb-1">Created By</h6>
            <p className="font-medium">{ticket.creator_name || "Unknown"}</p>
          </div>

          <div>
            <h6 className="text-gray-400 uppercase text-xs mb-1">Created At</h6>
            <p className="font-medium">
              {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "-"}
            </p>
          </div>
        </div>
      </div>
    ))
  )}
</div>

<style jsx>{`
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`}</style>
 {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

export default Body;
