const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewPeriod: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "ANNUAL"],
      required: true,
    },
    reviewMonth: { type: String }, // e.g. "February 2026"
    taskCompletion: { type: Number, min: 1, max: 5, required: true },
    teamwork: { type: Number, min: 1, max: 5, required: true },
    communication: { type: Number, min: 1, max: 5, required: true },
    punctuality: { type: Number, min: 1, max: 5, required: true },
    overallRating: { type: Number, min: 1, max: 5, required: true },
    goalsAchieved: { type: Number, default: null },
    totalGoals:    { type: Number, default: null },
    salaryRaise:   { type: Number, default: 0 },
    remarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Performance", performanceSchema);
