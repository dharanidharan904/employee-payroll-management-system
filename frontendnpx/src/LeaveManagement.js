import React, { useEffect, useState } from "react";
import axios from "axios";

function LeaveManagement() {
  const [employees,  setEmployees]  = useState([]);
  const [leaves,     setLeaves]     = useState([]);
  const [formData,   setFormData]   = useState({ employee_id:"", leave_type:"Sick", from_date:"", to_date:"", reason:"" });

  useEffect(() => { loadEmployees(); loadLeaves(); }, []);

  const loadEmployees = async () => {
    const res = await axios.get("http://localhost:5000/api/employees");
    setEmployees(res.data);
  };

  const loadLeaves = async () => {
    const res = await axios.get("http://localhost:5000/api/leaves");
    setLeaves(res.data);
  };

  const applyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/leaves", { ...formData, employee_id: Number(formData.employee_id) });
      alert("✅ Leave applied successfully");
      setFormData({ employee_id:"", leave_type:"Sick", from_date:"", to_date:"", reason:"" });
      loadLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Error applying leave");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}`, { status });
      loadLeaves();
    } catch (err) {
      alert("Failed to update leave status");
    }
  };

  const statusColor = (s) => s === "Approved" ? "#16a34a" : s === "Rejected" ? "#dc2626" : "#d97706";

  return (
    <div>
      {/* Apply Leave Form */}
      <div className="form-card">
        <h2>Apply Leave</h2>
        <form onSubmit={applyLeave}>
          <select
            value={formData.employee_id}
            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            style={{ width:"100%", padding:"10px", marginTop:"10px", border:"1px solid #ddd", borderRadius:"5px" }}
            required
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code})</option>
            ))}
          </select>

          <select
            value={formData.leave_type}
            onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
            style={{ width:"100%", padding:"10px", marginTop:"10px", border:"1px solid #ddd", borderRadius:"5px" }}
          >
            <option>Sick</option>
            <option>Casual</option>
            <option>Earned</option>
            <option>Unpaid</option>
          </select>

          <div style={{ display:"flex", gap:"10px" }}>
            <input type="date" placeholder="From Date" value={formData.from_date}
              onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
              style={{ flex:1, padding:"10px", marginTop:"10px", border:"1px solid #ddd", borderRadius:"5px" }} required />
            <input type="date" placeholder="To Date" value={formData.to_date}
              onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
              style={{ flex:1, padding:"10px", marginTop:"10px", border:"1px solid #ddd", borderRadius:"5px" }} required />
          </div>

          <input type="text" placeholder="Reason (optional)" value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />

          <button type="submit" className="btn">Apply Leave</button>
        </form>
      </div>

      {/* Leave Requests Table */}
      <h3 style={{ marginBottom:"10px" }}>Leave Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Employee</th><th>Department</th><th>Type</th>
            <th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((l) => (
            <tr key={l.id}>
              <td>{l.full_name}</td>
              <td>{l.department}</td>
              <td>{l.leave_type}</td>
              <td>{l.from_date?.slice(0,10)}</td>
              <td>{l.to_date?.slice(0,10)}</td>
              <td>{l.reason || "—"}</td>
              <td><span style={{ color: statusColor(l.status), fontWeight:"bold" }}>{l.status}</span></td>
              <td>
                {l.status === "Pending" && (
                  <>
                    <button onClick={() => updateStatus(l.id, "Approved")}
                      style={{ background:"#16a34a", color:"white", border:"none", padding:"5px 10px", borderRadius:"4px", cursor:"pointer", marginRight:"5px" }}>
                      Approve
                    </button>
                    <button onClick={() => updateStatus(l.id, "Rejected")}
                      style={{ background:"#dc2626", color:"white", border:"none", padding:"5px 10px", borderRadius:"4px", cursor:"pointer" }}>
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaveManagement;
