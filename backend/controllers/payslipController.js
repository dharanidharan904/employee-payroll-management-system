import PDFDocument from "pdfkit";
import pool from "../db.js";

const MONTH_NAMES = [
  "", "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export const generatePayslip = async (req, res) => {
  const { employee_id, month, year } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*, e.full_name, e.employee_code, e.department, e.designation, e.email
       FROM payroll p JOIN employees e ON e.id = p.employee_id
       WHERE p.employee_id=$1 AND p.month=$2 AND p.year=$3`,
      [employee_id, month, year]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Payroll record not found. Generate payroll first." });

    const d = result.rows[0];
    const monthName = MONTH_NAMES[parseInt(month)];

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payslip_${d.employee_code}_${monthName}_${year}.pdf`
    );
    doc.pipe(res);

    // ── Header ──────────────────────────────────────────────
    doc.rect(0, 0, 612, 80).fill("#1e3a8a");
    doc.fillColor("white").fontSize(22).font("Helvetica-Bold")
       .text("EMPLOYEE PAYSLIP", 50, 25, { align: "center" });
    doc.fontSize(11).font("Helvetica")
       .text("Employee Payroll Management System", 50, 52, { align: "center" });

    // ── Employee Details ────────────────────────────────────
    doc.fillColor("#1e3a8a").fontSize(13).font("Helvetica-Bold")
       .text("Employee Details", 50, 100);
    doc.moveTo(50, 118).lineTo(562, 118).stroke("#1e3a8a");

    doc.fillColor("#333").fontSize(11).font("Helvetica");
    const col1 = 50, col2 = 320;
    let y = 128;

    const detail = (label, value, x, yy) => {
      doc.font("Helvetica-Bold").text(`${label}:`, x, yy, { width: 110 });
      doc.font("Helvetica").text(value || "—", x + 115, yy, { width: 150 });
    };

    detail("Employee Code", d.employee_code,  col1, y);
    detail("Department",    d.department,      col2, y); y += 20;
    detail("Name",          d.full_name,       col1, y);
    detail("Designation",   d.designation,     col2, y); y += 20;
    detail("Email",         d.email,           col1, y);
    detail("Pay Period",    `${monthName} ${year}`, col2, y); y += 20;
    detail("Working Days",  `${d.total_days}`, col1, y);
    detail("Days Present",  `${d.days_present}`, col2, y);

    // ── Attendance Summary ──────────────────────────────────
    y += 35;
    doc.fillColor("#1e3a8a").fontSize(13).font("Helvetica-Bold")
       .text("Attendance Summary", col1, y);
    doc.moveTo(50, y + 18).lineTo(562, y + 18).stroke("#1e3a8a");
    y += 28;

    const attHeaders = ["Present", "Absent", "Leave", "Overtime (hrs)"];
    const attValues  = [d.days_present, d.days_absent, d.days_leave, parseFloat(d.overtime_hours).toFixed(2)];
    const cellW = 128;

    attHeaders.forEach((h, i) => {
      const cx = col1 + i * cellW;
      doc.rect(cx, y, cellW - 4, 36).fill("#f0f4ff");
      doc.fillColor("#1e3a8a").font("Helvetica-Bold").fontSize(10).text(h, cx + 5, y + 4, { width: cellW - 10, align: "center" });
      doc.fillColor("#333").font("Helvetica").fontSize(14).text(String(attValues[i]), cx + 5, y + 16, { width: cellW - 10, align: "center" });
    });

    // ── Earnings & Deductions ───────────────────────────────
    y += 55;
    doc.fillColor("#1e3a8a").fontSize(13).font("Helvetica-Bold")
       .text("Earnings & Deductions", col1, y);
    doc.moveTo(50, y + 18).lineTo(562, y + 18).stroke("#1e3a8a");
    y += 28;

    const tableRow = (label, amount, isDeduction, yy) => {
      doc.fillColor(isDeduction ? "#fff5f5" : "#f0fff4").rect(col1, yy, 512, 24).fill();
      doc.fillColor("#333").font("Helvetica").fontSize(11).text(label, col1 + 8, yy + 6);
      const color = isDeduction ? "#dc2626" : "#16a34a";
      const prefix = isDeduction ? "- ₹" : "+ ₹";
      doc.fillColor(color).font("Helvetica-Bold")
         .text(`${prefix}${parseFloat(amount).toFixed(2)}`, col1, yy + 6, { width: 512 - 8, align: "right" });
    };

    tableRow("Basic Salary",           d.basic_salary,    false, y); y += 28;
    tableRow("Overtime Pay",           d.overtime_pay,    false, y); y += 28;
    tableRow("PF Deduction (12%)",     d.pf_deduction,    true,  y); y += 28;
    tableRow("Tax Deduction (10%)",    d.tax_deduction,   true,  y); y += 28;
    tableRow("Leave Deduction",        d.leave_deduction, true,  y); y += 28;

    // Gross
    doc.rect(col1, y, 512, 26).fill("#e0e7ff");
    doc.fillColor("#1e3a8a").font("Helvetica-Bold").fontSize(11)
       .text("Gross Salary", col1 + 8, y + 7);
    doc.text(`₹${parseFloat(d.gross_salary).toFixed(2)}`, col1, y + 7, { width: 512 - 8, align: "right" });
    y += 32;

    // Net Salary box
    doc.rect(col1, y, 512, 40).fill("#1e3a8a");
    doc.fillColor("white").fontSize(14).font("Helvetica-Bold")
       .text("NET SALARY", col1 + 12, y + 12);
    doc.text(`₹${parseFloat(d.net_salary).toFixed(2)}`, col1, y + 12, { width: 512 - 12, align: "right" });

    // ── Footer ──────────────────────────────────────────────
    doc.fillColor("#888").fontSize(9).font("Helvetica")
       .text("This is a system-generated payslip. No signature required.",
             50, 760, { align: "center", width: 512 });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: "Failed to generate payslip.", error: err.message });
  }
};
