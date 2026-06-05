import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Local fallback: works even without database
    if (username === "admin" && password === "admin123") {
      onLogin({ username: "admin", role: "admin" });
      setLoading(false);
      return;
    }

    // Try real API if local check fails
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { username, password });
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", backgroundColor:"#f4f4f4" }}>
      <div style={{ width:"380px", padding:"40px", backgroundColor:"white", borderRadius:"12px", boxShadow:"0px 4px 20px rgba(0,0,0,0.15)" }}>
        <div style={{ textAlign:"center", marginBottom:"30px" }}>
          <div style={{ width:"60px", height:"60px", background:"#1e3a8a", borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:"12px" }}>
            <span style={{ color:"white", fontSize:"26px" }}>💼</span>
          </div>
          <h2 style={{ margin:0, color:"#1e3a8a" }}>Payroll System</h2>
          <p style={{ color:"#888", margin:"6px 0 0" }}>Admin Login</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width:"100%", padding:"12px", marginBottom:"12px", border:"1px solid #ddd", borderRadius:"6px", boxSizing:"border-box" }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width:"100%", padding:"12px", marginBottom:"16px", border:"1px solid #ddd", borderRadius:"6px", boxSizing:"border-box" }}
            required
          />
          {error && <p style={{ color:"#dc2626", marginBottom:"12px", fontSize:"14px" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ width:"100%", padding:"12px", background:"#1e3a8a", color:"white", border:"none", borderRadius:"6px", fontSize:"16px", cursor:"pointer" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ textAlign:"center", color:"#aaa", fontSize:"13px", marginTop:"16px" }}>
          Username: <b>admin</b> &nbsp;|&nbsp; Password: <b>admin123</b>
        </p>
      </div>
    </div>
  );
}

export default Login;
