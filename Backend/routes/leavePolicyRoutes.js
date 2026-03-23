// leavePolicyRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAllPolicies, createPolicy, updatePolicy, deletePolicy } = require("../controllers/leavePolicyController");

router.use(protect);
router.get("/", getAllPolicies); // All roles can view
router.post("/", authorizeRoles("HR", "SUPER_ADMIN"), createPolicy);
router.put("/:id", authorizeRoles("HR", "SUPER_ADMIN"), updatePolicy);
router.delete("/:id", authorizeRoles("HR", "SUPER_ADMIN"), deletePolicy);

module.exports = router;
