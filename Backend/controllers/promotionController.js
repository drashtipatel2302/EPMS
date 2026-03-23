const Promotion = require("../models/PromotionModel");
const UserModel = require("../models/UserModel");
const Notification = require("../models/NotificationModel");

// ===============================
// MANAGER: Recommend Promotion/Increment
// ===============================
exports.recommendPromotion = async (req, res) => {
  try {
    const { employee, type, currentDesignation, proposedDesignation, currentCTC, incrementPercent, justification } = req.body;
    const emp = await UserModel.findById(employee);
    if (!emp || emp.department !== req.user.department)
      return res.status(403).json({ message: "Employee not in your department" });

    const promotion = await Promotion.create({ employee, recommendedBy: req.user.id, type, currentDesignation, proposedDesignation, currentCTC, incrementPercent, justification });
    await promotion.populate("employee", "name designation");
    await promotion.populate("recommendedBy", "name");
    res.status(201).json({ message: "Promotion recommended to HR", promotion });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ===============================
// MANAGER: Get promotion history for their team
// ===============================
exports.getTeamPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find({ recommendedBy: req.user.id })
      .populate("employee", "name designation department")
      .populate("recommendedBy", "name")
      .sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ===============================
// HR/ADMIN: Get all promotions
// ===============================
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate("employee", "name designation department")
      .populate("recommendedBy", "name")
      .sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ===============================
// HR/ADMIN: Review (approve/reject) promotion
// Auto-updates employee profile + sends notification
// ===============================
exports.reviewPromotion = async (req, res) => {
  try {
    const { status, hrRemarks } = req.body;
    const promotion = await Promotion.findById(req.params.id)
      .populate("employee", "name designation")
      .populate("recommendedBy", "name");
    if (!promotion) return res.status(404).json({ message: "Promotion not found" });

    promotion.status = status;
    if (hrRemarks) promotion.hrRemarks = hrRemarks;
    promotion.reviewedBy = req.user.id;
    await promotion.save();

    const typeLabel = promotion.type === "PROMOTION" ? "Promotion" : promotion.type === "INCREMENT" ? "Salary Increment" : "Promotion & Increment";

    if (status === "APPROVED") {
      // Update employee profile
      const profileUpdate = {};
      if (promotion.proposedDesignation) profileUpdate.designation = promotion.proposedDesignation;
      if (Object.keys(profileUpdate).length > 0)
        await UserModel.findByIdAndUpdate(promotion.employee._id, profileUpdate);

      // Notify employee
      let empMsg = `Congratulations! Your ${typeLabel.toLowerCase()} has been approved by HR.`;
      if (promotion.proposedDesignation) empMsg += ` New designation: ${promotion.proposedDesignation}.`;
      if (promotion.incrementPercent) empMsg += ` Salary increment: +${promotion.incrementPercent}%.`;
      if (hrRemarks) empMsg += ` HR note: "${hrRemarks}"`;

      await Notification.create({ recipient: promotion.employee._id, sender: req.user.id, type: "PROMOTION_APPROVED", title: `🎉 ${typeLabel} Approved!`, message: empMsg, meta: { promotionId: promotion._id, type: promotion.type } });
      // Notify manager
      await Notification.create({ recipient: promotion.recommendedBy._id, sender: req.user.id, type: "PROMOTION_APPROVED", title: `✅ ${typeLabel} Approved`, message: `The ${typeLabel.toLowerCase()} you recommended for ${promotion.employee.name} has been approved by HR.`, meta: { promotionId: promotion._id } });
    }

    if (status === "REJECTED") {
      let rejMsg = `Your ${typeLabel.toLowerCase()} recommendation was not approved at this time.`;
      if (hrRemarks) rejMsg += ` Reason: "${hrRemarks}"`;
      await Notification.create({ recipient: promotion.employee._id, sender: req.user.id, type: "PROMOTION_REJECTED", title: `${typeLabel} Update`, message: rejMsg, meta: { promotionId: promotion._id } });
      await Notification.create({ recipient: promotion.recommendedBy._id, sender: req.user.id, type: "PROMOTION_REJECTED", title: `${typeLabel} Not Approved`, message: `The ${typeLabel.toLowerCase()} you recommended for ${promotion.employee.name} was not approved.${hrRemarks ? ` Reason: "${hrRemarks}"` : ""}`, meta: { promotionId: promotion._id } });
    }

    res.json({ message: "Promotion reviewed", promotion });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ===============================
// MANAGER: Manually notify employee about approved promotion
// POST /promotions/:id/notify
// ===============================
exports.notifyEmployee = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate("employee", "name designation")
      .populate("recommendedBy", "name");
    if (!promotion) return res.status(404).json({ message: "Promotion not found" });
    if (String(promotion.recommendedBy._id) !== String(req.user.id))
      return res.status(403).json({ message: "Not your recommendation" });
    if (promotion.status !== "APPROVED")
      return res.status(400).json({ message: "Can only notify for approved promotions" });

    const { customMessage } = req.body;
    const typeLabel = promotion.type === "PROMOTION" ? "Promotion" : promotion.type === "INCREMENT" ? "Salary Increment" : "Promotion & Increment";
    const message = customMessage || `Your manager personally congratulates you on your approved ${typeLabel.toLowerCase()}!${promotion.proposedDesignation ? ` New designation: ${promotion.proposedDesignation}.` : ""}${promotion.incrementPercent ? ` Increment: +${promotion.incrementPercent}%.` : ""}`;

    await Notification.create({ recipient: promotion.employee._id, sender: req.user.id, type: "PROMOTION_APPROVED", title: `🎊 Congratulations from Your Manager!`, message, meta: { promotionId: promotion._id } });
    res.json({ message: "Employee notified successfully" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
