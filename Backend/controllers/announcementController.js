const Announcement = require("../models/AnnouncementModel");
const Notification  = require("../models/NotificationModel");
const UserModel     = require("../models/UserModel");

// =========================================
// EMPLOYEE: Get Active Announcements for me
// =========================================
exports.getMyAnnouncements = async (req, res) => {
  try {
    const now = new Date();

    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }],
      $or: [
        { targetRoles: "ALL" },
        { targetRoles: req.user.role },
      ],
    })
      .populate("postedBy", "name role")
      .sort({ createdAt: -1 });

    // Filter by department if targetDepartments is set
    const filtered = announcements.filter((a) => {
      if (!a.targetDepartments || a.targetDepartments.length === 0) return true;
      return a.targetDepartments.includes(req.user.department);
    });

    // Mark which ones are read by this user
    const result = filtered.map((ann) => ({
      ...ann.toObject(),
      isRead: ann.readBy.includes(req.user.id),
    }));

    res.json({ announcements: result, total: result.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// EMPLOYEE: Mark Announcement as Read
// =========================================
exports.markAsRead = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });

    if (!ann.readBy.includes(req.user.id)) {
      ann.readBy.push(req.user.id);
      await ann.save();
    }

    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// HR/ADMIN: Create Announcement
// =========================================
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, priority, targetRoles, targetDepartments, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "title and content are required" });
    }

    const ann = await Announcement.create({
      title,
      content,
      category: category || "GENERAL",
      priority: priority || "MEDIUM",
      targetRoles: targetRoles || ["ALL"],
      targetDepartments: targetDepartments || [],
      expiresAt: expiresAt || null,
      postedBy: req.user.id,
    });

    await ann.populate("postedBy", "name role");

    // ── Notify all target users ──────────────────────────────────────────
    try {
      // Build user query based on targetRoles
      const roleFilter = ann.targetRoles.includes("ALL")
        ? {}
        : { role: { $in: ann.targetRoles } };

      // Also filter by department if specified
      const deptFilter = ann.targetDepartments && ann.targetDepartments.length > 0
        ? { department: { $in: ann.targetDepartments } }
        : {};

      const users = await UserModel.find({
        ...roleFilter,
        ...deptFilter,
        isActive: true,
        _id: { $ne: req.user.id }, // don't notify the poster
      }).select("_id");

      if (users.length > 0) {
        const priorityEmoji = ann.priority === "HIGH" ? "🔴" : ann.priority === "MEDIUM" ? "🟡" : "🟢";
        const notifications = users.map(u => ({
          recipient: u._id,
          sender:    req.user.id,
          type:      "ANNOUNCEMENT",
          title:     `${priorityEmoji} New Announcement: ${ann.title}`,
          message:   ann.content.length > 120 ? ann.content.slice(0, 120) + "…" : ann.content,
          meta:      { announcementId: ann._id, category: ann.category, priority: ann.priority },
        }));
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.error("Notification dispatch error:", notifErr.message);
      // Don't fail the whole request if notifications fail
    }
    // ─────────────────────────────────────────────────────────────────────

    res.status(201).json({ message: "Announcement created", announcement: ann });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// HR/ADMIN: Get All Announcements
// =========================================
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("postedBy", "name role")
      .sort({ createdAt: -1 });

    res.json({ announcements, total: announcements.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// HR/ADMIN: Update Announcement
// =========================================
exports.updateAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("postedBy", "name role");

    if (!ann) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement updated", announcement: ann });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// HR/ADMIN: Delete Announcement
// =========================================
exports.deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
