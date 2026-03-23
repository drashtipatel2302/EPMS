const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");
const AttendanceModel = require("../models/AttendanceModel");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const sendWelcomeEmail = require("../utils/sendWelcomeEmail");

// ── DB health check ───────────────────────────────────────────────────────────
const checkDB = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      message:
        "Database not connected. Check your MONGO_URI and password in .env, and whitelist your IP in MongoDB Atlas Network Access.",
    });
    return false;
  }
  return true;
};

// ─── Config ───────────────────────────────────────────────────────────────────
const WORK_START_HOUR   = 9;   // 09:00
const WORK_START_MIN    = 0;
const LATE_THRESHOLD_MIN = 15; // late if login > 09:15
const FULL_DAY_HOURS    = 4;   // >= 4 hrs = PRESENT / LATE
const HALF_DAY_HOURS    = 2;   // 2–4 hrs = HALF_DAY, <2 = HALF_DAY

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];

const getInitialStatus = (loginTime) => {
  const t = new Date(loginTime);
  const mins = t.getHours() * 60 + t.getMinutes();
  const cutoff = WORK_START_HOUR * 60 + WORK_START_MIN + LATE_THRESHOLD_MIN;
  return mins > cutoff ? "LATE" : "PRESENT";
};

const calcHours = (start, end) =>
  Math.round(((new Date(end) - new Date(start)) / 3600000) * 100) / 100;

/**
 * Recompute the final status given total hours worked and whether the
 * employee was originally marked LATE (arrived late).
 *
 * Rules:
 *   totalHours >= FULL_DAY_HOURS  → PRESENT or LATE (keep late flag)
 *   totalHours >= HALF_DAY_HOURS  → HALF_DAY
 *   totalHours  < HALF_DAY_HOURS  → HALF_DAY  (still counts as half)
 */
const computeStatus = (totalHours, wasLate) => {
  if (totalHours >= FULL_DAY_HOURS) return wasLate ? "LATE" : "PRESENT";
  return "HALF_DAY";
};

// ─── markLoginAttendance ──────────────────────────────────────────────────────
/**
 * Called on every login.
 *
 * CASE A — No record today yet → create fresh record.
 * CASE B — Record exists, logoutTime set (employee logged out before) →
 *           user is re-logging in (accidental logout or resumed work).
 *           • Clear logoutTime so the session is "open" again.
 *           • Store the accumulated hours so far in accumulatedHours.
 *           • Keep the earliest loginTime (first login of the day).
 *           • Reset status to PRESENT / LATE based on the original login time.
 * CASE C — Record exists, no logoutTime → already active session, skip.
 */
const markLoginAttendance = async (userId) => {
  try {
    const date = todayStr();
    const now  = new Date();
    const existing = await AttendanceModel.findOne({ employee: userId, date });

    if (!existing) {
      // CASE A — first login today
      const status = getInitialStatus(now);
      await AttendanceModel.create({
        employee: userId,
        date,
        loginTime: now,
        logoutTime: null,
        hoursWorked: 0,
        accumulatedHours: 0,
        status,
        note: "",
      });
    } else if (existing.logoutTime) {
      // CASE B — re-login after accidental / intentional logout
      // Save the hours from the previous session
      const prevHours = calcHours(existing.loginTime, existing.logoutTime);
      const alreadyAccumulated = existing.accumulatedHours || 0;
      const totalSoFar = Math.round((alreadyAccumulated + prevHours) * 100) / 100;

      existing.accumulatedHours = totalSoFar;
      existing.logoutTime       = null;          // open session again
      existing.hoursWorked      = totalSoFar;    // show running total
      // Keep the original loginTime (first login) for late detection,
      // but update it to NOW only if original is missing
      if (!existing.loginTime) existing.loginTime = now;
      // Recompute status based on accumulated hours + late flag
      const wasLate = existing.status === "LATE";
      existing.status = computeStatus(totalSoFar, wasLate);
      existing.note   = (existing.note || "") + ` | Re-login at ${now.toTimeString().slice(0, 5)}`;
      await existing.save();
    }
    // CASE C — already active, do nothing
  } catch (err) {
    console.error("Auto attendance (login) error:", err.message);
  }
};

