const UserModel = require("../models/UserModel");
const { sendOtpEmail } = require("../utils/sendEmail");
const crypto = require("crypto");

// ── helpers ───────────────────────────────────────────────────────────────────

const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD — Step 1: Send OTP to email
// POST /api/auth/forgot-password/send-otp
// Body: { email }
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotSendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await UserModel.findOne({ email });
    // Always respond OK to avoid email enumeration
    if (!user) {
      return res.json({ message: "If this email exists, an OTP has been sent." });
    }

    const otp = generateOtp();
    user.otpCode      = otp;
    user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    user.otpPurpose   = "forgot-password";
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(email, otp, "forgot-password");

    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("forgotSendOtp error:", err);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD — Step 2: Verify OTP
// POST /api/auth/forgot-password/verify-otp
// Body: { email, otp }
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid request" });

    if (
      user.otpPurpose   !== "forgot-password" ||
      user.otpCode      !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP valid — clear it so it can't be reused; front-end will call reset next
    user.otpCode      = null;
    user.otpExpiresAt = null;
    user.otpPurpose   = null;
    await user.save({ validateBeforeSave: false });

    res.json({ message: "OTP verified successfully", verified: true });
  } catch (err) {
    console.error("forgotVerifyOtp error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD — Step 3: Reset password (after OTP verified)
// POST /api/auth/forgot-password/reset
// Body: { email, newPassword, confirmPassword }
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotResetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid request" });

    // Ensure OTP was already verified (fields are null after verification)
    if (user.otpCode !== null) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("forgotResetPassword error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD — Step 1: Send OTP (authenticated user)
// POST /api/employee/change-password/send-otp
// Requires: auth token
// ─────────────────────────────────────────────────────────────────────────────
exports.changePasswordSendOtp = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.otpCode      = otp;
    user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    user.otpPurpose   = "change-password";
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(user.email, otp, "change-password");

    res.json({ message: `OTP sent to ${user.email}` });
  } catch (err) {
    console.error("changePasswordSendOtp error:", err);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD — Step 2: Verify OTP + change password (authenticated user)
// PUT /api/employee/change-password
// Body: { otp, currentPassword, newPassword }
// Requires: auth token
// ─────────────────────────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { otp, currentPassword, newPassword } = req.body;

    if (!otp || !currentPassword || !newPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify OTP
    if (
      user.otpPurpose   !== "change-password" ||
      user.otpCode      !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Verify current password
    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    // All good — update password and clear OTP
    user.password     = newPassword; // hashed by pre-save hook
    user.otpCode      = null;
    user.otpExpiresAt = null;
    user.otpPurpose   = null;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: err.message });
  }
};
