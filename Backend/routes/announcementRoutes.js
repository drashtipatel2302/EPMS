const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getMyAnnouncements,
  markAsRead,
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

router.use(protect);

// All roles can read their announcements
router.get("/my", getMyAnnouncements);
router.put("/:id/read", markAsRead);

// HR / Admin / Super_Admin can manage announcements
router.get("/", authorizeRoles("HR", "SUPER_ADMIN", "MANAGER"), getAllAnnouncements);
router.post("/", authorizeRoles("HR", "SUPER_ADMIN"), createAnnouncement);
router.put("/:id", authorizeRoles("HR", "SUPER_ADMIN"), updateAnnouncement);
router.delete("/:id", authorizeRoles("HR", "SUPER_ADMIN"), deleteAnnouncement);

module.exports = router;
