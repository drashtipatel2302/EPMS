const mongoose = require("mongoose");

const dailyReportSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    tasksCompleted: { type: String, required: true },
    tasksInProgress: { type: String, default: "" },
    blockers: { type: String, default: "" },
    hoursWorked: { type: Number, default: 0, min: 0, max: 24 },
    mood: {
      type: String,
      enum: ["GREAT", "GOOD", "NEUTRAL", "STRESSED", "STRUGGLING"],
      default: "GOOD",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// One report per employee per day
dailyReportSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyReport", dailyReportSchema);
