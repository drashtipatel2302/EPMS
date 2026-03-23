const AppraisalModel = require("../models/AppraisalModel");
const UserModel = require("../models/UserModel");

// ─── HR/ADMIN: Get all appraisals ────────────────────────────────────────────
exports.getAllAppraisals = async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    let filter = {};
    if (status) filter.status = status.toUpperCase();
    if (employeeId) filter.employee = employeeId;

    const appraisals = await AppraisalModel.find(filter)
      .populate("employee", "name email department designation employeeId")
      .populate("conductedBy", "name")
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({ appraisals, total: appraisals.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Create / Schedule an appraisal ──────────────────────────────────────
exports.createAppraisal = async (req, res) => {
  try {
    const { employee, type, dueDate, remarks } = req.body;

    if (!employee || !type || !dueDate) {
      return res.status(400).json({ message: "employee, type and dueDate are required" });
    }

    const appraisal = await AppraisalModel.create({
      employee,
      type,
      dueDate: new Date(dueDate),
      remarks: remarks || "",
      conductedBy: req.user.id,
    });

    await appraisal.populate("employee", "name email department designation");
    await appraisal.populate("conductedBy", "name");
    res.status(201).json({ message: "Appraisal scheduled", appraisal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Update appraisal (process / complete) ───────────────────────────────
exports.updateAppraisal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, raisePercent, performanceScore, remarks } = req.body;

    const appraisal = await AppraisalModel.findById(id);
    if (!appraisal) return res.status(404).json({ message: "Appraisal not found" });

    if (status) appraisal.status = status;
    if (raisePercent !== undefined) appraisal.raisePercent = raisePercent;
    if (performanceScore !== undefined) appraisal.performanceScore = performanceScore;
    if (remarks) appraisal.remarks = remarks;

    if (status === "COMPLETED") {
      appraisal.completedAt = new Date();
      appraisal.conductedBy = req.user.id;
    }

    await appraisal.save();
    await appraisal.populate("employee", "name email department designation");
    await appraisal.populate("conductedBy", "name");

    res.json({ message: "Appraisal updated", appraisal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Delete appraisal ─────────────────────────────────────────────────────
exports.deleteAppraisal = async (req, res) => {
  try {
    const appraisal = await AppraisalModel.findByIdAndDelete(req.params.id);
    if (!appraisal) return res.status(404).json({ message: "Appraisal not found" });
    res.json({ message: "Appraisal deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Dashboard summary ────────────────────────────────────────────────────
exports.getHRDashboard = async (req, res) => {
  try {
    const total = await AppraisalModel.countDocuments();
    const scheduled = await AppraisalModel.countDocuments({ status: "SCHEDULED" });
    const pending = await AppraisalModel.countDocuments({ status: "PENDING" });
    const inProgress = await AppraisalModel.countDocuments({ status: "IN_PROGRESS" });
    const completed = await AppraisalModel.countDocuments({ status: "COMPLETED" });

    const completedAppraisals = await AppraisalModel.find({ status: "COMPLETED", raisePercent: { $ne: null } });
    const avgRaise = completedAppraisals.length
      ? (completedAppraisals.reduce((s, a) => s + a.raisePercent, 0) / completedAppraisals.length).toFixed(1)
      : 0;

    res.json({ total, scheduled, pending, inProgress, completed, avgRaise });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
