const LeaveRequest = require("../models/LeaveRequestModel");
const UserModel = require("../models/UserModel");

// ===============================
// EMPLOYEE: Apply for Leave
// ===============================
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await LeaveRequest.create({
      employee: req.user.id,
      leaveType,
      fromDate: from,
      toDate: to,
      totalDays,
      reason,
    });

    res.status(201).json({ message: "Leave request submitted", leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Get all leave requests for their team
// ===============================
exports.getTeamLeaveRequests = async (req, res) => {
  try {
    // Get all employees in manager's department
    const teamMembers = await UserModel.find({
      department: req.user.department,
      role: "EMPLOYEE",
    }).select("_id");

    const memberIds = teamMembers.map((m) => m._id);

    const leaves = await LeaveRequest.find({ employee: { $in: memberIds } })
      .populate("employee", "name email designation employeeId")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Approve or Reject Leave
// ===============================
exports.reviewLeave = async (req, res) => {
  try {
    const { status, managerRemarks } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await LeaveRequest.findById(req.params.id).populate(
      "employee",
      "department"
    );

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Check manager owns that department
    if (leave.employee.department !== req.user.department) {
      return res
        .status(403)
        .json({ message: "Not authorized to review this request" });
    }

    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    leave.managerRemarks = managerRemarks || "";

    await leave.save();

    res.json({ message: `Leave ${status.toLowerCase()} successfully`, leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// EMPLOYEE: Get own leave requests
// ===============================
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.user.id })
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// HR/ADMIN: Get ALL leave requests
// ===============================
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { status, leaveType } = req.query;
    let filter = {};
    if (status) filter.status = status.toUpperCase();
    if (leaveType) filter.leaveType = leaveType.toUpperCase();

    const leaves = await LeaveRequest.find(filter)
      .populate("employee", "name email designation employeeId department")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ leaves, total: leaves.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
