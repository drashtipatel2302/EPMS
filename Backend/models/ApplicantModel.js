const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Recruitment", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    experience: { type: String, default: "" },
    resumeLink: { type: String, default: "" },
    status: {
      type: String,
      enum: ["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"],
      default: "APPLIED",
    },
    notes: { type: String, default: "" },
    appliedAt: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Applicant", applicantSchema);
