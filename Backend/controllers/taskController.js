const TaskModel = require("../models/TaskModel");
const UserModel = require("../models/UserModel");

// ===============================
// SUPER ADMIN ASSIGNS TASK
// ===============================
exports.assignTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    // Check if assigned user exists
    const manager = await UserModel.findById(assignedTo);

    if (!manager || manager.role !== "MANAGER") {
      return res.status(400).json({
        message: "Task can only be assigned to MANAGER",
      });
    }

    const task = await TaskModel.create({
      title,
      description,
      assignedBy: req.user.id,
      assignedTo,
      priority,
      dueDate,
    });

    res.status(201).json({
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// SUPER ADMIN — GET ALL TASKS
// (from task table, all tasks assigned by this admin)
// ===============================
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.find({ assignedBy: req.user.id })
      .populate("assignedTo", "name email role department designation")
      .populate("assignedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER VIEW THEIR TASKS
// ===============================
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.find({ assignedTo: req.user.id })
      .populate("assignedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// MANAGER UPDATE TASK STATUS
// ===============================
exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can update only your tasks",
      });
    }

    task.status = req.body.status || task.status;

    await task.save();

    res.json({
      message: "Task status updated",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};