const mongoose = require("mongoose");

const recruitmentSchema = new mongoose.Schema(
  {
    position: { type: String, required: true },
    department: { type: String, required: true },
    description: { type: String, default: "" },
    requirements: { type: String, default: "" },
    openings: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["ACTIVE", "INTERVIEW", "OFFER", "CLOSED"],
      default: "ACTIVE",
    },
    applicants: { type: Number, default: 0 },
    shortlisted: { type: Number, default: 0 },
    postedDate: { type: Date, default: Date.now },
    closingDate: { type: Date },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recruitment", recruitmentSchema);
