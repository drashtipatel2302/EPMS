const SalaryModel = require("../models/SalaryModel");
const UserModel = require("../models/UserModel");

// ─── GET all salary slips (HR/ADMIN) ─────────────────────────────────────────
exports.getAllSalaries = async (req, res) => {
  try {
    const { month, employeeId } = req.query;
    let filter = {};
    if (month) filter.month = month;
    if (employeeId) filter.employee = employeeId;

    const salaries = await SalaryModel.find(filter)
      .populate("employee", "name email department designation employeeId")
      .populate("approvedBy", "name")
      .sort({ month: -1, createdAt: -1 });

    res.json({ salaries, total: salaries.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET salary slips for a specific employee (HR/ADMIN) ─────────────────────
exports.getEmployeeSalaries = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const salaries = await SalaryModel.find({ employee: employeeId })
      .populate("employee", "name email department designation employeeId")
      .sort({ month: -1 });

    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── CREATE a salary slip (HR/ADMIN) ─────────────────────────────────────────
exports.createSalary = async (req, res) => {
  try {
    const { employee, month, basicSalary, hra, allowances, deductions, notes } = req.body;

    if (!employee || !month || basicSalary === undefined) {
      return res.status(400).json({ message: "employee, month, and basicSalary are required" });
    }

    const netSalary = (basicSalary || 0) + (hra || 0) + (allowances || 0) - (deductions || 0);
    const monthLabel = new Date(month + "-01").toLocaleString("en-US", { month: "long", year: "numeric" });

    const salary = await SalaryModel.create({
      employee,
      month,
      monthLabel,
      basicSalary,
      hra: hra || 0,
      allowances: allowances || 0,
      deductions: deductions || 0,
      netSalary,
      notes: notes || "",
    });

    await salary.populate("employee", "name email department designation employeeId");
    res.status(201).json({ message: "Salary slip created", salary });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Salary slip already exists for this employee and month" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE / Approve salary slip (HR/ADMIN) ─────────────────────────────────
exports.updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { basicSalary, hra, allowances, deductions, status, notes } = req.body;

    const salary = await SalaryModel.findById(id);
    if (!salary) return res.status(404).json({ message: "Salary record not found" });

    if (basicSalary !== undefined) salary.basicSalary = basicSalary;
    if (hra !== undefined) salary.hra = hra;
    if (allowances !== undefined) salary.allowances = allowances;
    if (deductions !== undefined) salary.deductions = deductions;
    if (notes !== undefined) salary.notes = notes;

    salary.netSalary = salary.basicSalary + salary.hra + salary.allowances - salary.deductions;

    if (status) {
      salary.status = status;
      if (status === "APPROVED" || status === "PAID") {
        salary.approvedBy = req.user.id;
        salary.approvedAt = new Date();
      }
    }

    await salary.save();
    await salary.populate("employee", "name email department designation employeeId");
    res.json({ message: "Salary slip updated", salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE salary slip (HR/ADMIN) ───────────────────────────────────────────
exports.deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await SalaryModel.findByIdAndDelete(id);
    if (!salary) return res.status(404).json({ message: "Salary record not found" });
    res.json({ message: "Salary slip deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
