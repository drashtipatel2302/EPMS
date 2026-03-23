const ApplicantModel = require("../models/ApplicantModel");
const RecruitmentModel = require("../models/RecruitmentModel");

// Helper: sync applicant/shortlisted counts on the job posting
const syncCounts = async (jobId) => {
  const total       = await ApplicantModel.countDocuments({ job: jobId });
  const shortlisted = await ApplicantModel.countDocuments({ job: jobId, status: { $in: ["SHORTLISTED","INTERVIEW","SELECTED"] } });
  await RecruitmentModel.findByIdAndUpdate(jobId, { applicants: total, shortlisted });
};

// ─── GET all applicants for a job ────────────────────────────────────────────
exports.getApplicants = async (req, res) => {
  try {
    const applicants = await ApplicantModel.find({ job: req.params.jobId })
      .sort({ appliedAt: -1 });
    res.json({ applicants, total: applicants.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADD applicant to a job ───────────────────────────────────────────────────
exports.addApplicant = async (req, res) => {
  try {
    const { name, email, phone, experience, resumeLink, notes } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and email are required" });

    const job = await RecruitmentModel.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job posting not found" });

    const applicant = await ApplicantModel.create({
      job: req.params.jobId,
      name, email,
      phone: phone || "",
      experience: experience || "",
      resumeLink: resumeLink || "",
      notes: notes || "",
      addedBy: req.user.id,
    });

    await syncCounts(req.params.jobId);
    res.status(201).json({ message: "Applicant added", applicant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE applicant status ──────────────────────────────────────────────────
exports.updateApplicant = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const applicant = await ApplicantModel.findById(req.params.applicantId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    if (status) applicant.status = status;
    if (notes !== undefined) applicant.notes = notes;
    await applicant.save();

    await syncCounts(applicant.job);
    res.json({ message: "Applicant updated", applicant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE applicant ─────────────────────────────────────────────────────────
exports.deleteApplicant = async (req, res) => {
  try {
    const applicant = await ApplicantModel.findByIdAndDelete(req.params.applicantId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });
    await syncCounts(applicant.job);
    res.json({ message: "Applicant deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
