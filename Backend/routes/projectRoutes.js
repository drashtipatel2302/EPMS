const express = require("express");
const router  = express.Router();
const protect        = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  createProject, getManagerProjects, updateProject, deleteProject,
  getMyProjects, postProjectUpdate, getAssignableEmployees,
} = require("../controllers/projectController");

router.use(protect);

// Employee
router.get("/my",              authorizeRoles("EMPLOYEE"),          getMyProjects);
router.post("/:id/update",     authorizeRoles("EMPLOYEE"),          postProjectUpdate);

// Manager
router.get("/assignable-employees", authorizeRoles("MANAGER"),      getAssignableEmployees);
router.post("/",               authorizeRoles("MANAGER"),           createProject);
router.get("/",                authorizeRoles("MANAGER"),           getManagerProjects);
router.put("/:id",             authorizeRoles("MANAGER"),           updateProject);
router.delete("/:id",          authorizeRoles("MANAGER"),           deleteProject);

module.exports = router;
