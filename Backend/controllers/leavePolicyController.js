const LeavePolicyModel = require("../models/LeavePolicyModel");

// ─── Get all leave policies (any authenticated user) ─────────────────────────
exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await LeavePolicyModel.find({ isActive: true })
      .populate("updatedBy", "name")
      .sort({ type: 1 });
    res.json({ policies, total: policies.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Create a leave policy ────────────────────────────────────────────────
exports.createPolicy = async (req, res) => {
  try {
    const { type, days, paid, carryOver, description } = req.body;
    if (!type || days === undefined) {
      return res.status(400).json({ message: "type and days are required" });
    }

    const policy = await LeavePolicyModel.create({
      type,
      days,
      paid: paid !== undefined ? paid : true,
      carryOver: carryOver || false,
      description: description || "",
      updatedBy: req.user.id,
    });

    res.status(201).json({ message: "Leave policy created", policy });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A policy with this type already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Update a leave policy ────────────────────────────────────────────────
exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedBy: req.user.id };

    const policy = await LeavePolicyModel.findByIdAndUpdate(id, updates, { new: true })
      .populate("updatedBy", "name");

    if (!policy) return res.status(404).json({ message: "Leave policy not found" });
    res.json({ message: "Leave policy updated", policy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HR: Delete a leave policy ───────────────────────────────────────────────
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await LeavePolicyModel.findByIdAndDelete(req.params.id);
    if (!policy) return res.status(404).json({ message: "Leave policy not found" });
    res.json({ message: "Leave policy deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
