const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  assignTask,
  getAllTasks,
  getMyTasks,
  updateTaskStatus,
} = require("../controllers/taskController");

router.use(protect);
router.post("/assign", authorizeRoles("SUPER_ADMIN"), assignTask);
router.get("/", authorizeRoles("SUPER_ADMIN"), getAllTasks);
router.get("/my", authorizeRoles("MANAGER"), getMyTasks);
router.put("/:id/status", authorizeRoles("MANAGER"), updateTaskStatus);

module.exports = router;
