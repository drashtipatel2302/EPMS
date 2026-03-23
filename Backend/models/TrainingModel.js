const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: { type: String, required: true },
    provider: { type: String, required: true },
    category: { type: String, default: "General" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["UPCOMING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
    score: { type: Number, default: null },
    certificate: { type: String, default: "" },
    notes: { type: String, default: "" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Employee progress updates
    employeeStatus: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "NEEDS_HELP"],
      default: "NOT_STARTED",
    },
    employeeNote:      { type: String, default: "" },    // employee's progress note
    employeeUpdatedAt: { type: Date },
    // HR response to employee
    hrFeedback:        { type: String, default: "" },    // HR feedback/response
    hrRespondedAt:     { type: Date },
    hrRespondedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Training", trainingSchema);
