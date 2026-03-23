import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Auth
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ChangePassword from './pages/auth/ChangePassword';
import ProfilePage from './pages/shared/ProfilePage';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Departments from './pages/admin/Departments';
import KPI from './pages/admin/KPI';
import Reports from './pages/admin/Reports';
import Announcements from './pages/admin/Announcements';
import SystemSettings from './pages/admin/SystemSettings';
import RolesPermissions from './pages/admin/RolesPermissions';
import AssignTasks from './pages/admin/AssignTasks';
import Appraisals from './pages/admin/Appraisals';
import EmployeePerformance from './pages/admin/EmployeePerformance';

// Manager
import ManagerDashboard from './pages/manager/ManagerDashboard';

// Employee
import EmployeeDashboard from './pages/employee/Dashboard';
import MyTasksPage from './pages/employee/MyTasks';
import ApplyLeavePage from './pages/employee/ApplyLeave';
import MySalarySlipsPage from './pages/employee/MySalarySlips';
import MyPerformancePage from './pages/employee/MyPerformance';
import { Goals, SelfReview, History } from './pages/employee/Goals_SelfReview_History';
import { ViewAnnouncements, DailyWorkReport, MyGrievances, MyTraining, MyProfile } from './pages/employee/Employee_Extended';
import MyProjects from './pages/employee/MyProjects';

// HR
import { HRDashboard, Appraisal, Promotions } from './pages/hr/HR_Pages';
import { Attendance, SalaryManagement, LeavePolicies, Grievances, Training, Recruitment, PerformanceEvaluation } from './pages/hr/HR_Extended';
import HRAttendancePage from './pages/hr/AttendanceManagement';

// Attendance pages
import AttendancePage from './pages/employee/AttendancePage';
import AttendanceManagement from './pages/attendance/AttendanceManagement';

// Guard
import ProtectedRoute from './components/ProtectedRoute';

const ROLE_TO_ROUTE = {
  'SUPER_ADMIN': 'admin', 'ADMIN': 'admin', 'admin': 'admin',
  'MANAGER': 'manager',   'manager': 'manager',
  'EMPLOYEE': 'employee', 'employee': 'employee',
  'HR': 'hr',             'hr': 'hr',
};

function RootRedirect() {
  const { user, token, ready } = useAuth();
  if (!ready) return null;
  if (!token || !user) return <Navigate to="/login" replace />;
  const routePrefix = ROLE_TO_ROUTE[user.role] || (user.role || '').toLowerCase();
  return <Navigate to={`/${routePrefix}/dashboard`} replace />;
}

const Guard = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
);

export default function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ProtectedRoute allowedRoles={['admin','manager','employee','hr']}><ChangePassword /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin','manager','employee','hr']}><ProfilePage /></ProtectedRoute>} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin */}
          <Route path="/admin/dashboard"     element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />
          <Route path="/admin/users"         element={<Guard roles={['admin']}><Users /></Guard>} />
          <Route path="/admin/departments"   element={<Guard roles={['admin']}><Departments /></Guard>} />
          <Route path="/admin/kpi"           element={<Guard roles={['admin']}><KPI /></Guard>} />
          <Route path="/admin/reports"       element={<Guard roles={['admin']}><Reports /></Guard>} />
          <Route path="/admin/announcements" element={<Guard roles={['admin']}><Announcements /></Guard>} />
          <Route path="/admin/settings"      element={<Guard roles={['admin']}><SystemSettings /></Guard>} />
          <Route path="/admin/roles"         element={<Guard roles={['admin']}><RolesPermissions /></Guard>} />
          <Route path="/admin/assign-tasks"  element={<Guard roles={['admin']}><AssignTasks /></Guard>} />
          <Route path="/admin/attendance"     element={<Guard roles={['admin']}><AttendanceManagement /></Guard>} />
          <Route path="/admin/appraisals"    element={<Guard roles={['admin']}><Appraisals /></Guard>} />
          <Route path="/admin/performance"   element={<Guard roles={['admin']}><EmployeePerformance /></Guard>} />

          {/* Manager — self-contained dashboard handles all sub-navigation internally */}
          <Route path="/manager/dashboard"      element={<Guard roles={['manager', 'MANAGER']}><ManagerDashboard /></Guard>} />
          <Route path="/manager/attendance"     element={<Guard roles={['manager', 'MANAGER']}><AttendanceManagement /></Guard>} />
          <Route path="/manager/*"              element={<Guard roles={['manager', 'MANAGER']}><ManagerDashboard /></Guard>} />

          {/* Employee */}
          <Route path="/employee/dashboard"     element={<Guard roles={['employee']}><EmployeeDashboard /></Guard>} />
          <Route path="/employee/tasks"         element={<Guard roles={['employee']}><MyTasksPage /></Guard>} />
          <Route path="/employee/goals"         element={<Guard roles={['employee']}><Goals /></Guard>} />
          <Route path="/employee/self-review"   element={<Guard roles={['employee']}><SelfReview /></Guard>} />
          <Route path="/employee/history"       element={<Guard roles={['employee']}><History /></Guard>} />
          <Route path="/employee/leave"         element={<Guard roles={['employee']}><ApplyLeavePage /></Guard>} />
          <Route path="/employee/attendance"    element={<Guard roles={['employee']}><AttendancePage /></Guard>} />
          <Route path="/employee/salary"        element={<Guard roles={['employee']}><MySalarySlipsPage /></Guard>} />
          <Route path="/employee/performance"   element={<Guard roles={['employee']}><MyPerformancePage /></Guard>} />
          <Route path="/employee/announcements" element={<Guard roles={['employee']}><ViewAnnouncements /></Guard>} />
          <Route path="/employee/work-report"   element={<Guard roles={['employee']}><DailyWorkReport /></Guard>} />
          <Route path="/employee/grievances"    element={<Guard roles={['employee']}><MyGrievances /></Guard>} />
          <Route path="/employee/training"      element={<Guard roles={['employee']}><MyTraining /></Guard>} />
          <Route path="/employee/profile"       element={<Guard roles={['employee']}><MyProfile /></Guard>} />
          <Route path="/employee/projects"      element={<Guard roles={['employee']}><MyProjects /></Guard>} />

          {/* HR */}
          <Route path="/hr/dashboard"      element={<Guard roles={['hr']}><HRDashboard /></Guard>} />
          <Route path="/hr/appraisal"      element={<Guard roles={['hr']}><Appraisal /></Guard>} />
          <Route path="/hr/promotions"     element={<Guard roles={['hr']}><Promotions /></Guard>} />
          <Route path="/hr/attendance"     element={<Guard roles={['hr']}><AttendanceManagement /></Guard>} />
          <Route path="/hr/salary"         element={<Guard roles={['hr']}><SalaryManagement /></Guard>} />
          <Route path="/hr/leave-policies" element={<Guard roles={['hr']}><LeavePolicies /></Guard>} />
          <Route path="/hr/grievances"     element={<Guard roles={['hr']}><Grievances /></Guard>} />
          <Route path="/hr/training"       element={<Guard roles={['hr']}><Training /></Guard>} />
          <Route path="/hr/recruitment"    element={<Guard roles={['hr']}><Recruitment /></Guard>} />
          <Route path="/hr/performance"      element={<Guard roles={['hr']}><PerformanceEvaluation /></Guard>} />
          <Route path="/hr/announcements"   element={<Guard roles={['hr']}><Announcements /></Guard>} />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
    </AuthProvider>
  );
}
