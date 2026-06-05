import express from "express";
import { markAttendance, getAttendanceByEmployee, getMonthlyAttendanceSummary } from "../controllers/attendanceController.js";
const router = express.Router();
router.post("/",                                    markAttendance);
router.get("/employee/:employee_id",                getAttendanceByEmployee);
router.get("/summary/:employee_id/:month/:year",    getMonthlyAttendanceSummary);
export default router;
