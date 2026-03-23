const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAllRecruitment, createJob, updateJob, deleteJob } = require("../controllers/recruitmentController");

router.use(protect, authorizeRoles("HR", "SUPER_ADMIN"));
router.get("/", getAllRecruitment);
router.post("/", createJob);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

module.exports = router;
