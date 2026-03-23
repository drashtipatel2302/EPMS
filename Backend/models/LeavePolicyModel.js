const mongoose = require("mongoose");

const leavePolicySchema = new mongoose.Schema(
  {
    type: { type: String, required: true, unique: true }, // e.g. "Annual Leave"
    days: { type: Number, required: true },
    paid: { type: Boolean, default: true },
    carryOver: { type: Boolean, default: false },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeavePolicy", leavePolicySchema);
