import express from "express";
import { applyLeave, getAllLeaves, updateLeaveStatus } from "../controllers/leaveController.js";
const router = express.Router();
router.post("/",         applyLeave);
router.get("/",          getAllLeaves);
router.put("/:id",       updateLeaveStatus);
export default router;
