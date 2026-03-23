const GrievanceModel = require("../models/GrievanceModel");

// ─── EMPLOYEE: Submit grievance ───────────────────────────────────────────────
exports.submitGrievance = async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ message: "Subject and description are required" });
    }

    const grievance = await GrievanceModel.create({
      employee: req.user.id,
      subject,
      description,
      priority: priority || "MEDIUM",
    });

    await grievance.populate("employee", "name email department designation");
    res.status(201).json({ message: "Grievance submitted", grievance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── EMPLOYEE: Get own grievances ─────────────────────────────────────────────
exports.getMyGrievances = async (req, res) => {
  try {
    const grievances = await GrievanceModel.find({ employee: req.user.id })
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 });
    res.json(grievances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR/ADMIN: Get all grievances ────────────────────────────────────────────
exports.getAllGrievances = async (req, res) => {
  try {
    const { status, priority } = req.query;
    let filter = {};
    if (status) filter.status = status.toUpperCase();
    if (priority) filter.priority = priority.toUpperCase();

    const grievances = await GrievanceModel.find(filter)
      .populate("employee", "name email department designation employeeId")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 });

    res.json({ grievances, total: grievances.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Update grievance status / assign / resolve ──────────────────────────
exports.updateGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, resolution } = req.body;

    const grievance = await GrievanceModel.findById(id);
    if (!grievance) return res.status(404).json({ message: "Grievance not found" });

    if (status) grievance.status = status;
    if (notes) grievance.notes = notes;
    if (resolution) grievance.resolution = resolution;

    grievance.assignedTo = req.user.id;

    if (status === "RESOLVED") {
      grievance.resolvedAt = new Date();
    }

    await grievance.save();
    await grievance.populate("employee", "name email department designation");
    await grievance.populate("assignedTo", "name");

    res.json({ message: "Grievance updated", grievance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
