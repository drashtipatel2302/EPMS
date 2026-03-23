const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  getMySalarySlips,
  getMyPerformance,
  getMyTasks,
  updateMyTaskStatus,
  getEmployeeDashboard,
} = require("../controllers/employeeController");
const {
  changePasswordSendOtp,
  changePassword,
} = require("../controllers/otpController");

// All routes require authentication
router.use(protect);

// Dashboard
router.get("/dashboard", authorizeRoles("EMPLOYEE"), getEmployeeDashboard);

// Profile
router.get("/profile", getMyProfile);
router.put("/profile", updateMyProfile); // all roles can update their own profile

// Change Password — OTP flow
router.post("/change-password/send-otp", changePasswordSendOtp);
router.put("/change-password",           changePassword);

// Salary Slips
router.get("/salary-slips", authorizeRoles("EMPLOYEE"), getMySalarySlips);

// Performance
router.get("/performance", authorizeRoles("EMPLOYEE"), getMyPerformance);

// Tasks
router.get("/tasks", authorizeRoles("EMPLOYEE"), getMyTasks);
router.put("/tasks/:id/status", authorizeRoles("EMPLOYEE"), updateMyTaskStatus);

module.exports = router;
