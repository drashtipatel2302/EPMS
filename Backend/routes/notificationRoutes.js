const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getMyNotifications, markRead, markAllRead } = require("../controllers/notificationController");

router.use(protect);
router.get("/", getMyNotifications);
router.put("/read-all", markAllRead);
router.put("/:id/read", markRead);

module.exports = router;
