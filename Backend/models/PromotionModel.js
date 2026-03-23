const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recommendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["PROMOTION", "INCREMENT", "BOTH"],
      required: true,
    },
    currentDesignation: { type: String, required: true },
    proposedDesignation: { type: String },
    currentCTC: { type: Number },
    incrementPercent: { type: Number },
    justification: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);
