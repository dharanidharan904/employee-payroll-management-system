import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes       from "./routes/authRoutes.js";
import employeeRoutes   from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes      from "./routes/leaveRoutes.js";
import payrollRoutes    from "./routes/payrollRoutes.js";
import payslipRoutes    from "./routes/payslipRoutes.js";
import dashboardRoutes  from "./routes/dashboardRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",       authRoutes);
app.use("/api/employees",  employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves",     leaveRoutes);
app.use("/api/payroll",    payrollRoutes);
app.use("/api/payslip",    payslipRoutes);
app.use("/api/dashboard",  dashboardRoutes);

app.get("/", (req, res) => {
  res.json({ message: "✅ Payroll backend running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
