const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: { type: String, required: true }, // e.g. "2024-02"
    monthLabel: { type: String },            // e.g. "February 2024"
    basicSalary: { type: Number, required: true, default: 0 },
    hra: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "PAID"],
      default: "PENDING",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

salarySchema.index({ employee: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Salary", salarySchema);
