import pool from "../db.js";

export const applyLeave = async (req, res) => {
  const { employee_id, leave_type, from_date, to_date, reason } = req.body;

  if (!employee_id || !leave_type || !from_date || !to_date)
    return res.status(400).json({ message: "employee_id, leave_type, from_date, to_date are required." });

  try {
    const result = await pool.query(
      `INSERT INTO leaves (employee_id, leave_type, from_date, to_date, reason)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [employee_id, leave_type, from_date, to_date, reason || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to apply leave.", error: err.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, e.full_name, e.department FROM leaves l
       JOIN employees e ON e.id = l.employee_id
       ORDER BY l.applied_on DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leaves.", error: err.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status))
    return res.status(400).json({ message: "Status must be Approved or Rejected." });

  try {
    const result = await pool.query(
      "UPDATE leaves SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Leave not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update leave.", error: err.message });
  }
};
