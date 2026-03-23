const express = require("express");
const router  = express.Router({ mergeParams: true }); // mergeParams to get :jobId
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getApplicants,
  addApplicant,
  updateApplicant,
  deleteApplicant,
} = require("../controllers/applicantController");

router.use(protect, authorizeRoles("HR", "SUPER_ADMIN"));

router.get("/",    getApplicants);
router.post("/",   addApplicant);
router.put("/:applicantId",    updateApplicant);
router.delete("/:applicantId", deleteApplicant);

module.exports = router;
