import React, { useEffect, useState } from "react";
import axios from "axios";

const MONTHS = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

function PayrollPanel() {
  const [employees, setEmployees] = useState([]);
  const [payrolls,  setPayrolls]  = useState([]);
  const [form, setForm] = useState({
    employee_id: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), total_days: 30
  });
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear,  setFilterYear]  = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadEmployees(); }, []);
  useEffect(() => { loadPayrolls(); }, [filterMonth, filterYear]);

  const loadEmployees = async () => {
    const res = await axios.get("http://localhost:5000/api/employees");
    setEmployees(res.data);
  };

  const loadPayrolls = async () => {
    const res = await axios.get(`http://localhost:5000/api/payroll?month=${filterMonth}&year=${filterYear}`);
    setPayrolls(res.data);
  };

  const generatePayroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/payroll/generate", {
        employee_id: Number(form.employee_id),
        month:       Number(form.month),
        year:        Number(form.year),
        total_days:  Number(form.total_days),
      });
      alert("✅ Payroll generated successfully");
      loadPayrolls();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate payroll");
    } finally {
      setLoading(false);
    }
  };

  const downloadPayslip = (emp_id, month, year) => {
    window.open(`http://localhost:5000/api/payslip/${emp_id}/${month}/${year}`, "_blank");
  };

  return (
    <div>
      {/* Generate Form */}
      <div className="form-card">
        <h2>Generate Payroll</h2>
        <form onSubmit={generatePayroll}>
          <select
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            style={{ width:"100%", padding:"10px", marginTop:"10px", border:"1px solid #ddd", borderRadius:"5px" }}
            required
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code})</option>
            ))}
          </select>

          <div style={{ display:"flex", gap:"10px" }}>
            <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}
              style={{ flex:1, padding:"10px", marginTop:"10px", border:"1px solid #ddd", borderRadius:"5px" }}>
              {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <input type="number" value={form.year} min="2020" max="2099"
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              style={{ flex:1, padding:"10px", marginTop:"10px", border:"1px solid #ddd", borderRadius:"5px" }} />
            <input type="number" value={form.total_days} min="28" max="31" placeholder="Working Days"
              onChange={(e) => setForm({ ...form, total_days: e.target.value })}
              style={{ flex:1, padding:"10px", marginTop:"10px", border:"1px solid #ddd", borderRadius:"5px" }} />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Generating..." : "Generate Payroll"}
          </button>
        </form>
      </div>

      {/* Filter + Table */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"14px", alignItems:"center" }}>
        <h3 style={{ margin:0 }}>Payroll Records</h3>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
          style={{ padding:"8px", border:"1px solid #ddd", borderRadius:"5px" }}>
          {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <input type="number" value={filterYear} min="2020" max="2099"
          onChange={(e) => setFilterYear(e.target.value)}
          style={{ width:"90px", padding:"8px", border:"1px solid #ddd", borderRadius:"5px" }} />
      </div>

      <table>
        <thead>
          <tr>
            <th>Employee</th><th>Dept</th><th>Present</th><th>OT Hrs</th>
            <th>Basic</th><th>OT Pay</th><th>Deductions</th><th>Gross</th><th>Net Salary</th><th>Payslip</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.length === 0 && (
            <tr><td colSpan="10" style={{ textAlign:"center", padding:"20px", color:"#888" }}>
              No payroll records for this period
            </td></tr>
          )}
          {payrolls.map((p) => (
            <tr key={p.id}>
              <td>{p.full_name}</td>
              <td>{p.department}</td>
              <td>{p.days_present}/{p.total_days}</td>
              <td>{parseFloat(p.overtime_hours).toFixed(1)}</td>
              <td>₹{parseFloat(p.basic_salary).toFixed(0)}</td>
              <td style={{ color:"#16a34a" }}>₹{parseFloat(p.overtime_pay).toFixed(0)}</td>
              <td style={{ color:"#dc2626" }}>
                ₹{(parseFloat(p.pf_deduction) + parseFloat(p.tax_deduction) + parseFloat(p.leave_deduction)).toFixed(0)}
              </td>
              <td>₹{parseFloat(p.gross_salary).toFixed(0)}</td>
              <td style={{ fontWeight:"bold", color:"#1e3a8a" }}>₹{parseFloat(p.net_salary).toFixed(0)}</td>
              <td>
                <button
                  onClick={() => downloadPayslip(p.employee_id, p.month, p.year)}
                  style={{ background:"#7c3aed", color:"white", border:"none", padding:"6px 12px", borderRadius:"4px", cursor:"pointer" }}
                >
                  📄 PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PayrollPanel;
