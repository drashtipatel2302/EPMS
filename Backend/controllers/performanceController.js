const Performance = require("../models/PerformanceModel");
const UserModel = require("../models/UserModel");

// ===============================
// MANAGER: Submit Evaluation
// ===============================
exports.submitEvaluation = async (req, res) => {
  try {
    const {
      employee,
      reviewPeriod,
      reviewMonth,
      taskCompletion,
      teamwork,
      communication,
      punctuality,
      overallRating,
      remarks,
      goalsAchieved,
      totalGoals,
      salaryRaise,
    } = req.body;

    const emp = await UserModel.findById(employee);
    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }
    // Allow MANAGER to evaluate employees in same dept, HR can evaluate anyone
    if (req.user.role === 'MANAGER' && emp.department !== req.user.department) {
      return res.status(403).json({ message: "Employee not in your department" });
    }
    // Validate all ratings are between 1 and 5
    const ratings = { taskCompletion, teamwork, communication, punctuality, overallRating };
    for (const [field, val] of Object.entries(ratings)) {
      const n = Number(val);
      if (isNaN(n) || n < 1 || n > 5) {
        return res.status(400).json({ message: `${field} must be between 1 and 5` });
      }
    }

    const evaluation = await Performance.create({
      employee,
      evaluatedBy: req.user.id,
      reviewPeriod,
      reviewMonth,
      taskCompletion,
      teamwork,
      communication,
      punctuality,
      overallRating,
      remarks,
      goalsAchieved: goalsAchieved !== undefined ? Number(goalsAchieved) : null,
      totalGoals:    totalGoals    !== undefined ? Number(totalGoals)    : null,
      salaryRaise:   salaryRaise   !== undefined ? Number(salaryRaise)   : 0,
    });

    await evaluation.populate("employee", "name designation");
    await evaluation.populate("evaluatedBy", "name");

    res.status(201).json({ message: "Evaluation submitted", evaluation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Get all evaluations for team
// ===============================
exports.getTeamEvaluations = async (req, res) => {
  try {
    const teamMembers = await UserModel.find({
      department: req.user.department,
      role: "EMPLOYEE",
    }).select("_id");

    const memberIds = teamMembers.map((m) => m._id);

    const evaluations = await Performance.find({
      employee: { $in: memberIds },
    })
      .populate("employee", "name designation")
      .populate("evaluatedBy", "name")
      .sort({ createdAt: -1 });

    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// ADMIN: Get ALL evaluations company-wide
// ===============================
exports.getAllPerformance = async (req, res) => {
  try {
    const evaluations = await Performance.find()
      .populate("employee", "name designation department role email")
      .populate("evaluatedBy", "name role")
      .sort({ createdAt: -1 });

    // Build per-employee summary for admin overview
    const empMap = {};
    for (const ev of evaluations) {
      if (!ev.employee) continue;
      const id = ev.employee._id.toString();
      if (!empMap[id]) {
        empMap[id] = {
          employee: ev.employee,
          evaluations: [],
        };
      }
      empMap[id].evaluations.push(ev);
    }

    const summary = Object.values(empMap).map((entry) => {
      const evals = entry.evaluations;
      const avg = (field) =>
        parseFloat(
          (evals.reduce((s, e) => s + (e[field] || 0), 0) / evals.length).toFixed(1)
        );
      return {
        employee: entry.employee,
        evalCount: evals.length,
        avgOverall: avg("overallRating"),
        avgTaskCompletion: avg("taskCompletion"),
        avgTeamwork: avg("teamwork"),
        avgCommunication: avg("communication"),
        avgPunctuality: avg("punctuality"),
        lastEval: evals[0],
      };
    });

    res.json({ evaluations, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Get evaluations for a specific employee
// ===============================
exports.getEmployeeEvaluations = async (req, res) => {
  try {
    const evaluations = await Performance.find({ employee: req.params.id })
      .populate("employee", "name designation")
      .populate("evaluatedBy", "name")
      .sort({ createdAt: -1 });

    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Get team performance report summary
// ===============================
exports.getTeamReport = async (req, res) => {
  try {
    const teamMembers = await UserModel.find({
      department: req.user.department,
      role: "EMPLOYEE",
    }).select("_id name designation");

    const memberIds = teamMembers.map((m) => m._id);

    const evaluations = await Performance.find({
      employee: { $in: memberIds },
    });

    // Compute per-employee summary
    const summary = teamMembers.map((emp) => {
      const empEvals = evaluations.filter(
        (e) => e.employee.toString() === emp._id.toString()
      );

      if (empEvals.length === 0) {
        return { employee: emp, avgRating: null, evalCount: 0 };
      }

      const avgRating =
        empEvals.reduce((sum, e) => sum + e.overallRating, 0) / empEvals.length;

      return {
        employee: emp,
        avgRating: parseFloat(avgRating.toFixed(1)),
        evalCount: empEvals.length,
        lastEval: empEvals[0],
      };
    });

    const teamAvg =
      summary.filter((s) => s.avgRating).length > 0
        ? parseFloat(
            (
              summary
                .filter((s) => s.avgRating)
                .reduce((sum, s) => sum + s.avgRating, 0) /
              summary.filter((s) => s.avgRating).length
            ).toFixed(1)
          )
        : 0;

    res.json({ teamAvg, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
