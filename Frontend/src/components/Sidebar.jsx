import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ICONS = {
  dashboard:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  users:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  departments: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  kpi:         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  reports:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  announce:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 000-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>,
  settings:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  roles:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  tasks:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  leave:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  attend:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  salary:      <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16 }}>₹</span>,
  appraisal:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  promotions:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>,
  goals:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  reviews:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  history:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg>,
  assign:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><line x1="18" y1="2" x2="22" y2="6"/><path d="m11 11 9.5-9.5"/></svg>,
  team:        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>,
  self:        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  report:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  griev:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  training:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  recruit:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  projects:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  logout:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  changepw:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
};

const NAV_CONFIG = {
  admin: [
    { label: 'Dashboard',     path: '/admin/dashboard',    icon: 'dashboard'   },
    { label: 'Users',         path: '/admin/users',         icon: 'users'       },
    { label: 'Departments',   path: '/admin/departments',   icon: 'departments' },
    { label: 'Attendance',    path: '/admin/attendance',    icon: 'attend'      },
    { label: 'Appraisals',    path: '/admin/appraisals',    icon: 'appraisal'   },
    { label: 'Performance',   path: '/admin/performance',   icon: 'kpi'         },
    { label: 'Reports',       path: '/admin/reports',       icon: 'reports'     },
    { label: 'Announcements', path: '/admin/announcements', icon: 'announce'    },
    { label: 'Roles & Perms', path: '/admin/roles',         icon: 'roles'       },
    { label: 'Settings',      path: '/admin/settings',      icon: 'settings'    },
  ],
  manager: [
    { label: 'Dashboard',      path: '/manager/dashboard',      icon: 'dashboard' },
    { label: 'My Team',        path: '/manager/team',           icon: 'team'      },
    { label: 'Assign Goals',   path: '/manager/assign-goals',   icon: 'assign'    },
    { label: 'Reviews',        path: '/manager/reviews',        icon: 'reviews'   },
    { label: 'Ratings',        path: '/manager/ratings',        icon: 'kpi'       },
    { label: 'Leave Requests', path: '/manager/leave-requests', icon: 'leave'     },
    { label: 'Attendance',     path: '/manager/attendance',     icon: 'attend'    },
    { label: 'Projects',       path: '/manager/projects',       icon: 'projects'  },
  ],
  employee: [
    { label: 'Dashboard',     path: '/employee/dashboard',     icon: 'dashboard' },
    { label: 'My Tasks',      path: '/employee/tasks',         icon: 'tasks'     },
    { label: 'Leave',         path: '/employee/leave',         icon: 'leave'     },
    { label: 'Attendance',    path: '/employee/attendance',    icon: 'attend'    },
    { label: 'Salary Slips',  path: '/employee/salary',        icon: 'salary'    },
    { label: 'Performance',   path: '/employee/performance',   icon: 'appraisal' },
    { label: 'Announcements', path: '/employee/announcements', icon: 'announce'  },
    { label: 'Work Report',   path: '/employee/work-report',   icon: 'report'    },
    { label: 'Grievances',    path: '/employee/grievances',    icon: 'griev'     },
    { label: 'Training',      path: '/employee/training',      icon: 'training'  },
    { label: 'My Profile',    path: '/employee/profile',       icon: 'self'      },
    { label: 'My Goals',      path: '/employee/goals',         icon: 'goals'     },
    { label: 'Self Review',   path: '/employee/self-review',   icon: 'reviews'   },
    { label: 'History',       path: '/employee/history',       icon: 'history'   },
    { label: 'My Projects',   path: '/employee/projects',      icon: 'projects'  },
  ],
  hr: [
    { label: 'Dashboard',      path: '/hr/dashboard',       icon: 'dashboard'  },
    { label: 'Appraisal',      path: '/hr/appraisal',       icon: 'appraisal'  },
    { label: 'Promotions',     path: '/hr/promotions',      icon: 'promotions' },
    { label: 'Attendance',     path: '/hr/attendance',      icon: 'attend'     },
    { label: 'Salary',         path: '/hr/salary',          icon: 'salary'     },
    { label: 'Leave Policies', path: '/hr/leave-policies',  icon: 'leave'      },
    { label: 'Grievances',     path: '/hr/grievances',      icon: 'griev'      },
    { label: 'Training',       path: '/hr/training',        icon: 'training'   },
    { label: 'Recruitment',    path: '/hr/recruitment',     icon: 'recruit'    },
    { label: 'Performance',    path: '/hr/performance',     icon: 'kpi'        },
    { label: 'Announcements',  path: '/hr/announcements',   icon: 'announce'   },
  ],
};

