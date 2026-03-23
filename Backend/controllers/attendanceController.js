const AttendanceModel = require("../models/AttendanceModel");

// ── Shared config (must match authControllers) ───────────────────────────────
const FULL_DAY_HOURS = 4;
const HALF_DAY_HOURS = 2;

const computeStatus = (totalHours, wasLate) => {
  if (totalHours >= FULL_DAY_HOURS) return wasLate ? "LATE" : "PRESENT";
  return "HALF_DAY";
};

// =========================================
// EMPLOYEE: Get Today's Status
// =========================================
exports.getTodayStatus = async (req, res) => {
  try {
    const date   = new Date().toISOString().split("T")[0];
    const record = await AttendanceModel.findOne({ employee: req.user.id, date });
    res.json({ today: record || null, date });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// EMPLOYEE: Get My Attendance History
// =========================================
exports.getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    let filter = { employee: req.user.id };
    if (month && year) {
      const start   = `${year}-${String(month).padStart(2,"0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const end     = `${year}-${String(month).padStart(2,"0")}-${String(lastDay).padStart(2,"0")}`;
      filter.date   = { $gte: start, $lte: end };
    }
    const records = await AttendanceModel.find(filter).sort({ date: -1 });
    const total      = records.length;
    const present    = records.filter(r => r.status === "PRESENT").length;
    const late       = records.filter(r => r.status === "LATE").length;
    const absent     = records.filter(r => r.status === "ABSENT").length;
    const halfDay    = records.filter(r => r.status === "HALF_DAY").length;
    const totalHours = Math.round(records.reduce((s,r) => s + (r.hoursWorked || 0), 0) * 100) / 100;
    res.json({ records, summary: { total, present, late, absent, halfDay, totalHours } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// HR / MANAGER / ADMIN: Get All Attendance
// =========================================
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, month, year, employeeId, department } = req.query;
    let filter = {};
    if (date) {
      filter.date = date;
    } else if (month && year) {
      const start   = `${year}-${String(month).padStart(2,"0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const end     = `${year}-${String(month).padStart(2,"0")}-${String(lastDay).padStart(2,"0")}`;
      filter.date   = { $gte: start, $lte: end };
    }
    if (employeeId) filter.employee = employeeId;

    let records = await AttendanceModel.find(filter)
      .populate("employee", "name email employeeId department designation role")
      .sort({ date: -1, createdAt: -1 });

    if (department) records = records.filter(r => r.employee?.department === department);
    if (req.user.role === "MANAGER") records = records.filter(r => r.employee?.department === req.user.department);

    res.json({ records, total: records.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// ADMIN / HR: Manually correct a record
// =========================================
exports.manualMark = async (req, res) => {
  try {
    const { employeeId, date, status, loginTime, logoutTime, note } = req.body;
    let hoursWorked = 0;
    if (loginTime && logoutTime) {
      hoursWorked = Math.round(((new Date(logoutTime) - new Date(loginTime)) / 3600000) * 100) / 100;
    }
    const record = await AttendanceModel.findOneAndUpdate(
      { employee: employeeId, date },
      { status, loginTime: loginTime || null, logoutTime: logoutTime || null, hoursWorked, accumulatedHours: 0, note: note || "" },
      { upsert: true, new: true }
    );
    res.json({ message: "Attendance record updated successfully", attendance: record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// ADMIN / HR: Recalculate & fix status
// POST /api/attendance/recalculate/:id
// Useful for fixing records where user re-logged in but status wasn't updated
// =========================================
exports.recalculateStatus = async (req, res) => {
  try {
    const record = await AttendanceModel.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    if (record.loginTime && record.logoutTime) {
      const sessionHours = Math.round(((new Date(record.logoutTime) - new Date(record.loginTime)) / 3600000) * 100) / 100;
      const total        = Math.round(((record.accumulatedHours || 0) + sessionHours) * 100) / 100;
      const wasLate      = record.status === "LATE";
      record.hoursWorked = total;
      record.status      = computeStatus(total, wasLate);
      await record.save();
    }

    res.json({ message: "Status recalculated", attendance: record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// GET attendance config (thresholds)
// =========================================
exports.getConfig = (req, res) => {
  res.json({
    fullDayHours:    FULL_DAY_HOURS,
    halfDayHours:    HALF_DAY_HOURS,
    lateAfterMins:   15,
    workStartTime:   "09:00",
    note: "Employees must work >= 8 hrs for PRESENT/LATE. 4–8 hrs = HALF_DAY. Re-login accumulates hours correctly.",
  });
};
