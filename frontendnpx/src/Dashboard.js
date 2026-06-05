import React, { useEffect, useState } from "react";
import axios from "axios";

const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard")
      .then((res) => setStats(res.data))
      .catch(() => setError("Could not load dashboard. Is the backend running?"));
  }, []);

  if (error) return <div style={{ padding:"20px", color:"#dc2626", background:"#fff5f5", borderRadius:"8px" }}>{error}</div>;
  if (!stats) return <div style={{ padding:"20px", color:"#888" }}>Loading dashboard...</div>;

  const maxPayroll = Math.max(...(stats.payroll_trend.map(t => parseFloat(t.total))), 1);

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display:"flex", gap:"16px", marginBottom:"24px", flexWrap:"wrap" }}>
        {[
          { label:"Total Employees",    value: stats.total_employees,                                    icon:"👥", color:"#1e3a8a" },
          { label:"Today Present",      value: stats.today_present,                                      icon:"✅", color:"#16a34a" },
          { label:"Pending Leaves",     value: stats.pending_leaves,                                     icon:"📋", color:"#d97706" },
          { label:"This Month Payroll", value:`₹${parseInt(stats.payroll_this_month).toLocaleString()}`, icon:"💰", color:"#7c3aed" },
        ].map((card) => (
          <div key={card.label} style={{ flex:"1", minWidth:"180px", background:"white", padding:"20px", borderRadius:"10px", boxShadow:"0 2px 10px rgba(0,0,0,0.08)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ margin:0, color:"#888", fontSize:"13px" }}>{card.label}</p>
                <h2 style={{ margin:"6px 0 0", color:card.color, fontSize:"28px" }}>{card.value}</h2>
              </div>
              <span style={{ fontSize:"32px" }}>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:"20px", flexWrap:"wrap" }}>
        {/* Payroll Bar Chart */}
        <div style={{ flex:2, minWidth:"280px", background:"white", padding:"20px", borderRadius:"10px", boxShadow:"0 2px 10px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin:"0 0 16px", color:"#1e3a8a" }}>Monthly Payroll Trend</h3>
          {stats.payroll_trend.length === 0
            ? <p style={{ color:"#aaa", textAlign:"center", padding:"40px 0" }}>No payroll data yet. Generate payroll to see the trend.</p>
            : <div style={{ display:"flex", alignItems:"flex-end", gap:"8px", height:"180px", paddingBottom:"8px" }}>
                {stats.payroll_trend.map((t, i) => {
                  const h = Math.max(20, (parseFloat(t.total) / maxPayroll) * 160);
                  return (
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
                      <span style={{ fontSize:"10px", color:"#555" }}>₹{(parseFloat(t.total)/1000).toFixed(0)}k</span>
                      <div style={{ width:"100%", height:`${h}px`, background:"#2563eb", borderRadius:"4px 4px 0 0" }} title={`₹${parseFloat(t.total).toLocaleString()}`} />
                      <span style={{ fontSize:"11px", color:"#888" }}>{MONTH_NAMES[t.month]}</span>
                    </div>
                  );
                })}
              </div>
          }
        </div>

        {/* Department Table */}
        <div style={{ flex:1, minWidth:"220px", background:"white", padding:"20px", borderRadius:"10px", boxShadow:"0 2px 10px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin:"0 0 16px", color:"#1e3a8a" }}>Employees by Department</h3>
          {stats.department_breakdown.length === 0
            ? <p style={{ color:"#aaa", textAlign:"center" }}>No employees yet.</p>
            : stats.department_breakdown.map((d, i) => (
                <div key={i} style={{ marginBottom:"10px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                    <span style={{ fontSize:"13px" }}>{d.department || "N/A"}</span>
                    <span style={{ fontWeight:"bold", fontSize:"13px" }}>{d.count}</span>
                  </div>
                  <div style={{ background:"#e5e7eb", borderRadius:"4px", height:"8px" }}>
                    <div style={{ background:"#1e3a8a", borderRadius:"4px", height:"8px", width:`${(d.count / stats.total_employees) * 100}%` }} />
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
