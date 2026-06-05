import pool from "../db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [empCount, totalSalary, todayPresent, pendingLeaves, payrollThisMonth] =
      await Promise.all([
        pool.query("SELECT COUNT(*) AS total FROM employees"),
        pool.query("SELECT COALESCE(SUM(salary),0) AS total FROM employees"),
        pool.query(
          `SELECT COUNT(*) AS total FROM attendance
           WHERE attendance_date = CURRENT_DATE AND status = 'Present'`
        ),
        pool.query("SELECT COUNT(*) AS total FROM leaves WHERE status = 'Pending'"),
        pool.query(
          `SELECT COALESCE(SUM(net_salary),0) AS total FROM payroll
           WHERE month = EXTRACT(MONTH FROM NOW())
             AND year  = EXTRACT(YEAR  FROM NOW())`
        ),
      ]);

    // Department-wise employee count
    const deptResult = await pool.query(
      `SELECT department, COUNT(*) AS count
       FROM employees GROUP BY department ORDER BY count DESC`
    );

    // Monthly payroll trend (last 6 months)
    const trendResult = await pool.query(
      `SELECT month, year, SUM(net_salary) AS total
       FROM payroll
       WHERE (year * 100 + month) >= TO_CHAR(NOW() - INTERVAL '5 months','YYYYMM')::INT
       GROUP BY month, year ORDER BY year ASC, month ASC`
    );

    res.json({
      total_employees:      parseInt(empCount.rows[0].total),
      total_salary_budget:  parseFloat(totalSalary.rows[0].total),
      today_present:        parseInt(todayPresent.rows[0].total),
      pending_leaves:       parseInt(pendingLeaves.rows[0].total),
      payroll_this_month:   parseFloat(payrollThisMonth.rows[0].total),
      department_breakdown: deptResult.rows,
      payroll_trend:        trendResult.rows,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard.", error: err.message });
  }
};
