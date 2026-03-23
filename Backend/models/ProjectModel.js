const mongoose = require("mongoose");

const projectUpdateSchema = new mongoose.Schema(
  {
    updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    progress:    { type: Number, min: 0, max: 100 },
    status:      { type: String, enum: ["NOT_STARTED","IN_PROGRESS","NEAR_COMPLETION","COMPLETED","ON_HOLD","BEHIND_SCHEDULE"] },
    note:        { type: String, default: "" },
    blockers:    { type: String, default: "" },
    hoursLogged: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    description: { type: String, default: "" },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["NOT_STARTED","IN_PROGRESS","NEAR_COMPLETION","COMPLETED","ON_HOLD","BEHIND_SCHEDULE"],
      default: "NOT_STARTED",
    },
    progress:    { type: Number, min: 0, max: 100, default: 0 },
    startDate:   { type: Date },
    dueDate:     { type: Date },
    // Employee progress updates log
    updates:     [projectUpdateSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
