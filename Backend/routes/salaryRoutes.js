// salaryRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAllSalaries, getEmployeeSalaries, createSalary, updateSalary, deleteSalary } = require("../controllers/salaryController");

router.use(protect, authorizeRoles("HR", "SUPER_ADMIN"));
router.get("/", getAllSalaries);
router.get("/employee/:employeeId", getEmployeeSalaries);
router.post("/", createSalary);
router.put("/:id", updateSalary);
router.delete("/:id", deleteSalary);

module.exports = router;
