const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  applyLeave,
  getMyLeaves,
  getTeamLeaveRequests,
  reviewLeave,
  getAllLeaveRequests,
} = require("../controllers/leaveController");

router.use(protect);
router.post("/apply", authorizeRoles("EMPLOYEE"), applyLeave);
router.get("/my", authorizeRoles("EMPLOYEE"), getMyLeaves);
router.get("/team", authorizeRoles("MANAGER"), getTeamLeaveRequests);
router.put("/:id/review", authorizeRoles("MANAGER"), reviewLeave);
router.get("/all", authorizeRoles("SUPER_ADMIN", "HR"), getAllLeaveRequests);

module.exports = router;
