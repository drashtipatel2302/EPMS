const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
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
    loginTime: {
      type: Date,
      default: null,
    },
    logoutTime: {
      type: Date,
      default: null,
    },
    hoursWorked: {
      type: Number,
      default: 0,
    },
    // Tracks hours from completed sessions (re-login support)
    // When a user logs out and logs back in, the hours from the previous
    // session are saved here so they aren't lost.
    accumulatedHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LATE", "HALF_DAY"],
      default: "PRESENT",
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// One record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const AttendanceModel = mongoose.model("Attendance", attendanceSchema);
module.exports = AttendanceModel;
