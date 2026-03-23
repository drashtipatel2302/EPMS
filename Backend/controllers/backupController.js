const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── In-memory store for backup metadata (persists per server session) ──────────
let backupMeta = {
  lastBackup: null,
  backupSizeBytes: 0,
  autoBackup: "Daily at 2:00 AM",
  retention: 30,
};

// ── Helper: Export all collections from MongoDB ───────────────────────────────
async function dumpDatabase() {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const dump = {};

  for (const col of collections) {
    const docs = await db.collection(col.name).find({}).toArray();
    dump[col.name] = docs;
  }

  return dump;
}

// ── Helper: Restore all collections from dump object ─────────────────────────
async function restoreDatabase(dump) {
  const db = mongoose.connection.db;

  for (const [colName, docs] of Object.entries(dump)) {
    if (!Array.isArray(docs) || docs.length === 0) continue;
    const col = db.collection(colName);
    await col.deleteMany({});
    await col.insertMany(docs);
  }
}

// ── GET /api/backup/status ────────────────────────────────────────────────────
const getBackupStatus = async (req, res) => {
  try {
    res.json({
      lastBackup: backupMeta.lastBackup,
      backupSizeBytes: backupMeta.backupSizeBytes,
      backupSizeMB: backupMeta.backupSizeBytes
        ? (backupMeta.backupSizeBytes / (1024 * 1024)).toFixed(1) + " MB"
        : "—",
      autoBackup: backupMeta.autoBackup,
      retention: backupMeta.retention,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/backup/create ───────────────────────────────────────────────────
const createBackup = async (req, res) => {
  try {
    const dump = await dumpDatabase();
    const json = JSON.stringify(dump, null, 2);
    const sizeBytes = Buffer.byteLength(json, "utf8");

    // Persist to a temp file so download works too
    const backupPath = path.join(os.tmpdir(), "epms_latest_backup.json");
    fs.writeFileSync(backupPath, json, "utf8");

    backupMeta.lastBackup = new Date().toISOString();
    backupMeta.backupSizeBytes = sizeBytes;

    res.json({
      message: "Backup created successfully",
      lastBackup: backupMeta.lastBackup,
      backupSizeMB: (sizeBytes / (1024 * 1024)).toFixed(2) + " MB",
    });
  } catch (err) {
    res.status(500).json({ message: "Backup failed: " + err.message });
  }
};

// ── GET /api/backup/download ──────────────────────────────────────────────────
const downloadBackup = async (req, res) => {
  try {
    const backupPath = path.join(os.tmpdir(), "epms_latest_backup.json");

    // If no backup file exists yet, create one on-the-fly
    if (!fs.existsSync(backupPath)) {
      const dump = await dumpDatabase();
      const json = JSON.stringify(dump, null, 2);
      fs.writeFileSync(backupPath, json, "utf8");
      backupMeta.lastBackup = new Date().toISOString();
      backupMeta.backupSizeBytes = Buffer.byteLength(json, "utf8");
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const filename = `epms_backup_${timestamp}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.sendFile(backupPath);
  } catch (err) {
    res.status(500).json({ message: "Download failed: " + err.message });
  }
};

// ── POST /api/backup/restore ──────────────────────────────────────────────────
// Accepts multipart/form-data with field "backup" (JSON file)
// OR raw JSON body with the dump object directly
const restoreBackup = async (req, res) => {
  try {
    let dump;

    // If file uploaded via multer (req.file)
    if (req.file) {
      const content = fs.readFileSync(req.file.path, "utf8");
      dump = JSON.parse(content);
      fs.unlinkSync(req.file.path); // clean up temp upload
    } else if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
      // Raw JSON body (for direct API testing)
      dump = req.body;
    } else {
      return res.status(400).json({ message: "No backup data provided. Upload a JSON backup file." });
    }

    // Basic validation
    if (typeof dump !== "object" || Array.isArray(dump)) {
      return res.status(400).json({ message: "Invalid backup format." });
    }

    await restoreDatabase(dump);

    res.json({ message: "Database restored successfully from backup." });
  } catch (err) {
    res.status(500).json({ message: "Restore failed: " + err.message });
  }
};

// ── PUT /api/backup/settings ──────────────────────────────────────────────────
const updateBackupSettings = async (req, res) => {
  try {
    const { autoBackup, retention } = req.body;
    if (autoBackup !== undefined) backupMeta.autoBackup = autoBackup;
    if (retention !== undefined) backupMeta.retention = Number(retention);
    res.json({ message: "Backup settings updated.", autoBackup: backupMeta.autoBackup, retention: backupMeta.retention });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getBackupStatus, createBackup, downloadBackup, restoreBackup, updateBackupSettings };
