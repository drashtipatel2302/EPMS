const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  id:       { type: String, required: true }, // goals, quality, collab, learning, comm
  label:    { type: String },
  rating:   { type: Number, min: 1, max: 5 },
  comment:  { type: String, default: "" },
});

const selfReviewSchema = new mongoose.Schema(
  {
    employee:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    period:     { type: String, required: true },       // e.g. "Q1 2026"
    status:     { type: String, enum: ["DRAFT", "SUBMITTED"], default: "DRAFT" },
    sections:   [sectionSchema],
    overallAvg: { type: Number },                       // auto-computed
    submittedAt:{ type: Date },
    // HR/Manager can add feedback
    hrFeedback: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SelfReview", selfReviewSchema);
