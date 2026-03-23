const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["PROMOTION_APPROVED", "PROMOTION_REJECTED", "ANNOUNCEMENT", "GENERAL"],
      default: "GENERAL",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }, // extra data e.g. promotionId
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
