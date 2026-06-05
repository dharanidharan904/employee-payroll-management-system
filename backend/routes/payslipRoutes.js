import express from "express";
import { generatePayslip } from "../controllers/payslipController.js";
const router = express.Router();
router.get("/:employee_id/:month/:year", generatePayslip);
export default router;
