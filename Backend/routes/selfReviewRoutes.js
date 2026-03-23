const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const SelfReview = require("../models/SelfReviewModel");

router.use(protect);

// ── EMPLOYEE: Get all my self-reviews ──────────────────────────────────────────
router.get("/", authorizeRoles("EMPLOYEE"), async (req, res) => {
  try {
    const reviews = await SelfReview.find({ employee: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ reviews, total: reviews.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── EMPLOYEE: Save draft ───────────────────────────────────────────────────────
router.post("/draft", authorizeRoles("EMPLOYEE"), async (req, res) => {
  try {
    const { period, sections } = req.body;
    if (!period) return res.status(400).json({ message: "Period is required" });

    // Upsert: update existing draft or create new one
    let review = await SelfReview.findOne({ employee: req.user.id, period, status: "DRAFT" });
    if (review) {
      review.sections = sections || [];
      await review.save();
    } else {
      review = await SelfReview.create({ employee: req.user.id, period, sections: sections || [], status: "DRAFT" });
    }
    res.json({ message: "Draft saved", review });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── EMPLOYEE: Submit review ────────────────────────────────────────────────────
router.post("/submit", authorizeRoles("EMPLOYEE"), async (req, res) => {
  try {
    const { period, sections } = req.body;
    if (!period) return res.status(400).json({ message: "Period is required" });
    if (!sections || sections.length === 0)
      return res.status(400).json({ message: "At least one section rating is required" });

    // Calculate overall average from rated sections
    const rated = sections.filter(s => s.rating);
    const overallAvg = rated.length
      ? parseFloat((rated.reduce((s, x) => s + x.rating, 0) / rated.length).toFixed(1))
      : null;

    // Upsert and mark as SUBMITTED
    let review = await SelfReview.findOne({ employee: req.user.id, period });
    if (review) {
      review.sections    = sections;
      review.overallAvg  = overallAvg;
      review.status      = "SUBMITTED";
      review.submittedAt = new Date();
      await review.save();
    } else {
      review = await SelfReview.create({
        employee: req.user.id, period, sections,
        overallAvg, status: "SUBMITTED", submittedAt: new Date(),
      });
    }
    res.json({ message: "Self review submitted successfully", review });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── HR/MANAGER: Get all self-reviews (for HR/Manager to review) ────────────────
router.get("/all", authorizeRoles("HR", "MANAGER", "SUPER_ADMIN"), async (req, res) => {
  try {
    const reviews = await SelfReview.find({ status: "SUBMITTED" })
      .populate("employee", "name department designation")
      .populate("reviewedBy", "name")
      .sort({ submittedAt: -1 });
    res.json({ reviews, total: reviews.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── HR/MANAGER: Add feedback to a self-review ─────────────────────────────────
router.put("/:id/feedback", authorizeRoles("HR", "MANAGER", "SUPER_ADMIN"), async (req, res) => {
  try {
    const { hrFeedback } = req.body;
    const review = await SelfReview.findByIdAndUpdate(
      req.params.id,
      { hrFeedback, reviewedBy: req.user.id, reviewedAt: new Date() },
      { new: true }
    ).populate("employee", "name department");
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Feedback added", review });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
