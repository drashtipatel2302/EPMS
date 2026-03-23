import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const PAGE_META = {
  'admin/dashboard':       { title: 'Dashboard',          desc: 'System overview and key metrics'              },
  'admin/users':           { title: 'Users',               desc: 'Manage all staff accounts and roles'          },
  'admin/departments':     { title: 'Departments',         desc: 'Create and manage departments'                },
  'admin/attendance':      { title: 'Attendance',          desc: 'Track and manage attendance records'          },
  'admin/appraisals':      { title: 'Appraisals',          desc: 'Review and approve appraisal structures'      },
  'admin/performance':     { title: 'Performance',         desc: 'Monitor employee performance data'            },
  'admin/reports':         { title: 'Reports',             desc: 'Company-wide performance and staff reports'   },
  'admin/announcements':   { title: 'Announcements',       desc: 'Post and manage company-wide notices'         },
  'admin/roles':           { title: 'Roles & Permissions', desc: 'Manage role-based access control'             },
  'admin/settings':        { title: 'System Settings',     desc: 'Configure working hours and system criteria'  },
  'admin/kpi':             { title: 'KPI',                 desc: 'Key performance indicators and targets'       },
  'manager/dashboard':     { title: 'Dashboard',           desc: 'Your team overview and quick actions'         },
  'manager/team':          { title: 'My Team',             desc: 'View and manage your team members'            },
  'manager/assign-tasks':  { title: 'Assign Tasks',        desc: 'Create and assign tasks to your team'         },
  'manager/leave-requests':{ title: 'Leave Requests',      desc: 'Review and action pending leave requests'     },
  'manager/evaluate':      { title: 'Evaluate',            desc: 'Evaluate your team members performance'       },
  'manager/reports':       { title: 'Reports',             desc: 'Your team performance and activity reports'   },
  'manager/promotions':    { title: 'Promotions',          desc: 'Submit and track team promotion requests'     },
  'manager/projects':      { title: 'Projects',            desc: 'Track project progress and milestones'        },
  'manager/attendance':    { title: 'Attendance',          desc: 'View your team attendance records'            },
  'employee/dashboard':    { title: 'Dashboard',           desc: 'Your personal overview and activity'          },
  'employee/attendance':   { title: 'Attendance',          desc: 'Your attendance history and status'           },
  'employee/goals':        { title: 'Goals',               desc: 'Track your assigned goals and progress'       },
  'employee/self-review':  { title: 'Self Review',         desc: 'Submit your self-evaluation and feedback'     },
  'employee/projects':     { title: 'My Projects',         desc: 'Projects you are assigned to'                 },
  'hr/dashboard':          { title: 'Dashboard',           desc: 'HR overview and people metrics'               },
  'hr/attendance':         { title: 'Attendance',          desc: 'Manage company-wide attendance records'       },
  'hr/promotions':         { title: 'Promotions',          desc: 'Review and process promotion requests'        },
};

const ROLE_COLORS = { admin: '#4f46e5', manager: '#0ea5e9', employee: '#10b981', hr: '#f43f5e' };
const ROLE_TO_KEY = {
  'SUPER_ADMIN': 'admin', 'ADMIN': 'admin', 'admin': 'admin',
  'MANAGER': 'manager', 'manager': 'manager',
  'EMPLOYEE': 'employee', 'employee': 'employee',
  'HR': 'hr', 'hr': 'hr',
};

export default function Layout({ children }) {
  const { user } = useAuth();
  const roleKey = ROLE_TO_KEY[user?.role] || (user?.role || '').toLowerCase();
  const roleColor = ROLE_COLORS[roleKey] || '#4f46e5';
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: 'var(--bg-base)', '--role-color': roleColor,
    }}>
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Navbar onMenuClick={() => setMobileSidebarOpen(o => !o)} />
        <main
          style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)', padding: 'var(--page-padding, 24px 28px)' }}
          key={typeof window !== 'undefined' ? window.location.pathname : undefined}
          className="epms-page"
        >
          {children}
        </main>
      </div>
    </div>
  );
}