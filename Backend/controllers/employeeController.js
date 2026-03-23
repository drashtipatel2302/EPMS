const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");

// =========================================
// EMPLOYEE: Get Own Profile
// =========================================
exports.getMyProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// EMPLOYEE: Update Own Profile
// =========================================
exports.updateMyProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Employees can only update limited fields
    const { name, phone, address, emergencyContact, profilePicture, bio } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const updated = await UserModel.findById(req.user.id).select("-password");
    res.json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =========================================
// EMPLOYEE: Get My Salary Slips
// =========================================
exports.getMySalarySlips = async (req, res) => {
  try {
    const SalaryModel = require("../models/SalaryModel");
    const salaries = await SalaryModel.find({
      employee: req.user.id,
      status: { $in: ["APPROVED", "PAID"] },
    })
      .populate("approvedBy", "name")
      .sort({ month: -1 });

    res.json({ salaries, total: salaries.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// EMPLOYEE: Get My Performance Ratings
// =========================================
exports.getMyPerformance = async (req, res) => {
  try {
    const Performance = require("../models/PerformanceModel");
    const evaluations = await Performance.find({ employee: req.user.id })
      .populate("evaluatedBy", "name designation")
      .sort({ createdAt: -1 });

    // Calculate averages
    let avgOverall = 0,
      avgTask = 0,
      avgTeamwork = 0,
      avgComm = 0,
      avgPunctuality = 0;

    if (evaluations.length > 0) {
      avgOverall = (
        evaluations.reduce((s, e) => s + e.overallRating, 0) / evaluations.length
      ).toFixed(1);
      avgTask = (
        evaluations.reduce((s, e) => s + e.taskCompletion, 0) / evaluations.length
      ).toFixed(1);
      avgTeamwork = (
        evaluations.reduce((s, e) => s + e.teamwork, 0) / evaluations.length
      ).toFixed(1);
      avgComm = (
        evaluations.reduce((s, e) => s + e.communication, 0) / evaluations.length
      ).toFixed(1);
      avgPunctuality = (
        evaluations.reduce((s, e) => s + e.punctuality, 0) / evaluations.length
      ).toFixed(1);
    }

    res.json({
      reviews: evaluations,
      evaluations,
      total: evaluations.length,
      averages: {
        overallRating: parseFloat(avgOverall),
        taskCompletion: parseFloat(avgTask),
        teamwork: parseFloat(avgTeamwork),
        communication: parseFloat(avgComm),
        punctuality: parseFloat(avgPunctuality),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// EMPLOYEE: Get My Assigned Tasks (from ManagerTask)
// =========================================
exports.getMyTasks = async (req, res) => {
  try {
    const ManagerTask = require("../models/ManagerTaskModel");
    const { status } = req.query;
    let filter = { assignedTo: req.user.id };
    if (status) filter.status = status.toUpperCase();

    const tasks = await ManagerTask.find(filter)
      .populate("assignedBy", "name designation")
      .populate("notes.author", "name role")
      .sort({ createdAt: -1 });

    const total = tasks.length;
    const pending    = tasks.filter((t) => t.status === "PENDING").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const completed  = tasks.filter((t) => t.status === "COMPLETED").length;

    res.json({ tasks, total, summary: { pending, inProgress, completed } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// EMPLOYEE: Update Task (status + note + hours)
// =========================================
exports.updateMyTaskStatus = async (req, res) => {
  try {
    const ManagerTask = require("../models/ManagerTaskModel");
    const task = await ManagerTask.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.assignedTo.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized to update this task" });

    const { status, note, actualHours, completionNote } = req.body;

    const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];
    if (status && !validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    if (status)          task.status = status;
    if (actualHours)     task.actualHours = Number(actualHours);
    if (completionNote)  task.completionNote = completionNote;

    // Append to notes thread
    if (note && note.trim()) {
      task.notes.push({ author: req.user.id, role: "EMPLOYEE", message: note.trim() });
    }

    await task.save();
    await task.populate("assignedBy", "name designation");
    await task.populate("notes.author", "name role");

    res.json({ message: "Task updated", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// EMPLOYEE: Dashboard Summary
// =========================================
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const ManagerTask = require("../models/ManagerTaskModel");
    const LeaveRequest = require("../models/LeaveRequestModel");
    const AttendanceModel = require("../models/AttendanceModel");
    const Performance = require("../models/PerformanceModel");

    // Tasks summary
    const tasks = await ManagerTask.find({ assignedTo: req.user.id });
    const taskSummary = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "PENDING").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      completed: tasks.filter((t) => t.status === "COMPLETED").length,
    };

    // Leave summary
    const leaves = await LeaveRequest.find({ employee: req.user.id });
    const leaveSummary = {
      total: leaves.length,
      pending: leaves.filter((l) => l.status === "PENDING").length,
      approved: leaves.filter((l) => l.status === "APPROVED").length,
      rejected: leaves.filter((l) => l.status === "REJECTED").length,
    };

    // Attendance - current month
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const start = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

    const attendanceRecords = await AttendanceModel.find({
      employee: req.user.id,
      date: { $gte: start, $lte: end },
    });

    const attendanceSummary = {
      present: attendanceRecords.filter((r) => r.status === "PRESENT").length,
      late: attendanceRecords.filter((r) => r.status === "LATE").length,
      absent: attendanceRecords.filter((r) => r.status === "ABSENT").length,
      halfDay: attendanceRecords.filter((r) => r.status === "HALF_DAY").length,
      totalHours: Math.round(
        attendanceRecords.reduce((s, r) => s + (r.hoursWorked || 0), 0) * 100
      ) / 100,
    };

    // Latest performance
    const latestPerformance = await Performance.findOne({ employee: req.user.id })
      .populate("evaluatedBy", "name")
      .sort({ createdAt: -1 });

    // Today's attendance
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = await AttendanceModel.findOne({
      employee: req.user.id,
      date: today,
    });

    // Recent tasks (last 5)
    const recentTasks = await ManagerTask.find({ assignedTo: req.user.id })
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      taskSummary,
      leaveSummary,
      attendanceSummary,
      latestPerformance,
      todayAttendance,
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
