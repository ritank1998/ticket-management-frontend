 import { useState, useEffect } from "react";
import { useRoutes } from "react-router";

const Body = () => {
  const [department, setDepartment] = useState(""); // stack_id
  const [des, setDes] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [stacksList, setStacksList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [tickets, setTickets] = useState([]);


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
      <div className="row g-4">
        {tickets.length === 0 ? (
          <p className="text-center text-muted w-100">No tickets available</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.ticket_id} className="col-12 col-sm-6 col-md-3">
              <div className="card shadow-sm h-100 p-3">
                <h5 className="fw-bold">{ticket.ticket_description}</h5>
                <p><strong>Status:</strong> {ticket.status}</p>
                <p><strong>Project:</strong> {ticket.project_name || "Not Assigned"}</p>
                <p><strong>Assigned To:</strong> {ticket.assigned_to || "Not Assigned"}</p>
                <p><strong>Created At:</strong> {new Date(ticket.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Body;
