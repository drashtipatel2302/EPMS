const DepartmentModel = require("../models/DepartmentModel");


// ===============================
// CREATE DEPARTMENT
// ===============================
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, manager } = req.body;

    const existing = await DepartmentModel.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const department = await DepartmentModel.create({
      name,
      description,
      manager,
    });

    res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// GET ALL DEPARTMENTS
// ===============================
exports.getDepartments = async (req, res) => {
  try {
    const departments = await DepartmentModel.find()
      .populate("manager", "name email")
      .sort({ createdAt: -1 });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// GET SINGLE DEPARTMENT
// ===============================
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await DepartmentModel.findById(req.params.id)
      .populate("manager", "name email");

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// UPDATE DEPARTMENT
// ===============================
exports.updateDepartment = async (req, res) => {
  try {
    const department = await DepartmentModel.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    department.name = req.body.name || department.name;
    department.description = req.body.description || department.description;
    department.manager = req.body.manager || department.manager;
    department.isActive =
      req.body.isActive !== undefined
        ? req.body.isActive
        : department.isActive;

    await department.save();

    res.json({
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// DELETE DEPARTMENT
// ===============================
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await DepartmentModel.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    await department.deleteOne();

    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};