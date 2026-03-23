const mongoose = require("mongoose");

const appraisalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["ANNUAL", "MID_YEAR", "QUARTERLY", "PROBATION"],
      required: true,
    },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["SCHEDULED", "PENDING", "IN_PROGRESS", "COMPLETED"],
      default: "SCHEDULED",
    },
    raisePercent: { type: Number, default: null },
    performanceScore: { type: Number, default: null },
    remarks: { type: String, default: "" },
    conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // HR
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appraisal", appraisalSchema);
