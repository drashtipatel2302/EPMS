const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["GENERAL", "HR", "POLICY", "EVENT", "URGENT", "TRAINING"],
      default: "GENERAL",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    targetRoles: {
      type: [String],
      enum: ["ALL", "EMPLOYEE", "MANAGER", "HR"],
      default: ["ALL"],
    },
    targetDepartments: {
      type: [String],
      default: [],
    },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
