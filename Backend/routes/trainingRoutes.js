const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAllTraining, addTraining, updateTraining, deleteTraining } = require("../controllers/trainingController");

router.use(protect);
// Employee can view their own training
router.get("/my", async (req, res) => {
  const TrainingModel = require("../models/TrainingModel");
  try {
    const records = await TrainingModel.find({ employee: req.user.id }).sort({ startDate: -1 });
    res.json({ records, total: records.length });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
// Employee updates their own training progress
router.put("/my/:id", async (req, res) => {
  const TrainingModel = require("../models/TrainingModel");
  try {
    const { employeeStatus, employeeNote } = req.body;
    const record = await TrainingModel.findOne({ _id: req.params.id, employee: req.user.id });
    if (!record) return res.status(404).json({ message: "Training record not found" });

    const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "NEEDS_HELP"];
    if (employeeStatus && !validStatuses.includes(employeeStatus))
      return res.status(400).json({ message: "Invalid status" });

    if (employeeStatus) record.employeeStatus = employeeStatus;
    if (employeeNote !== undefined) record.employeeNote = employeeNote;
    record.employeeUpdatedAt = new Date();

    // Auto-sync main status based on employee update
    if (employeeStatus === "COMPLETED")   record.status = "COMPLETED";
    if (employeeStatus === "IN_PROGRESS") record.status = "IN_PROGRESS";

    await record.save();
    res.json({ message: "Training progress updated", record });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// HR responds to employee training update
router.put("/:id/respond", authorizeRoles("HR", "SUPER_ADMIN"), async (req, res) => {
  const TrainingModel = require("../models/TrainingModel");
  try {
    const { hrFeedback, status, score } = req.body;
    const record = await TrainingModel.findById(req.params.id)
      .populate("employee", "name department designation");
    if (!record) return res.status(404).json({ message: "Training record not found" });

    if (hrFeedback !== undefined) record.hrFeedback = hrFeedback;
    if (status)  record.status = status;
    if (score !== undefined) record.score = score;
    record.hrRespondedAt = new Date();
    record.hrRespondedBy = req.user.id;

    await record.save();
    await record.populate("hrRespondedBy", "name");
    res.json({ message: "HR response saved", record });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/", authorizeRoles("HR", "SUPER_ADMIN"), getAllTraining);
router.post("/", authorizeRoles("HR", "SUPER_ADMIN"), addTraining);
router.put("/:id", authorizeRoles("HR", "SUPER_ADMIN"), updateTraining);
router.delete("/:id", authorizeRoles("HR", "SUPER_ADMIN"), deleteTraining);

module.exports = router;
