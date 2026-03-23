const TrainingModel = require("../models/TrainingModel");

// ─── HR/ADMIN: Get all training records ──────────────────────────────────────
exports.getAllTraining = async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    let filter = {};
    if (status) filter.status = status.toUpperCase();
    if (employeeId) filter.employee = employeeId;

    const records = await TrainingModel.find(filter)
      .populate("employee", "name email department designation employeeId")
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ records, total: records.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Add training record ──────────────────────────────────────────────────
exports.addTraining = async (req, res) => {
  try {
    const { employee, course, provider, category, startDate, endDate, notes } = req.body;

    if (!employee || !course || !provider || !startDate || !endDate) {
      return res.status(400).json({ message: "employee, course, provider, startDate, endDate are required" });
    }

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    let status = "UPCOMING";
    if (now >= start && now <= end) status = "IN_PROGRESS";
    if (now > end) status = "COMPLETED";

    const training = await TrainingModel.create({
      employee,
      course,
      provider,
      category: category || "General",
      startDate: start,
      endDate: end,
      status,
      notes: notes || "",
      addedBy: req.user.id,
    });

    await training.populate("employee", "name email department designation");
    res.status(201).json({ message: "Training record added", training });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Update training record ───────────────────────────────────────────────
exports.updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const training = await TrainingModel.findByIdAndUpdate(id, updates, { new: true })
      .populate("employee", "name email department designation")
      .populate("addedBy", "name");

    if (!training) return res.status(404).json({ message: "Training record not found" });
    res.json({ message: "Training record updated", training });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Delete training record ───────────────────────────────────────────────
exports.deleteTraining = async (req, res) => {
  try {
    const training = await TrainingModel.findByIdAndDelete(req.params.id);
    if (!training) return res.status(404).json({ message: "Training record not found" });
    res.json({ message: "Training record deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
