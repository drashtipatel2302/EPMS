const Project  = require("../models/ProjectModel");
const UserModel = require("../models/UserModel");

// ===============================
// MANAGER: Create project
// ===============================
exports.createProject = async (req, res) => {
  try {
    const { name, description, teamMembers, status, progress, startDate, dueDate } = req.body;
    const project = await Project.create({
      name, description,
      manager: req.user.id,
      teamMembers: teamMembers || [],
      status: status || "NOT_STARTED",
      progress: progress || 0,
      startDate, dueDate,
    });
    await project.populate("teamMembers", "name designation");
    res.status(201).json({ message: "Project created", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Get all my projects (with updates)
// ===============================
exports.getManagerProjects = async (req, res) => {
  try {
    const projects = await Project.find({ manager: req.user.id })
      .populate("teamMembers", "name designation department")
      .populate("manager", "name")
      .populate("updates.updatedBy", "name designation")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Update project (name/desc/dates/team/status)
// ===============================
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.manager.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const fields = ["name", "description", "status", "progress", "dueDate", "startDate", "teamMembers"];
    fields.forEach(f => { if (req.body[f] !== undefined) project[f] = req.body[f]; });
    await project.save();
    await project.populate("teamMembers", "name designation");
    res.json({ message: "Project updated", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Delete project
// ===============================
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.manager.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });
    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// EMPLOYEE: Get my assigned projects
// ===============================
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ teamMembers: req.user.id })
      .populate("manager", "name designation")
      .populate("teamMembers", "name designation")
      .populate("updates.updatedBy", "name")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// EMPLOYEE: Post a progress update
// POST /api/projects/:id/update
// Body: { progress, status, note, blockers, hoursLogged }
// ===============================
exports.postProjectUpdate = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Must be a team member
    const isMember = project.teamMembers.some(m => m.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: "You are not assigned to this project" });

    const { progress, status, note, blockers, hoursLogged } = req.body;

    // Update the project's top-level progress & status if provided
    if (progress !== undefined) project.progress = Number(progress);
    if (status)                 project.status   = status;

    // Push a log entry
    project.updates.push({
      updatedBy:   req.user.id,
      progress:    progress !== undefined ? Number(progress) : project.progress,
      status:      status || project.status,
      note:        note    || "",
      blockers:    blockers || "",
      hoursLogged: hoursLogged || 0,
    });

    await project.save();
    await project.populate("updates.updatedBy", "name");
    await project.populate("manager", "name designation");
    await project.populate("teamMembers", "name designation");

    res.json({ message: "Update submitted", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// MANAGER: Get all employees for project assignment (cross-department)
// ===============================
exports.getAssignableEmployees = async (req, res) => {
  try {
    const employees = await UserModel.find({ role: "EMPLOYEE", isActive: true })
      .select("name email department designation")
      .sort({ name: 1 });
    res.json({ employees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
