const express = require("express");
const router  = express.Router();
const protect        = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getTodayStatus,
  getMyAttendance,
  getAllAttendance,
  manualMark,
  recalculateStatus,
  getConfig,
} = require("../controllers/attendanceController");

router.use(protect);

router.get("/today",  getTodayStatus);
router.get("/my",     getMyAttendance);
router.get("/config", getConfig);
router.get("/all",    authorizeRoles("SUPER_ADMIN", "HR", "MANAGER"), getAllAttendance);
router.post("/manual", authorizeRoles("SUPER_ADMIN", "HR"), manualMark);
router.post("/recalculate/:id", authorizeRoles("SUPER_ADMIN", "HR"), recalculateStatus);

module.exports = router;
