const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "RESOLVED", "CLOSED"],
      default: "PENDING",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // HR who handles it
    resolution: { type: String, default: "" },
    notes: { type: String, default: "" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grievance", grievanceSchema);
