import express from "express";
import { generatePayroll, getPayrollByEmployee, getAllPayroll } from "../controllers/payrollController.js";
const router = express.Router();
router.post("/generate",              generatePayroll);
router.get("/",                       getAllPayroll);
router.get("/employee/:employee_id",  getPayrollByEmployee);
export default router;
