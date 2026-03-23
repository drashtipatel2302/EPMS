import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = { admin: '#4f46e5', manager: '#0ea5e9', employee: '#10b981', hr: '#f43f5e' };
const ROLE_LABELS = { admin: 'Super Admin', manager: 'Manager', employee: 'Employee', hr: 'HR Specialist' };
const ROLE_TO_KEY = {
  'SUPER_ADMIN': 'admin', 'ADMIN': 'admin', 'admin': 'admin',
  'MANAGER': 'manager', 'manager': 'manager',
  'EMPLOYEE': 'employee', 'employee': 'employee',
  'HR': 'hr', 'hr': 'hr',
};
const PROFILE_ROUTES = { admin:'/profile', manager:'/profile', employee:'/profile', hr:'/profile' };
const NOTIF_ICONS = { PROMOTION_APPROVED:'🎉', PROMOTION_REJECTED:'📋', ANNOUNCEMENT:'📢', GENERAL:'🔔' };

const PAGE_META = {
  'admin/dashboard':     { title: 'Dashboard',          desc: 'System overview and key metrics'             },
  'admin/users':         { title: 'Users',               desc: 'Manage all staff accounts and roles'         },
  'admin/departments':   { title: 'Departments',         desc: 'Create and manage departments'               },
  'admin/attendance':    { title: 'Attendance',          desc: 'Track and manage attendance records'         },
  'admin/appraisals':    { title: 'Appraisals',          desc: 'Review and approve appraisal structures'     },
  'admin/performance':   { title: 'Performance',         desc: 'Monitor employee performance data'           },
  'admin/reports':       { title: 'Reports',             desc: 'Company-wide performance and staff reports'  },
  'admin/announcements': { title: 'Announcements',       desc: 'Post and manage company-wide notices'        },
  'admin/roles':         { title: 'Roles & Permissions', desc: 'Manage role-based access control'            },
  'admin/settings':      { title: 'System Settings',     desc: 'Configure working hours and system criteria' },
  'admin/kpi':           { title: 'KPI',                 desc: 'Key performance indicators and targets'      },
  'manager/dashboard':   { title: 'Dashboard',           desc: 'Your team overview and quick actions'        },
  'manager/team':        { title: 'My Team',             desc: 'View and manage your team members'           },
  'manager/assign-tasks':{ title: 'Assign Tasks',        desc: 'Create and assign tasks to your team'        },
  'manager/leave-requests':{ title: 'Leave Requests',    desc: 'Review and action pending leave requests'    },
  'manager/evaluate':    { title: 'Evaluate',            desc: 'Evaluate your team members performance'      },
  'manager/reports':     { title: 'Reports',             desc: 'Your team performance and activity reports'  },
  'manager/promotions':  { title: 'Promotions',          desc: 'Submit and track team promotion requests'    },
  'manager/projects':    { title: 'Projects',            desc: 'Track project progress and milestones'       },
  'manager/attendance':  { title: 'Attendance',          desc: 'View your team attendance records'           },
  'employee/dashboard':  { title: 'Dashboard',           desc: 'Your personal overview and activity'         },
  'employee/attendance': { title: 'Attendance',          desc: 'Your attendance history and status'          },
  'employee/goals':      { title: 'Goals',               desc: 'Track your assigned goals and progress'      },
  'employee/self-review':{ title: 'Self Review',         desc: 'Submit your self-evaluation and feedback'    },
  'employee/projects':   { title: 'My Projects',         desc: 'Projects you are assigned to'                },
  'hr/dashboard':        { title: 'Dashboard',           desc: 'HR overview and people metrics'              },
  'hr/attendance':       { title: 'Attendance',          desc: 'Manage company-wide attendance records'      },
  'hr/promotions':       { title: 'Promotions',          desc: 'Review and process promotion requests'       },
};