const ROLE_COLORS = { admin: '#4f46e5', manager: '#0ea5e9', employee: '#10b981', hr: '#f43f5e' };
const ROLE_LABELS = { admin: 'Super Admin', manager: 'Manager', employee: 'Employee', hr: 'HR Specialist' };
const ROLE_TO_KEY = {
  'SUPER_ADMIN': 'admin', 'ADMIN': 'admin', 'admin': 'admin',
  'MANAGER': 'manager', 'manager': 'manager',
  'EMPLOYEE': 'employee', 'employee': 'employee',
  'HR': 'hr', 'hr': 'hr',
};

// Custom hook for responsive breakpoint
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  const roleKey   = ROLE_TO_KEY[user?.role] || (user?.role || '').toLowerCase();
  const navItems  = NAV_CONFIG[roleKey] || [];
  const roleColor = ROLE_COLORS[roleKey] || '#4f46e5';
  const roleLabel = ROLE_LABELS[roleKey] || user?.role || '';
  const initials  = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : 'U';

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile && onClose) onClose();
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, mobileOpen]);

  const handleLogout = () => { logout(); navigate('/login'); };

  // On mobile: full-width drawer. On desktop: collapsible sidebar.
  const isCollapsed = isMobile ? false : collapsed;
  const sidebarWidth = isMobile ? 280 : (isCollapsed ? 68 : 256);

  // Mobile: slide in from left as overlay
  const mobileStyle = isMobile ? {
    position: 'fixed',
    top: 0, left: 0,
    transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
    zIndex: 1000,
    height: '100dvh',
  } : {
    position: 'sticky',
    top: 0,
    height: '100vh',
    zIndex: 10,
    transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      <aside style={{
        width: sidebarWidth,
        background: '#ffffff',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, overflow: 'hidden',
        boxShadow: isMobile ? '4px 0 24px rgba(0,0,0,0.15)' : '2px 0 8px rgba(0,0,0,0.04)',
        ...mobileStyle,
      }}>

        {/* Logo Header */}
        <div style={{
          padding: isCollapsed ? '14px 10px' : '18px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          minHeight: 62, position: 'relative',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
            boxShadow: `0 2px 8px ${roleColor}40`,
          }}>IQ</div>

          {!isCollapsed && (
            <div style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.2 }}>PerformIQ</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{roleLabel}</div>
            </div>
          )}

          {/* Desktop collapse toggle */}
          {!isMobile && (
            <button onClick={() => setCollapsed(c => !c)} style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, flexShrink: 0, cursor: 'pointer',
              position: isCollapsed ? 'absolute' : 'relative',
              right: isCollapsed ? 6 : 'auto', top: isCollapsed ? 6 : 'auto',
            }} className="epms-sidebar-toggle">{isCollapsed ? '›' : '‹'}</button>
          )}

          {/* Mobile close button */}
          {isMobile && (
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, cursor: 'pointer', flexShrink: 0,
            }}>✕</button>
          )}
        </div>

        {/* User card */}
        <div style={{
          margin: '12px 10px 6px',
          padding: '10px 12px',
          background: `${roleColor}08`,
          borderRadius: 10, border: `1px solid ${roleColor}18`,
          display: 'flex', alignItems: 'center', gap: 10,
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: `${roleColor}18`, border: `1px solid ${roleColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: roleColor,
          }}>{initials}</div>
          {!isCollapsed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: 10, color: roleColor, fontWeight: 500 }}>{roleLabel}</div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div style={{ padding: '10px 18px 2px', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.8 }}>
            Navigation
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} className="epms-nav-link" style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: isCollapsed ? '9px 0' : '8px 10px',
              borderRadius: 8, marginBottom: 1,
              color: isActive ? roleColor : 'var(--text-secondary)',
              background: isActive ? `${roleColor}10` : 'transparent',
              borderLeft: `2px solid ${isActive ? roleColor : 'transparent'}`,
              fontWeight: isActive ? 600 : 400,
              fontSize: isMobile ? 14 : 12.5,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              textDecoration: 'none', whiteSpace: 'nowrap',
              minHeight: isMobile ? 44 : 'auto', // Touch-friendly tap targets
            })}
              onMouseEnter={e => { if (!e.currentTarget.style.background.includes('10')) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
              onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; } }}
            >
              <span style={{ flexShrink: 0 }}>{ICONS[item.icon]}</span>
              {!isCollapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 9,
            width: '100%', padding: isCollapsed ? '9px 0' : '8px 10px',
            borderRadius: 8, color: roleColor, fontSize: isMobile ? 14 : 12.5, fontWeight: 500,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            transition: 'all 0.13s',
            minHeight: isMobile ? 44 : 'auto',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = roleColor; e.currentTarget.style.background = `${roleColor}12`; }}
            onMouseLeave={e => { e.currentTarget.style.color = roleColor; e.currentTarget.style.background = 'transparent'; }}
          >
            {ICONS.logout}
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}