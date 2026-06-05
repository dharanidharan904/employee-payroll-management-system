import pool from "../db.js";

export const getEmployees = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch employees.", error: err.message });
  }
};

export const addEmployee = async (req, res) => {
  const { employee_code, full_name, email, department, designation, salary } = req.body;

  if (!employee_code || !full_name || !email)
    return res.status(400).json({ message: "employee_code, full_name, and email are required." });

  try {
    const result = await pool.query(
      `INSERT INTO employees (employee_code, full_name, email, department, designation, salary)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [employee_code, full_name, email, department, designation, salary || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ message: "Employee code or email already exists." });
    res.status(500).json({ message: "Failed to add employee.", error: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { employee_code, full_name, email, department, designation, salary } = req.body;

  try {
    const result = await pool.query(
      `UPDATE employees SET employee_code=$1, full_name=$2, email=$3,
       department=$4, designation=$5, salary=$6 WHERE id=$7 RETURNING *`,
      [employee_code, full_name, email, department, designation, salary, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Employee not found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update employee.", error: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM employees WHERE id=$1 RETURNING id", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Employee not found." });
    res.json({ message: "Employee deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete employee.", error: err.message });
  }
};