function getPageMeta(pathname) {
  const key = pathname.replace(/^\//, '').split('/').slice(0, 2).join('/');
  if (PAGE_META[key]) return PAGE_META[key];
  const parts = pathname.split('/').filter(Boolean);
  const title = parts.length >= 2
    ? parts[parts.length - 1].split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
    : 'Dashboard';
  return { title, desc: '' };
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Hamburger icon
function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

export default function Navbar({ onMenuClick }) {
  const { user, token, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [showNotifs,  setShowNotifs]  = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs,      setNotifs]      = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 768);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const roleKey   = ROLE_TO_KEY[user?.role] || (user?.role || '').toLowerCase();
  const roleColor = ROLE_COLORS[roleKey] || '#4f46e5';
  const roleLabel = ROLE_LABELS[roleKey] || user?.role || '';
  const title     = getPageMeta(location.pathname).title;
  const initials  = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U';
  const dateStr   = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setNotifs(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, [token]);

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30000);
    return () => clearInterval(iv);
  }, [fetchNotifs]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      setNotifs(n => n.map(x => ({ ...x, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const markOneRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      setNotifs(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  useEffect(() => {
    const h = e => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { setShowProfile(false); logout(); navigate('/login'); };
  const goTo = (path) => { setShowProfile(false); navigate(path); };

  return (
    <header style={{
      height: 60, background: '#ffffff', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isMobile ? '0 12px' : '0 24px',
      position: 'sticky', top: 0, zIndex: 9, flexShrink: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>

      {/* Left side: hamburger (mobile) + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10, minWidth: 0, flex: 1 }}>
        {/* Hamburger — mobile only */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <HamburgerIcon />
          </button>
        )}

        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: isMobile ? 18 : 24,
            color: roleColor, lineHeight: 1, letterSpacing: '-0.5px', margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{title}</h1>
          {!isMobile && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {dateStr}</span>
          )}
        </div>
      </div>

      {/* Right side: search (desktop only), notifications, profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8, flexShrink: 0 }}>

        {/* Search — desktop only */}
        {!isMobile && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 12px', color:'var(--text-muted)', fontSize:12, cursor:'text', transition:'border-color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-med)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Search...</span>
            <span style={{ padding:'1px 5px', background:'#e2e8f0', borderRadius:4, fontSize:10 }}>⌘K</span>
          </div>
        )}

        {/* Notifications */}
        <div style={{ position:'relative' }} ref={notifRef}>
          <button onClick={() => { setShowNotifs(s=>!s); setShowProfile(false); }} style={{
            width:36, height:36, borderRadius:8,
            background: showNotifs ? 'var(--bg-elevated)' : 'transparent',
            border: `1px solid ${showNotifs ? 'var(--border-med)' : 'var(--border)'}`,
            color:'var(--text-secondary)',
            display:'flex', alignItems:'center', justifyContent:'center',
            position:'relative', transition:'all 0.15s', cursor:'pointer',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {unreadCount > 0 && (
              <span style={{ position:'absolute', top:-3, right:-3, width:15, height:15, borderRadius:'50%', background:'#f43f5e', color:'#fff', fontSize:8, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid #fff' }}>{unreadCount}</span>
            )}
          </button>

          {showNotifs && (
            <div className="epms-dropdown" style={{
              position:'absolute', top:'calc(100% + 8px)', right: 0,
              width: isMobile ? 'calc(100vw - 24px)' : 320,
              maxWidth: 320,
              background:'#fff', border:'1px solid var(--border-med)',
              borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.12)',
              overflow:'hidden', zIndex:100,
            }}>
              <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:600, fontSize:12, color:'var(--text-primary)' }}>
                  Notifications {unreadCount > 0 && <span style={{ background:'#f43f5e', color:'#fff', borderRadius:99, fontSize:9, fontWeight:700, padding:'1px 6px', marginLeft:4 }}>{unreadCount}</span>}
                </span>
                {unreadCount > 0 && <span style={{ fontSize:10, color:'var(--accent)', fontWeight:600, cursor:'pointer' }} onClick={markAllRead}>Mark all read</span>}
              </div>
              <div style={{ maxHeight:300, overflowY:'auto' }}>
                {notifs.length === 0 ? (
                  <div style={{ padding:'28px 14px', textAlign:'center', color:'var(--text-muted)', fontSize:12 }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>🔔</div>No notifications yet
                  </div>
                ) : notifs.map(n => (
                  <div key={n._id}
                    onClick={() => !n.isRead && markOneRead(n._id)}
                    style={{
                      padding:'11px 14px', borderBottom:'1px solid var(--border)',
                      background: !n.isRead ? `${roleColor}06` : 'transparent',
                      display:'flex', gap:10, alignItems:'flex-start', cursor: !n.isRead ? 'pointer' : 'default',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                    onMouseLeave={e=>e.currentTarget.style.background=!n.isRead?`${roleColor}06`:'transparent'}
                  >
                    <div style={{ fontSize:18, flexShrink:0, marginTop:1 }}>{NOTIF_ICONS[n.type] || '🔔'}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight: !n.isRead ? 700 : 600, color:'var(--text-primary)', lineHeight:1.4 }}>{n.title}</div>
                      <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2, lineHeight:1.4 }}>{n.message}</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4 }}>{timeAgo(n.createdAt)}</div>
                    </div>
                    {!n.isRead && <div style={{ width:7, height:7, borderRadius:'50%', background:roleColor, marginTop:5, flexShrink:0 }}/>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isMobile && <div style={{ width:1, height:20, background:'var(--border)' }}/>}

        {/* Profile */}
        <div style={{ position:'relative' }} ref={profileRef}>
          <button onClick={() => { setShowProfile(s=>!s); setShowNotifs(false); }} style={{
            display:'flex', alignItems:'center', gap: isMobile ? 0 : 9,
            padding: isMobile ? '3px' : '4px 10px 4px 4px',
            background: showProfile ? `${roleColor}0d` : 'transparent',
            border: `1px solid ${showProfile ? roleColor+'30' : 'var(--border)'}`,
            borderRadius:10, cursor:'pointer', transition:'all 0.15s',
          }}>
            <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, background:`linear-gradient(135deg, ${roleColor}, ${roleColor}bb)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', boxShadow:`0 2px 6px ${roleColor}40` }}>{initials}</div>
            {!isMobile && (
              <>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', lineHeight:1.2, whiteSpace:'nowrap', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name || 'User'}</div>
                  <div style={{ fontSize:10, color:roleColor, fontWeight:500, lineHeight:1.2 }}>{roleLabel}</div>
                </div>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color:'var(--text-muted)', transition:'transform 0.2s', transform:showProfile?'rotate(180deg)':'rotate(0deg)', flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
              </>
            )}
          </button>

          {showProfile && (
            <div className="epms-dropdown" style={{
              position:'absolute', top:'calc(100% + 8px)', right:0,
              width: 220,
              background:'#fff', border:'1px solid var(--border-med)',
              borderRadius:14, boxShadow:'0 12px 40px rgba(0,0,0,0.13)',
              overflow:'hidden', zIndex:100,
            }}>
              <div style={{ padding:'14px 16px', background:`linear-gradient(135deg, ${roleColor}12, ${roleColor}06)`, borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:`linear-gradient(135deg, ${roleColor}, ${roleColor}bb)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', boxShadow:`0 3px 8px ${roleColor}40` }}>{initials}</div>
                  <div style={{ overflow:'hidden' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name || 'User'}</div>
                    <div style={{ fontSize:10, color:roleColor, fontWeight:600 }}>{roleLabel}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding:'6px' }}>
                <DropdownItem icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label="My Profile" sub="View & edit your info" color={roleColor} onClick={() => goTo(PROFILE_ROUTES[roleKey] || '/employee/profile')} />
                <DropdownItem icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} label="Change Password" sub="Update your password" color={roleColor} onClick={() => goTo('/change-password')} />
                <div style={{ height:1, background:'var(--border)', margin:'4px 0' }}/>
                <DropdownItem icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>} label="Logout" sub="Sign out of your account" color="#f43f5e" danger onClick={handleLogout} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownItem({ icon, label, sub, color, danger, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 10px', borderRadius:8, background: hovered?(danger?'rgba(244,63,94,0.06)':`${color}0d`):'transparent', border:'none', cursor:'pointer', textAlign:'left', transition:'background 0.13s' }}>
      <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, background:hovered?(danger?'rgba(244,63,94,0.12)':`${color}18`):'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', color:hovered?(danger?'#f43f5e':color):'var(--text-secondary)', transition:'all 0.13s' }}>{icon}</div>
      <div>
        <div style={{ fontSize:12, fontWeight:600, color:danger?(hovered?'#f43f5e':'var(--text-primary)'):'var(--text-primary)', lineHeight:1.2 }}>{label}</div>
        <div style={{ fontSize:10, color:'var(--text-muted)', lineHeight:1.3 }}>{sub}</div>
      </div>
    </button>
  );
}