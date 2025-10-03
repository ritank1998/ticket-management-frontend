import { useState, useEffect } from "react"
import Navbar from "./navbar"
import Footer from "./footer"

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [projectRole, setProjectRole] = useState("")
  const [roleId, setRoleId] = useState("")  
  const [stackId, setStackId] = useState("")
  const [rolesList, setRolesList] = useState([])
  const [stacksList, setStacksList] = useState([])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/all_roles`)
        const data = await res.json()
        setRolesList(data)
      } catch (err) {
        console.error("Error fetching roles:", err)
      }
    }

    const fetchStacks = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/all_stacks`)
        const data = await res.json()
        setStacksList(data)
      } catch (err) {
        console.error("Error fetching stacks:", err)
      }
    }

    fetchRoles()
    fetchStacks()
  }, [])

  const submit = async (e) => {
    e.preventDefault()

    const payload = {
      name,
      email,
      password,
      project_role: projectRole,
      role_id: roleId, 
      stack_id: stackId,
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("Registration successful! Please log in.")
        window.location.replace("/home")
      } else {
        const err = await response.json()
        alert(err.error || "Registration failed.")
      }
    } catch (err) {
      console.error("Error:", err.message)
    }
  }

  return (
    <>
      <Navbar />

      <div className="container d-flex justify-content-center align-items-center py-5">
        <div
          className="card shadow-lg p-4 w-100"
          style={{ maxWidth: "500px", borderRadius: "1rem" }}
        >
          <h3 className="text-center mb-4 fw-bold">Sign Up</h3>
          <form onSubmit={submit}>
            {/* Name */}
            <div className="mb-3">
              <label className="form-label fw-bold">Full Name</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
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

            {/* Password */}
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

            {/* Project Role */}
            <div className="mb-3">
              <label className="form-label fw-bold">Project Role</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="e.g. Developer, QA, Manager"
                value={projectRole}
                onChange={(e) => setProjectRole(e.target.value)}
                required
              />
            </div>

            {/* Role Dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold">Role</label>
              <select
                className="form-control form-control-lg"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                {rolesList.map((r) => (
                  <option key={r.role_id} value={r.role_id}>
                    {r.role_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stack Dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold">Stack</label>
              <select
                className="form-control form-control-lg"
                value={stackId}
                onChange={(e) => setStackId(e.target.value)}
                required
              >
                <option value="">Select Stack</option>
                {stacksList.map((s) => (
                  <option key={s.stack_id} value={s.stack_id}>
                    {s.stack_name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100 btn-lg bg-slate-950">
              Register
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            Already have an account?{" "}
            <a href="/login" className="text-decoration-none">
              Login
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Register
