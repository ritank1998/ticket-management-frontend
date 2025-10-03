import { useState, useEffect } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import { useNavigate } from "react-router-dom";

const Admin_Portal = () => {
  const [projectName, setProjectName] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const navigate = useNavigate();

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.clear(); // remove any saved tokens/sessions
    alert("Logged out successfully!");
    navigate("/login"); // redirect to login page
  };

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/getallUsers`);
        const data = await res.json();
        setUsersList(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/getprojectlist`);
        const data = await res.json();
        setProjectsList(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

  // Fetch table data
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/get_users_table`);
        const data = await res.json();
        setTableData(data);
      } catch (err) {
        console.error("Error fetching table data:", err);
      }
    };
    fetchTableData();
  }, []);

  // Add Project
  const handleAddProject = async () => {
    if (!projectName || !selectedUser) {
      alert("Please enter a project name and select a user!");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/add_project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_name: projectName, pm_id: selectedUser }),
      });

      if (res.ok) {
        alert("Project added successfully!");
        setProjectName("");
        setSelectedUser("");
        const tableRes = await fetch(`${process.env.REACT_APP_URL}/get_users_table`);
        const tableData = await tableRes.json();
        setTableData(tableData);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add project.");
      }
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project.");
    }
  };

  // Assign project to user (team creation)
  const handleAssignProject = async () => {
    if (!selectedProject || !selectedUser) {
      alert("Please select a project and a user!");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/updateUserProject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, project_id: selectedProject }),
      });

      if (res.ok) {
        alert("User assigned to project successfully!");
        setSelectedUser("");
        setSelectedProject("");

        // refresh table data
        const tableRes = await fetch(`${process.env.REACT_APP_URL}/get_users_table`);
        const tableData = await tableRes.json();
        setTableData(tableData);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to assign user.");
      }
    } catch (error) {
      console.error("Error assigning project:", error);
      alert("Failed to assign user to project.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* ✅ Navbar without extra styles */}
      <Navbar onLogout={handleLogout} />

      <div className="flex-grow-1 container py-4">
        <h2 className="text-center mb-4 fw-bold">Admin Portal</h2>

        {/* Add Project */}
        <div className="card mb-4 shadow-sm p-4">
          <h5 className="mb-3 fw-bold">Add Project</h5>
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Enter Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="col-md-5">
              <select
                className="form-select form-select-lg"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select PM</option>
                {usersList.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-success btn-lg" onClick={handleAddProject}>
                Add Project
              </button>
            </div>
          </div>
        </div>

        {/* Create Team */}
        <div className="card mb-4 shadow-sm p-4">
          <h5 className="mb-3 fw-bold">Assign Users to Project (Team)</h5>
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <select
                className="form-select form-select-lg"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Select Project</option>
                {projectsList.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <select
                className="form-select form-select-lg"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select User</option>
                {usersList.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-primary btn-lg" onClick={handleAssignProject}>
                Assign
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive shadow rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Role</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center text-muted">
                    No data available
                  </td>
                </tr>
              ) : (
                tableData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.name}</td>
                    <td>{row.role_id === 1 ? "Admin" : "User"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Admin_Portal;
