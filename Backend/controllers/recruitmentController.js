const RecruitmentModel = require("../models/RecruitmentModel");

// ─── HR/ADMIN: Get all job postings ──────────────────────────────────────────
exports.getAllRecruitment = async (req, res) => {
  try {
    const { status, department } = req.query;
    let filter = {};
    if (status) filter.status = status.toUpperCase();
    if (department) filter.department = department;

    const jobs = await RecruitmentModel.find(filter)
      .populate("postedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ jobs, total: jobs.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Create a job posting ─────────────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    const { position, department, description, requirements, openings, closingDate, notes } = req.body;

    if (!position || !department) {
      return res.status(400).json({ message: "position and department are required" });
    }

    const job = await RecruitmentModel.create({
      position,
      department,
      description: description || "",
      requirements: requirements || "",
      openings: openings || 1,
      closingDate: closingDate || null,
      notes: notes || "",
      postedBy: req.user.id,
    });

    await job.populate("postedBy", "name");
    res.status(201).json({ message: "Job posting created", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Update job posting ───────────────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const job = await RecruitmentModel.findByIdAndUpdate(id, updates, { new: true })
      .populate("postedBy", "name");

    if (!job) return res.status(404).json({ message: "Job posting not found" });
    res.json({ message: "Job posting updated", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Delete job posting ───────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const job = await RecruitmentModel.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job posting not found" });
    res.json({ message: "Job posting deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
