const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  submitEvaluation,
  getTeamEvaluations,
  getAllPerformance,
  getEmployeeEvaluations,
  getTeamReport,
} = require("../controllers/performanceController");

router.use(protect);
router.post("/evaluate", authorizeRoles("MANAGER", "HR", "SUPER_ADMIN"), submitEvaluation);
router.get("/team", authorizeRoles("MANAGER"), getTeamEvaluations);
router.get("/team/report", authorizeRoles("MANAGER"), getTeamReport);
router.get("/all", authorizeRoles("SUPER_ADMIN", "HR"), getAllPerformance);
router.get("/employee/:id", authorizeRoles("MANAGER", "HR", "SUPER_ADMIN"), getEmployeeEvaluations);

module.exports = router;
