require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send("EPMS API Running..."));

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));

// ─── Employee Self-Service ────────────────────────────────────────────────────
app.use("/api/employee", require("./routes/employeeRoutes"));

// ─── Departments ──────────────────────────────────────────────────────────────
app.use("/api/departments", require("./routes/departmentRoutes"));

// ─── Tasks ────────────────────────────────────────────────────────────────────
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/manager-tasks", require("./routes/managerTaskRoutes"));

// ─── Attendance ───────────────────────────────────────────────────────────────
app.use("/api/attendance", require("./routes/attendanceRoutes"));

// ─── Leave ────────────────────────────────────────────────────────────────────
app.use("/api/leave", require("./routes/leaveRoutes"));

// ─── Performance ──────────────────────────────────────────────────────────────
app.use("/api/performance", require("./routes/performanceRoutes"));

// ─── Projects ─────────────────────────────────────────────────────────────────
app.use("/api/projects", require("./routes/projectRoutes"));

// ─── Promotions ───────────────────────────────────────────────────────────────
app.use("/api/promotions", require("./routes/promotionRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// ─── Daily Reports ────────────────────────────────────────────────────────────
app.use("/api/daily-reports", require("./routes/dailyReportRoutes"));

// ─── Announcements ────────────────────────────────────────────────────────────
app.use("/api/announcements", require("./routes/announcementRoutes"));

// ─── HR-specific routes ───────────────────────────────────────────────────────
app.use("/api/hr/salary",         require("./routes/salaryRoutes"));
app.use("/api/hr/grievances",     require("./routes/grievanceRoutes"));
app.use("/api/hr/training",       require("./routes/trainingRoutes"));
app.use("/api/hr/recruitment",    require("./routes/recruitmentRoutes"));
app.use("/api/hr/recruitment/:jobId/applicants", require("./routes/applicantRoutes"));
app.use("/api/hr/leave-policies", require("./routes/leavePolicyRoutes"));
app.use("/api/hr/appraisals",     require("./routes/appraisalRoutes"));
app.use("/api/self-review",         require("./routes/selfReviewRoutes"));

// ─── Employee-accessible aliases ─────────────────────────────────────────────
app.use("/api/grievances", require("./routes/grievanceRoutes"));
app.use("/api/training",   require("./routes/trainingRoutes"));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ EPMS Server running on port ${PORT}`));
