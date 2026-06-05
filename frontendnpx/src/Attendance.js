import React, { useEffect, useState } from "react";
import axios from "axios";

function Attendance() {
  const [employees,      setEmployees]      = useState([]);
  const [employeeId,     setEmployeeId]     = useState("");
  const [status,         setStatus]         = useState("Present");
  const [overtimeHours,  setOvertimeHours]  = useState(0);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString("en-CA"));

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    const res = await axios.get("http://localhost:5000/api/employees");
    setEmployees(res.data);
  };

  const markAttendance = async () => {
    if (!employeeId) { alert("Please select an employee"); return; }
    try {
      await axios.post("http://localhost:5000/api/attendance", {
        employee_id:     Number(employeeId),
        attendance_date: attendanceDate,
        status,
        overtime_hours:  Number(overtimeHours),
      });
      alert("✅ Attendance saved successfully");
      setEmployeeId(""); setStatus("Present"); setOvertimeHours(0);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving attendance");
    }
  };

  return (
    <div className="attendance-card">
      <h2>Attendance Management</h2>

      <label style={{ fontWeight:"bold", display:"block", marginBottom:"4px" }}>Date</label>
      <input
        type="date"
        value={attendanceDate}
        onChange={(e) => setAttendanceDate(e.target.value)}
        style={{ width:"100%", padding:"10px", marginBottom:"12px", border:"1px solid #ccc", borderRadius:"5px" }}
      />

      <label style={{ fontWeight:"bold", display:"block", marginBottom:"4px" }}>Employee</label>
      <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
        <option value="">Select Employee</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code})</option>
        ))}
      </select>

      <label style={{ fontWeight:"bold", display:"block", margin:"12px 0 4px" }}>Status</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option>Present</option>
        <option>Absent</option>
        <option>Leave</option>
      </select>

      {status === "Present" && (
        <>
          <label style={{ fontWeight:"bold", display:"block", margin:"12px 0 4px" }}>Overtime Hours</label>
          <input
            type="number"
            min="0"
            max="12"
            step="0.5"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(e.target.value)}
            style={{ width:"100%", padding:"10px", border:"1px solid #ccc", borderRadius:"5px" }}
          />
        </>
      )}

      <button className="attendance-save-btn" style={{ marginTop:"16px" }} onClick={markAttendance}>
        Save Attendance
      </button>
    </div>
  );
}

export default Attendance;
