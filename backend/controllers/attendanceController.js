import pool from "../db.js";

export const markAttendance = async (req, res) => {
  const { employee_id, attendance_date, status, overtime_hours } = req.body;

  if (!employee_id || !attendance_date || !status)
    return res.status(400).json({ message: "employee_id, attendance_date, and status are required." });

  try {
    const result = await pool.query(
      `INSERT INTO attendance (employee_id, attendance_date, status, overtime_hours)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (employee_id, attendance_date)
       DO UPDATE SET status = EXCLUDED.status, overtime_hours = EXCLUDED.overtime_hours
       RETURNING *`,
      [employee_id, attendance_date, status, overtime_hours || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to mark attendance.", error: err.message });
  }
};

export const getAttendanceByEmployee = async (req, res) => {
  const { employee_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.*, e.full_name FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       WHERE a.employee_id = $1 ORDER BY attendance_date DESC`,
      [employee_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to get attendance.", error: err.message });
  }
};

export const getMonthlyAttendanceSummary = async (req, res) => {
  const { employee_id, month, year } = req.params;
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'Present') AS days_present,
         COUNT(*) FILTER (WHERE status = 'Absent')  AS days_absent,
         COUNT(*) FILTER (WHERE status = 'Leave')   AS days_leave,
         COALESCE(SUM(overtime_hours), 0)            AS total_overtime_hours
       FROM attendance
       WHERE employee_id = $1
         AND EXTRACT(MONTH FROM attendance_date) = $2
         AND EXTRACT(YEAR  FROM attendance_date) = $3`,
      [employee_id, month, year]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to get summary.", error: err.message });
  }
};
