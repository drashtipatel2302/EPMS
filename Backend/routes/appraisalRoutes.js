const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAllAppraisals, createAppraisal, updateAppraisal, deleteAppraisal, getHRDashboard } = require("../controllers/appraisalController");

router.use(protect, authorizeRoles("HR", "SUPER_ADMIN"));
router.get("/", getAllAppraisals);
router.get("/dashboard", getHRDashboard);
router.post("/", createAppraisal);
router.put("/:id", updateAppraisal);
router.delete("/:id", deleteAppraisal);

module.exports = router;
