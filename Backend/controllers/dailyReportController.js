const DailyReport = require("../models/DailyReportModel");

// =========================================
// EMPLOYEE: Submit Daily Work Report
// =========================================
exports.submitDailyReport = async (req, res) => {
  try {
    const { date, tasksCompleted, tasksInProgress, blockers, hoursWorked, mood, notes } = req.body;

    if (!tasksCompleted) {
      return res.status(400).json({ message: "tasksCompleted is required" });
    }

    const reportDate = date || new Date().toISOString().split("T")[0];

    // Upsert: if report exists for this date, update it
    const report = await DailyReport.findOneAndUpdate(
      { employee: req.user.id, date: reportDate },
      {
        tasksCompleted,
        tasksInProgress: tasksInProgress || "",
        blockers: blockers || "",
        hoursWorked: hoursWorked || 0,
        mood: mood || "GOOD",
        notes: notes || "",
      },
      { upsert: true, new: true }
    );

    await report.populate("employee", "name employeeId department");
    res.status(201).json({ message: "Daily report submitted successfully", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// EMPLOYEE: Get My Daily Reports
// =========================================
exports.getMyReports = async (req, res) => {
  try {
    const { month, year } = req.query;
    let filter = { employee: req.user.id };

    if (month && year) {
      const start = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      filter.date = { $gte: start, $lte: end };
    }

    const reports = await DailyReport.find(filter).sort({ date: -1 });
    res.json({ reports, total: reports.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// EMPLOYEE: Get Today's Report
// =========================================
exports.getTodayReport = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const report = await DailyReport.findOne({ employee: req.user.id, date: today });
    res.json({ report: report || null, date: today });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// MANAGER/HR/ADMIN: Get Team Daily Reports
// =========================================
exports.getTeamReports = async (req, res) => {
  try {
    const UserModel = require("../models/UserModel");
    const { date, employeeId } = req.query;
    let filter = {};

    if (date) filter.date = date;
    if (employeeId) filter.employee = employeeId;

    // Manager: only their department
    if (req.user.role === "MANAGER") {
      const teamMembers = await UserModel.find({
        department: req.user.department,
        role: "EMPLOYEE",
      }).select("_id");
      const memberIds = teamMembers.map((m) => m._id);
      filter.employee = { $in: memberIds };
    }

    const reports = await DailyReport.find(filter)
      .populate("employee", "name employeeId department designation")
      .sort({ date: -1, createdAt: -1 });

    res.json({ reports, total: reports.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
