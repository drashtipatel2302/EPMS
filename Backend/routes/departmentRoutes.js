// departmentRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

router.use(protect);
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.post("/", authorizeRoles("SUPER_ADMIN", "HR"), createDepartment);
router.put("/:id", authorizeRoles("SUPER_ADMIN", "HR"), updateDepartment);
router.delete("/:id", authorizeRoles("SUPER_ADMIN"), deleteDepartment);

module.exports = router;