// ─── markLogoutAttendance ─────────────────────────────────────────────────────
/**
 * Called on every logout.
 * Calculates hours from loginTime → now, adds accumulatedHours,
 * then sets the final status based on total hours worked.
 */
const markLogoutAttendance = async (userId) => {
  try {
    const date   = todayStr();
    const now    = new Date();
    const record = await AttendanceModel.findOne({ employee: userId, date });

    if (!record || !record.loginTime) return;
    if (record.logoutTime) return; // already logged out, skip

    const sessionHours   = calcHours(record.loginTime, now);
    const accumulated    = record.accumulatedHours || 0;
    const totalHours     = Math.round((accumulated + sessionHours) * 100) / 100;
    const wasLate        = record.status === "LATE";

    record.logoutTime  = now;
    record.hoursWorked = totalHours;
    record.status      = computeStatus(totalHours, wasLate);
    await record.save();
  } catch (err) {
    console.error("Auto attendance (logout) error:", err.message);
  }
};

// =========================================
// LOGIN
// =========================================
exports.login = async (req, res) => {
  try {
    if (!checkDB(res)) return;
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Employee not found." });
    if (!user.isActive) return res.status(403).json({ message: "Account is deactivated." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    await markLoginAttendance(user._id);
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        department: user.department,
        designation: user.designation,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// =========================================
// LOGOUT
// =========================================
exports.logout = async (req, res) => {
  try {
    if (!checkDB(res)) return;
    await markLogoutAttendance(req.user.id);
    res.json({ message: "Logged out successfully. Attendance updated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
// ADD EMPLOYEE
// =============================
exports.addEmployee = async (req, res) => {
  try {
    if (!checkDB(res)) return;
    const { name, email, password, employeeId, department, designation, role, joiningDate } = req.body;
    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // Capture plain-text password BEFORE the model hashes it on save
    const plainPassword = password;

    const emp = new UserModel({ name, email, password, employeeId: employeeId || undefined, department, designation, role, joiningDate });
    await emp.save();

    // Send joining-letter welcome email (non-blocking)
    sendWelcomeEmail({
      name,
      email,
      employeeId: emp.employeeId,
      password: plainPassword,
      designation,
      department,
      role,
      joiningDate,
    }).catch((err) =>
      console.error("Welcome email failed (non-fatal):", err.message)
    );

    res.status(201).json({ message: "Employee added successfully. A welcome email with login credentials has been sent.", employee: emp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
// UPDATE EMPLOYEE
// =============================
exports.updateEmployee = async (req, res) => {
  try {
    if (!checkDB(res)) return;
    const emp = await UserModel.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    emp.name        = req.body.name        || emp.name;
    emp.department  = req.body.department  || emp.department;
    emp.designation = req.body.designation || emp.designation;
    emp.role        = req.body.role        || emp.role;
    emp.isActive    = req.body.isActive !== undefined ? req.body.isActive : emp.isActive;
    await emp.save();
    res.json({ message: "Employee updated successfully", employee: emp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
// GET ALL EMPLOYEES
// =============================
exports.getAllEmployees = async (req, res) => {
  try {
    if (!checkDB(res)) return;
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = { name: { $regex: search, $options: "i" } };
    if (req.user.role === "MANAGER") query.department = req.user.department;
    const employees = await UserModel.find(query).select("-password").skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await UserModel.countDocuments(query);
    res.json({ total, page: Number(page), totalPages: Math.ceil(total / limit), employees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
// DELETE EMPLOYEE
// =============================
exports.deleteEmployee = async (req, res) => {
  try {
    if (!checkDB(res)) return;
    if (req.user.id === req.params.id)
      return res.status(400).json({ message: "You cannot delete your own account" });
    const emp = await UserModel.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};