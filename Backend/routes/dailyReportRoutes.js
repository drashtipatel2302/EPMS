const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  submitDailyReport,
  getMyReports,
  getTodayReport,
  getTeamReports,
} = require("../controllers/dailyReportController");

router.use(protect);

// Employee routes
router.post("/", authorizeRoles("EMPLOYEE"), submitDailyReport);
router.get("/my", authorizeRoles("EMPLOYEE"), getMyReports);
router.get("/today", authorizeRoles("EMPLOYEE"), getTodayReport);

// Manager/HR/Admin routes
router.get("/team", authorizeRoles("MANAGER", "HR", "SUPER_ADMIN"), getTeamReports);

module.exports = router;
