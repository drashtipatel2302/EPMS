const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  assignTaskToEmployee,
  getManagerTasks,
  updateManagerTask,
  deleteManagerTask,
  getMyAssignedTasks,
  updateMyTaskStatus,
} = require("../controllers/managerTaskController");

router.use(protect);
router.post("/assign", authorizeRoles("MANAGER"), assignTaskToEmployee);
router.get("/my-assigned", authorizeRoles("MANAGER"), getManagerTasks);
router.put("/:id", authorizeRoles("MANAGER"), updateManagerTask);
router.delete("/:id", authorizeRoles("MANAGER"), deleteManagerTask);
router.get("/assigned-to-me", authorizeRoles("EMPLOYEE"), getMyAssignedTasks);
router.put("/:id/status", authorizeRoles("EMPLOYEE"), updateMyTaskStatus);

module.exports = router;
