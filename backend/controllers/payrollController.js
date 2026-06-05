import pool from "../db.js";

// Payroll calculation rules:
// - Per day salary  = basic_salary / total_days
// - Overtime rate   = (basic_salary / total_days / 8) * 1.5  (1.5x hourly rate)
// - Leave deduction = unpaid_leave_days * per_day_salary
// - PF deduction    = 12% of basic_salary
// - Tax deduction   = 10% if net > 25000, else 0

export const generatePayroll = async (req, res) => {
  const { employee_id, month, year, total_days } = req.body;

  if (!employee_id || !month || !year)
    return res.status(400).json({ message: "employee_id, month, and year are required." });

  try {
    // Get employee
    const empResult = await pool.query("SELECT * FROM employees WHERE id = $1", [employee_id]);
    if (empResult.rowCount === 0)
      return res.status(404).json({ message: "Employee not found." });

    const emp = empResult.rows[0];
    const workingDays = total_days || 30;

    // Get attendance summary for the month
    const attResult = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'Present') AS days_present,
         COUNT(*) FILTER (WHERE status = 'Absent')  AS days_absent,
         COUNT(*) FILTER (WHERE status = 'Leave')   AS days_leave,
         COALESCE(SUM(overtime_hours), 0)            AS overtime_hours
       FROM attendance
       WHERE employee_id = $1
         AND EXTRACT(MONTH FROM attendance_date) = $2
         AND EXTRACT(YEAR  FROM attendance_date) = $3`,
      [employee_id, month, year]
    );

    const att = attResult.rows[0];
    const daysPresent   = parseInt(att.days_present)   || 0;
    const daysAbsent    = parseInt(att.days_absent)    || 0;
    const daysLeave     = parseInt(att.days_leave)     || 0;
    const overtimeHours = parseFloat(att.overtime_hours) || 0;

    // Check approved leaves — approved leaves are NOT deducted (paid leave)
    const leaveResult = await pool.query(
      `SELECT COALESCE(SUM(to_date - from_date + 1), 0) AS approved_days
       FROM leaves
       WHERE employee_id = $1
         AND status = 'Approved'
         AND EXTRACT(MONTH FROM from_date) = $2
         AND EXTRACT(YEAR  FROM from_date) = $3`,
      [employee_id, month, year]
    );
    const approvedLeaveDays = parseInt(leaveResult.rows[0].approved_days) || 0;

    const basicSalary   = parseFloat(emp.salary);
    const perDaySalary  = basicSalary / workingDays;
    const hourlyRate    = perDaySalary / 8;

    // Only absent days without approved leave get deducted
    const unpaidAbsent  = Math.max(0, daysAbsent - 0); // absent always deducted
    const leaveDeduction = unpaidAbsent * perDaySalary;

    const overtimePay   = overtimeHours * hourlyRate * 1.5;
    const earnedSalary  = (daysPresent + approvedLeaveDays) * perDaySalary;
    const grossSalary   = earnedSalary + overtimePay;

    const pfDeduction   = basicSalary * 0.12;
    const taxableAmount = grossSalary - pfDeduction;
    const taxDeduction  = taxableAmount > 25000 ? taxableAmount * 0.10 : 0;

    const netSalary     = grossSalary - pfDeduction - taxDeduction;

    // Upsert payroll record
    const result = await pool.query(
      `INSERT INTO payroll
         (employee_id, month, year, total_days, days_present, days_absent, days_leave,
          overtime_hours, basic_salary, overtime_pay, leave_deduction,
          gross_salary, pf_deduction, tax_deduction, net_salary, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'Generated')
       ON CONFLICT (employee_id, month, year)
       DO UPDATE SET
         days_present=$5, days_absent=$6, days_leave=$7, overtime_hours=$8,
         basic_salary=$9, overtime_pay=$10, leave_deduction=$11,
         gross_salary=$12, pf_deduction=$13, tax_deduction=$14,
         net_salary=$15, status='Generated', generated_at=NOW()
       RETURNING *`,
      [
        employee_id, month, year, workingDays,
        daysPresent, daysAbsent, daysLeave,
        overtimeHours.toFixed(2),
        basicSalary.toFixed(2),
        overtimePay.toFixed(2),
        leaveDeduction.toFixed(2),
        grossSalary.toFixed(2),
        pfDeduction.toFixed(2),
        taxDeduction.toFixed(2),
        netSalary.toFixed(2)
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate payroll.", error: err.message });
  }
};

export const getPayrollByEmployee = async (req, res) => {
  const { employee_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, e.full_name, e.department, e.designation
       FROM payroll p JOIN employees e ON e.id = p.employee_id
       WHERE p.employee_id = $1
       ORDER BY p.year DESC, p.month DESC`,
      [employee_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payroll.", error: err.message });
  }
};

export const getAllPayroll = async (req, res) => {
  const { month, year } = req.query;
  try {
    let query = `SELECT p.*, e.full_name, e.department, e.designation
                 FROM payroll p JOIN employees e ON e.id = p.employee_id`;
    const params = [];

    if (month && year) {
      query += " WHERE p.month=$1 AND p.year=$2";
      params.push(month, year);
    }

    query += " ORDER BY p.year DESC, p.month DESC, e.full_name ASC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payroll.", error: err.message });
  }
};
