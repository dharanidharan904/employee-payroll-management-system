import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Login           from "./Login";
import Attendance      from "./Attendance";
import LeaveManagement from "./LeaveManagement";
import PayrollPanel    from "./PayrollPanel";
import Dashboard       from "./Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab,  setActiveTab]  = useState("dashboard");
  const [employees,  setEmployees]  = useState([]);
  const [editId,     setEditId]     = useState(null);
  const [formData,   setFormData]   = useState({
    employee_code:"", full_name:"", email:"", department:"", designation:"", salary:""
  });

  useEffect(() => { if (isLoggedIn) loadEmployees(); }, [isLoggedIn]);

  const loadEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/employees", formData);
      loadEmployees(); resetForm();
    } catch (err) { alert(err.response?.data?.message || "Failed to add employee"); }
  };

  const updateEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/employees/${editId}`, formData);
      setEditId(null); loadEmployees(); resetForm();
    } catch (err) { alert(err.response?.data?.message || "Failed to update"); }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      loadEmployees();
    } catch (err) { console.error(err); }
  };

  const editEmployee = (emp) => {
    setEditId(emp.id);
    setFormData({ employee_code:emp.employee_code, full_name:emp.full_name, email:emp.email, department:emp.department, designation:emp.designation, salary:emp.salary });
    setActiveTab("employees");
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const resetForm = () => setFormData({ employee_code:"", full_name:"", email:"", department:"", designation:"", salary:"" });
  const logout    = () => setIsLoggedIn(false);

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

  const TABS = [
    { id:"dashboard",  label:"📊 Dashboard"  },
    { id:"employees",  label:"👥 Employees"  },
    { id:"attendance", label:"📅 Attendance" },
    { id:"leaves",     label:"🌴 Leave"      },
    { id:"payroll",    label:"💰 Payroll"    },
  ];

  return (
    <div className="container">

      <div className="header" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"10px" }}>
        <div>
          <h1 style={{ margin:0 }}>Employee Payroll System</h1>
          <p style={{ margin:"4px 0 0", opacity:0.8 }}>Admin Dashboard</p>
        </div>
        <button onClick={logout} style={{ background:"rgba(255,255,255,0.2)", color:"white", border:"1px solid rgba(255,255,255,0.5)", padding:"8px 18px", borderRadius:"6px", cursor:"pointer" }}>
          Logout
        </button>
      </div>

      <div style={{ display:"flex", gap:"8px", margin:"20px 0", flexWrap:"wrap" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding:"10px 18px", border:"none", borderRadius:"6px", cursor:"pointer", fontWeight:"bold", fontSize:"14px",
            background: activeTab === tab.id ? "#1e3a8a" : "white",
            color:      activeTab === tab.id ? "white"   : "#555",
            boxShadow:  "0 2px 6px rgba(0,0,0,0.08)",
          }}>{tab.label}</button>
        ))}
      </div>

      {activeTab === "dashboard" && <Dashboard />}

      {activeTab === "employees" && (
        <>
          <div style={{ display:"flex", gap:"16px", marginBottom:"20px" }}>
            <div className="form-card" style={{ flex:1 }}>
              <h3>Total Employees</h3><h2>{employees.length}</h2>
            </div>
            <div className="form-card" style={{ flex:1 }}>
              <h3>Total Salary Budget</h3>
              <h2>₹{employees.reduce((s,e) => s + Number(e.salary), 0).toLocaleString()}</h2>
            </div>
          </div>

          <div className="form-card">
            <h2>{editId ? "Update Employee" : "Add Employee"}</h2>
            <form onSubmit={editId ? updateEmployee : addEmployee}>
              {[
                ["employee_code","Employee Code","text"],
                ["full_name","Full Name","text"],
                ["email","Email","email"],
                ["department","Department","text"],
                ["designation","Designation","text"],
                ["salary","Salary","number"],
              ].map(([name, placeholder, type]) => (
                <input key={name} type={type} name={name} placeholder={placeholder}
                  value={formData[name]} onChange={handleChange} required />
              ))}
              <div style={{ display:"flex", gap:"10px" }}>
                <button type="submit" className="btn">{editId ? "Update Employee" : "Add Employee"}</button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); resetForm(); }}
                    style={{ background:"#6b7280", color:"white", border:"none", padding:"12px 20px", marginTop:"15px", borderRadius:"5px", cursor:"pointer" }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th><th>Code</th><th>Name</th><th>Email</th>
                <th>Dept</th><th>Designation</th><th>Salary</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign:"center", padding:"20px", color:"#888" }}>No employees yet. Add one above.</td></tr>
              )}
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.employee_code}</td>
                  <td>{emp.full_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>₹{Number(emp.salary).toLocaleString()}</td>
                  <td style={{ display:"flex", gap:"6px", justifyContent:"center" }}>
                    <button onClick={() => editEmployee(emp)}
                      style={{ background:"#2563eb", color:"white", border:"none", padding:"6px 12px", borderRadius:"4px", cursor:"pointer" }}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => deleteEmployee(emp.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {activeTab === "attendance" && <Attendance />}
      {activeTab === "leaves"     && <LeaveManagement />}
      {activeTab === "payroll"    && <PayrollPanel />}
    </div>
  );
}

export default App;
