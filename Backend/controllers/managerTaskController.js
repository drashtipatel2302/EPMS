const ManagerTask = require("../models/ManagerTaskModel");
const UserModel = require("../models/UserModel");

// ===============================
// MANAGER: Assign task to employee
// ===============================
exports.assignTaskToEmployee = async (req, res) => {
  try {
    const { title, description, assignedTo, project, priority, dueDate, estimatedHours } = req.body;

    const emp = await UserModel.findById(assignedTo);
    if (!emp || emp.department !== req.user.department) {
      return res.status(403).json({ message: "Employee not in your department" });
    }

    const task = await ManagerTask.create({
      title,
      description,
      assignedBy: req.user.id,
      assignedTo,
      project,
      priority,
      dueDate,
      estimatedHours,
    });

    await task.populate("assignedTo", "name designation");

    res.status(201).json({ message: "Task assigned", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Get all tasks assigned by this manager
// ===============================
exports.getManagerTasks = async (req, res) => {
  try {
    const tasks = await ManagerTask.find({ assignedBy: req.user.id })
      .populate("assignedTo", "name designation employeeId")
      .populate("notes.author", "name role")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Update task status or details
// ===============================
exports.updateManagerTask = async (req, res) => {
  try {
    const task = await ManagerTask.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const fields = ["title", "description", "priority", "status", "dueDate", "project", "estimatedHours"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f];
    });

    await task.save();

    res.json({ message: "Task updated", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Delete task
// ===============================
exports.deleteManagerTask = async (req, res) => {
  try {
    const task = await ManagerTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.assignedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// EMPLOYEE: Get tasks assigned to me
// ===============================
exports.getMyAssignedTasks = async (req, res) => {
  try {
    const tasks = await ManagerTask.find({ assignedTo: req.user.id })
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// EMPLOYEE: Update status of assigned task
// ===============================
exports.updateMyTaskStatus = async (req, res) => {
  try {
    const task = await ManagerTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.assignedTo.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    task.status = req.body.status || task.status;
    await task.save();
    res.json({ message: "Status updated", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
