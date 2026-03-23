const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getBackupStatus,
  createBackup,
  downloadBackup,
  restoreBackup,
  updateBackupSettings,
} = require("../controllers/backupController");

// Multer: store uploaded backup file in system temp dir
const upload = multer({ dest: os.tmpdir() });

// All routes require login + superadmin role
router.use(protect);
router.use(authorizeRoles("superadmin", "admin"));

router.get("/status",         getBackupStatus);
router.post("/create",        createBackup);
router.get("/download",       downloadBackup);
router.post("/restore",       upload.single("backup"), restoreBackup);
router.put("/settings",       updateBackupSettings);

module.exports = router;
