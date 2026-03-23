const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  addEmployee,
  updateEmployee,
  getAllEmployees,
  deleteEmployee,
} = require("../controllers/authControllers");
const {
  forgotSendOtp,
  forgotVerifyOtp,
  forgotResetPassword,
} = require("../controllers/otpController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/login", login);
router.post("/logout", protect, logout);
router.post("/add-employee", protect, authorizeRoles("SUPER_ADMIN", "HR"), addEmployee);
router.get("/employees", protect, authorizeRoles("SUPER_ADMIN", "HR", "MANAGER"), getAllEmployees);
router.put("/employees/:id", protect, authorizeRoles("SUPER_ADMIN", "HR"), updateEmployee);
router.delete("/employees/:id", protect, authorizeRoles("SUPER_ADMIN"), deleteEmployee);

// ── Forgot Password OTP flow (public) ───────────────────────────────────────
router.post("/forgot-password/send-otp",  forgotSendOtp);
router.post("/forgot-password/verify-otp", forgotVerifyOtp);
router.post("/forgot-password/reset",     forgotResetPassword);

module.exports = router;
