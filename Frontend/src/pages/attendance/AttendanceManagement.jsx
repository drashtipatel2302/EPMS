import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getAllAttendance, manualMarkAttendance } from '../../services/attendanceApi';
import { fetchEmployees } from '../../services/api';

/* ─── constants ────────────────────────────────────────────── */
const STATUS_META = {
  PRESENT:  { color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7', icon: '✓', label: 'Present' },
  LATE:     { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '⏱', label: 'Late' },
  ABSENT:   { color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3', icon: '✗', label: 'Absent' },
  HALF_DAY: { color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: '½', label: 'Half Day' },
};

const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];
const YEARS  = [2023, 2024, 2025, 2026];

const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN',{ hour:'2-digit', minute:'2-digit', hour12:true }) : null;
const fmtDate = (s) => {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('en-IN',{ day:'2-digit', month:'short', year:'numeric' });
};

/* ─── tiny sub-components ───────────────────────────────────── */
function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.ABSENT;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 20,
      background: m.bg, color: m.color,
      border: `1px solid ${m.border}`,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
    }}>
      <span style={{ fontSize: 9, fontWeight: 900 }}>{m.icon}</span>
      {m.label.toUpperCase()}
    </span>
  );
}

function Avatar({ name }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 10,
      background: `hsl(${hue},55%,90%)`,
      color: `hsl(${hue},55%,35%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 800, flexShrink: 0,
    }}>{initials}</div>
  );
}

/* ─── role colour map ───────────────────────────────────────── */
const ROLE_COLOR_MAP = {
  SUPER_ADMIN: '#4f46e5', ADMIN: '#4f46e5', admin: '#4f46e5',
  MANAGER: '#0ea5e9',     manager: '#0ea5e9',
  EMPLOYEE: '#10b981',    employee: '#10b981',
  HR: '#f43f5e',          hr: '#f43f5e',
};
const ROLE_BG_MAP = {
  SUPER_ADMIN: '#eef2ff', ADMIN: '#eef2ff', admin: '#eef2ff',
  MANAGER: '#e0f2fe',     manager: '#e0f2fe',
  EMPLOYEE: '#f0fdf4',    employee: '#f0fdf4',
  HR: '#fff1f2',          hr: '#fff1f2',
};

/* ─── main component ────────────────────────────────────────── */
function EmpDropdown({ employees, value, onChange, roleColor }) {
  const [query, setQuery]   = React.useState('');
  const [open, setOpen]     = React.useState(false);
  const [rect, setRect]     = React.useState(null);
  const triggerRef          = React.useRef(null);
  const listRef             = React.useRef(null);

  const selected = employees.find(e => e._id === value);
  const filtered = employees.filter(e =>
    !query || e.name.toLowerCase().includes(query.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(query.toLowerCase())
  );

  const openDropdown = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setRect({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX, width: r.width });
    }
    setOpen(true);
  };

  React.useEffect(() => {
    const handler = (ev) => {
      if (triggerRef.current && !triggerRef.current.contains(ev.target) &&
          listRef.current && !listRef.current.contains(ev.target)) {
        setOpen(false); setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id) => { onChange(id); setQuery(''); setOpen(false); };

  const dropdownList = open && rect && ReactDOM.createPortal(
    <div ref={listRef} style={{
      position: 'absolute', top: rect.top, left: rect.left, width: Math.max(rect.width, 240),
      zIndex: 99999, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12,
      boxShadow: '0 12px 32px rgba(0,0,0,0.15)', overflow: 'hidden',
    }}>
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
        <input
          autoFocus
          placeholder="Type to search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '7px 10px',
            borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13,
            outline: 'none', color: '#0f172a',
          }}
          onFocus={e => e.target.style.borderColor = roleColor}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>
      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
        <div onClick={() => handleSelect('')} style={{
          padding: '9px 14px', fontSize: 13, cursor: 'pointer',
          color: !value ? roleColor : '#64748b', background: !value ? `${roleColor}18` : '#fff',
          fontWeight: !value ? 700 : 400, borderBottom: '1px solid #f8fafc',
        }}
          onMouseEnter={e => { if (value) e.currentTarget.style.background = '#f8fafc'; }}
          onMouseLeave={e => { if (value) e.currentTarget.style.background = !value ? '#eef2ff' : '#fff'; }}
        >All Employees</div>
        {filtered.length === 0 && <div style={{ padding: '12px 14px', fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>No results</div>}
        {filtered.map(e => (
          <div key={e._id} onClick={() => handleSelect(e._id)} style={{
            padding: '9px 14px', fontSize: 13, cursor: 'pointer',
            background: value === e._id ? `${roleColor}18` : '#fff',
            color: value === e._id ? roleColor : '#0f172a',
            fontWeight: value === e._id ? 700 : 400,
            borderBottom: '1px solid #f8fafc',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
            onMouseEnter={ev => { if (value !== e._id) ev.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={ev => { if (value !== e._id) ev.currentTarget.style.background = value === e._id ? '#eef2ff' : '#fff'; }}
          >
            <span>{e.name}</span>
            {e.department && <span style={{ fontSize: 11, color: '#94a3b8' }}>{e.department}</span>}
          </div>
        ))}
      </div>
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} style={{ position: 'relative', minWidth: 220, display: 'inline-block' }}>
      <div
        onClick={() => open ? (setOpen(false), setQuery('')) : openDropdown()}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 14px', borderRadius: 10,
          border: `1.5px solid ${open ? roleColor : '#e2e8f0'}`,
          background: '#fff', cursor: 'pointer', userSelect: 'none',
          fontSize: 13, fontWeight: 500, color: selected ? '#0f172a' : '#94a3b8',
          boxShadow: open ? `0 0 0 3px ${roleColor}1a` : 'none',
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 14 }}>🔍</span>
        <span style={{ flex: 1 }}>{selected ? selected.name : 'All Employees'}</span>
        {selected
          ? <span onClick={e => { e.stopPropagation(); handleSelect(''); }} style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1, cursor: 'pointer' }}>×</span>
          : <span style={{ color: '#94a3b8', fontSize: 10 }}>{open ? '▲' : '▼'}</span>
        }
      </div>
      {dropdownList}
    </div>
  );
}

export default function AttendanceManagement() {
  const { user }   = useAuth();
  const roleKey    = (user?.role || '').toUpperCase();
  const isManager  = roleKey === 'MANAGER';
  const roleColor  = ROLE_COLOR_MAP[user?.role] || ROLE_COLOR_MAP[roleKey] || '#4f46e5';
  const roleBg     = ROLE_BG_MAP[user?.role] || ROLE_BG_MAP[roleKey] || '#eef2ff';

  const [records,   setRecords]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [month,     setMonth]     = useState(new Date().getMonth() + 1);
  const [year,      setYear]      = useState(new Date().getFullYear());
  const [filterEmp, setFilterEmp] = useState('');
  const [filterSts, setFilterSts] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [showModal, setShowModal] = useState(false);
  const [editRec,   setEditRec]   = useState(null);
  const [form,      setForm]      = useState({ employeeId:'', date:'', status:'PRESENT', loginTime:'', logoutTime:'', note:'' });
  const [hoveredRow, setHoveredRow] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const empId = filterEmp && !filterEmp.startsWith('__search__') ? filterEmp : undefined;
      const res = await getAllAttendance({ month, year, employeeId: empId });
      setRecords(res.records || []);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [month, year, filterEmp]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    fetchEmployees({ limit: 500 })
      .then(d => {
        let list = d.employees || [];
        if (isManager) list = list.filter(e => e.department === user?.department);
        setEmployees(list);
      })
      .catch(() => {});
  }, [isManager, user?.department]);

  const openAdd = () => {
    setEditRec(null);
    setForm({ employeeId:'', date: new Date().toISOString().split('T')[0], status:'PRESENT', loginTime:'', logoutTime:'', note:'' });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditRec(r);
    const toTime = (d) => d ? new Date(d).toTimeString().slice(0, 5) : '';
    setForm({
      employeeId: r.employee?._id || r.employee,
      date: r.date, status: r.status,
      loginTime: toTime(r.loginTime), logoutTime: toTime(r.logoutTime),
      note: r.note || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.employeeId || !form.date) return showToast('Please select employee and date', 'error');
    try {
      await manualMarkAttendance({
        employeeId: form.employeeId, date: form.date, status: form.status,
        loginTime:  form.loginTime  ? new Date(`${form.date}T${form.loginTime}`)  : null,
        logoutTime: form.logoutTime ? new Date(`${form.date}T${form.logoutTime}`) : null,
        note: form.note,
      });
      showToast(editRec ? 'Record updated successfully' : 'Record added successfully');
      setShowModal(false);
      loadData();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const filtered = records
    .filter(r => !filterSts || r.status === filterSts)
    .filter(r => !filterDate || r.date === filterDate);
  
  // Group by date for pagination
  const uniqueDates = [...new Set(filtered.map(r => r.date).filter(Boolean))].sort((a,b) => b.localeCompare(a));
  const totalPages = Math.ceil(uniqueDates.length / PAGE_SIZE) || 1;
  const pagedDates = uniqueDates.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const displayed = filtered.filter(r => pagedDates.includes(r.date));
  const counts = {
    total:   records.length,
    present: records.filter(r => r.status === 'PRESENT').length,
    late:    records.filter(r => r.status === 'LATE').length,
    absent:  records.filter(r => r.status === 'ABSENT').length,
    halfDay: records.filter(r => r.status === 'HALF_DAY').length,
  };

  const presentPct = counts.total ? Math.round((counts.present / counts.total) * 100) : 0;

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .att-root * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important; box-sizing: border-box; }

        .att-stat-card {
          background: #fff;
          border: 1.5px solid #f1f5f9;
          border-radius: 16px;
          padding: 20px 22px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
          overflow: hidden;
        }
        .att-stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .att-stat-card.active { border-color: currentColor; box-shadow: 0 8px 24px rgba(0,0,0,0.10); }

        .att-table-row { transition: background 0.15s; }
        .att-table-row:hover { background: #f8fafc; }

        .att-select {
          appearance: none;
          padding: 9px 34px 9px 14px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E") no-repeat right 12px center;
          color: #0f172a;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          min-width: 120px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .att-select:focus { border-color: ${roleColor}; box-shadow: 0 0 0 3px ${roleColor}1a; }

        .att-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #0f172a;
          font-size: 13.5px;
          font-weight: 500;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          margin-top: 6px;
          display: block;
        }
        .att-input:focus { border-color: ${roleColor}; box-shadow: 0 0 0 3px ${roleColor}1a; }
        .att-input:disabled { background: #f8fafc; cursor: not-allowed; color: #94a3b8; }

        .att-btn-primary {
          padding: 10px 22px;
          border-radius: 10px;
          background: ${roleColor};
          color: #fff;
          font-size: 13.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.18s;
          letter-spacing: 0.2px;
        }
        .att-btn-primary:hover { opacity: 0.88; box-shadow: 0 4px 14px ${roleColor}55; transform: translateY(-1px); }

        .att-btn-ghost {
          padding: 10px 18px;
          border-radius: 10px;
          background: transparent;
          color: #64748b;
          font-size: 13.5px;
          font-weight: 600;
          border: 1.5px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.18s;
        }
        .att-btn-ghost:hover { border-color: #cbd5e1; background: #f8fafc; }

        .att-edit-btn {
          padding: 6px 14px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          border: 1.5px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .att-edit-btn:hover { background: ${roleBg}; color: ${roleColor}; border-color: ${roleColor}44; }

        @keyframes att-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .att-fade { animation: att-fadeUp 0.4s ease both; }
        .att-fade-1 { animation-delay: 0.05s; }
        .att-fade-2 { animation-delay: 0.10s; }
        .att-fade-3 { animation-delay: 0.15s; }
        .att-fade-4 { animation-delay: 0.20s; }

        @keyframes att-spin {
          to { transform: rotate(360deg); }
        }
        .att-spinner {
          width: 28px; height: 28px;
          border: 3px solid #e2e8f0;
          border-top-color: ${roleColor};
          border-radius: 50%;
          animation: att-spin 0.7s linear infinite;
          margin: 0 auto 12px;
        }

        .att-toast {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          padding: 14px 22px 14px 16px;
          border-radius: 12px;
          font-size: 13.5px; font-weight: 600;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.14);
          animation: att-fadeUp 0.3s ease both;
        }
      `}</style>

      <div className="att-root" style={{ maxWidth: 1280, paddingBottom: 40 }}>

        {/* ── Toast ── */}
        {toast && (
          <div className="att-toast" style={{
            background: toast.type === 'error' ? '#fff1f2' : '#f0fdf4',
            color:       toast.type === 'error' ? '#f43f5e' : '#10b981',
            border:      `1.5px solid ${toast.type === 'error' ? '#fecdd3' : '#6ee7b7'}`,
          }}>
            <span style={{ fontSize: 16 }}>{toast.type === 'error' ? '⚠' : '✓'}</span>
            {toast.msg}
          </div>
        )}

        {/* ── Page header ── */}
        <div className="att-fade" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: `linear-gradient(135deg, ${roleColor}, ${roleColor}bb)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${roleColor}44`,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: roleColor, margin: 0 }}>
                Attendance
              </h1>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, paddingLeft: 48 }}>
              {isManager
                ? <>Manager view · <strong style={{ color: '#f59e0b' }}>{user?.department}</strong> department</>
                : 'Full access · all departments'}
            </p>
          </div>

          <button className="att-btn-primary" onClick={openAdd} style={{ display:'flex', alignItems:'center', gap: 8 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Add / Correct Record
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="att-fade att-fade-1" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label:'Total Records', value: counts.total,   color: roleColor, bg: roleBg, filter:'',         icon:'📋' },
            { label:'Present',       value: counts.present, color:'#10b981', bg:'#f0fdf4', filter:'PRESENT',  icon:'✅' },
            { label:'Late',          value: counts.late,    color:'#f59e0b', bg:'#fffbeb', filter:'LATE',     icon:'⏱' },
            { label:'Absent',        value: counts.absent,  color:'#f43f5e', bg:'#fff1f2', filter:'ABSENT',   icon:'✗' },
            { label:'Half Day',      value: counts.halfDay, color:'#8b5cf6', bg:'#f5f3ff', filter:'HALF_DAY', icon:'½' },
          ].map(({ label, value, color, bg, filter, icon }) => {
            const isActive = filterSts === filter && filter !== '';
            return (
              <div
                key={label}
                className={`att-stat-card${isActive ? ' active' : ''}`}
                style={{ color }}
                onClick={() => setFilterSts(f => f === filter ? '' : filter)}
              >
                <div style={{
                  position:'absolute', top: 0, right: 0, width: 64, height: 64,
                  background: bg, borderRadius: '0 16px 0 64px', opacity: 0.6,
                }} />
                <div style={{ fontSize: 20, marginBottom: 10 }}>{icon}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: isActive ? color : '#0f172a', lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginTop: 5 }}>{label}</div>
                {isActive && (
                  <div style={{ position:'absolute', bottom: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '0 0 16px 16px' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Attendance rate bar ── */}
        <div className="att-fade att-fade-2" style={{
          background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 16,
          padding: '16px 22px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 12, color:'#94a3b8', fontWeight: 600, marginBottom: 2 }}>ATTENDANCE RATE</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: presentPct >= 80 ? '#10b981' : presentPct >= 60 ? '#f59e0b' : '#f43f5e' }}>
              {presentPct}%
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${presentPct}%`,
                background: presentPct >= 80
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : presentPct >= 60
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #f43f5e, #fb7185)',
                transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
              }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
              <span>{counts.present} present of {counts.total} records · {MONTHS[month-1]} {year}</span>
              <span>🤖 Auto-captured on login & logout</span>
            </div>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="att-fade att-fade-2" style={{
          background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 16,
          padding: '14px 20px', marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Filter
          </span>
          <div style={{ width: 1, height: 18, background: '#e2e8f0' }} />

          <input
            type="date"
            className="att-select"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }}
            style={{ minWidth: 140, cursor: 'pointer' }}
            title="Filter by specific date"
          />

          {/* ── Employee searchable dropdown ── */}
          <EmpDropdown
            employees={employees}
            value={filterEmp}
            onChange={id => { setFilterEmp(id); setCurrentPage(1); }}
            roleColor={roleColor}
          />

          {/* ── Status chip buttons (replaces dropdown) ── */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {[{ value: '', label: 'All' }, { value: 'PRESENT', label: 'Present' }, { value: 'LATE', label: 'Late' }, { value: 'ABSENT', label: 'Absent' }, { value: 'HALF_DAY', label: 'Half Day' }].map(({ value, label }) => {
              const meta = STATUS_META[value];
              const isActive = filterSts === value;
              return (
                <button key={value} onClick={() => setFilterSts(value)} style={{
                  padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${isActive ? (meta?.color || roleColor) : '#e2e8f0'}`,
                  background: isActive ? (meta?.bg || roleBg) : '#fff',
                  color: isActive ? (meta?.color || roleColor) : '#64748b',
                  transition: 'all 0.15s',
                }}>
                  {meta ? `${meta.icon} ${label}` : label}
                </button>
              );
            })}
          </div>

          {(filterEmp || filterSts || filterDate) && (
            <button
              onClick={() => { setFilterEmp(''); setFilterSts(''); setFilterDate(''); setCurrentPage(1); }}
              style={{
                padding: '8px 14px', borderRadius: 9, border: '1.5px solid #fecdd3',
                background: '#fff1f2', color: '#f43f5e', fontSize: 12, cursor:'pointer', fontWeight: 700,
              }}
            >
              ✕ Clear
            </button>
          )}

          <div style={{ marginLeft:'auto', fontSize: 12, color:'#94a3b8', fontWeight: 500 }}>
            Showing <strong style={{ color:'#0f172a' }}>{filtered.length}</strong> records
          </div>
        </div>

        {/* ── Table ── */}
        <div className="att-fade att-fade-3" style={{
          background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 18,
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            padding: '16px 24px', borderBottom: '1.5px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
              Records
              <span style={{ marginLeft: 8, padding: '2px 10px', borderRadius: 20, background: '#f1f5f9', color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                {filtered.length}
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '520px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: `linear-gradient(90deg, ${roleColor} 0%, ${roleColor}cc 100%)` }}>
                  {['Employee','Department','Date','Login','Logout','Hours','Status','Action'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '12px 18px',
                      fontSize: 11, fontWeight: 700, color: '#fff',
                      textTransform: 'uppercase', letterSpacing: 1,
                      borderBottom: 'none', whiteSpace: 'nowrap',
                      position: 'sticky', top: 0, zIndex: 10,
                      background: `linear-gradient(90deg, ${roleColor} 0%, ${roleColor}cc 100%)`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign:'center', padding: 60 }}>
                      <div className="att-spinner" />
                      <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Loading records…</div>
                    </td>
                  </tr>
                ) : displayed.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign:'center', padding: 60 }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                      <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>No records found</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Try adjusting your filters</div>
                    </td>
                  </tr>
                ) : displayed.map((r, idx) => {
                  const loginStr  = fmtTime(r.loginTime);
                  const logoutStr = fmtTime(r.logoutTime);
                  return (
                    <tr
                      key={r._id}
                      className="att-table-row"
                      style={{ borderBottom: '1px solid #f8fafc' }}
                    >
                      {/* Employee */}
                      <td style={{ padding:'14px 18px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                          <Avatar name={r.employee?.name} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>
                              {r.employee?.name || '—'}
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                              {r.employee?.designation || r.employee?.employeeId || ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Dept */}
                      <td style={{ padding:'14px 18px' }}>
                        {r.employee?.department ? (
                          <span style={{
                            padding: '3px 10px', borderRadius: 20,
                            background: '#f1f5f9', color: '#475569',
                            fontSize: 12, fontWeight: 600,
                          }}>{r.employee.department}</span>
                        ) : '—'}
                      </td>

                      {/* Date */}
                      <td style={{ padding:'14px 18px', fontSize: 13, color: '#475569', fontWeight: 500 }}>
                        {fmtDate(r.date)}
                      </td>

                      {/* Login */}
                      <td style={{ padding:'14px 18px' }}>
                        {loginStr
                          ? <span style={{ color:'#10b981', fontWeight: 700, fontSize: 13 }}>{loginStr}</span>
                          : <span style={{ color:'#cbd5e1' }}>—</span>
                        }
                      </td>

                      {/* Logout */}
                      <td style={{ padding:'14px 18px' }}>
                        {logoutStr
                          ? <span style={{ color:'#f43f5e', fontWeight: 700, fontSize: 13 }}>{logoutStr}</span>
                          : r.loginTime
                            ? (
                              <span style={{ display:'inline-flex', alignItems:'center', gap: 5, color:'#f59e0b', fontSize: 12, fontWeight: 700 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display:'inline-block' }} />
                                Still in
                              </span>
                            )
                            : <span style={{ color:'#cbd5e1' }}>—</span>
                        }
                      </td>

                      {/* Hours */}
                      <td style={{ padding:'14px 18px' }}>
                        {r.hoursWorked
                          ? <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{r.hoursWorked}h</span>
                          : <span style={{ color:'#cbd5e1' }}>—</span>
                        }
                      </td>

                      {/* Status */}
                      <td style={{ padding:'14px 18px' }}>
                        <div>
                          <StatusPill status={r.status} />
                          {r.note && (() => {
                            const relogins = r.note.split('|').map(s => s.trim()).filter(s => s.startsWith('Re-login at')).map(s => s.replace('Re-login at ', ''));
                            const otherNote = r.note.split('|').map(s => s.trim()).filter(s => s && !s.startsWith('Re-login at')).join(' ');
                            return (
                              <div style={{ marginTop: 6 }}>
                                {otherNote && (
                                  <div style={{ fontSize: 10.5, color: '#94a3b8', marginBottom: 4, display:'flex', alignItems:'center', gap: 4 }}>
                                    <span>📝</span> {otherNote}
                                  </div>
                                )}
                                {relogins.length > 0 && (
                                  <details style={{ cursor:'pointer' }}>
                                    <summary style={{ listStyle:'none', userSelect:'none', outline:'none' }}>
                                      <span style={{
                                        display:'inline-flex', alignItems:'center', gap: 5,
                                        background:'rgba(99,102,241,0.10)', color:'#6366f1',
                                        border:'1px solid rgba(99,102,241,0.25)', borderRadius: 20,
                                        padding:'3px 9px', fontSize: 10.5, fontWeight: 700, cursor:'pointer',
                                        transition:'background 0.15s',
                                      }}>
                                        🔄 {relogins.length} re-login{relogins.length > 1 ? 's' : ''}
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ flexShrink:0 }}>
                                          <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                      </span>
                                    </summary>
                                    <div style={{ display:'flex', flexWrap:'wrap', gap: 4, marginTop: 6, padding:'6px 8px', background:'rgba(99,102,241,0.05)', borderRadius: 8, border:'1px solid rgba(99,102,241,0.12)' }}>
                                      {relogins.map((t, i) => (
                                        <span key={i} style={{ fontSize: 10, background:'#fff', color:'#6366f1', border:'1px solid rgba(99,102,241,0.25)', borderRadius: 6, padding:'2px 7px', fontWeight: 600, whiteSpace:'nowrap' }}>
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  </details>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ padding:'14px 18px' }}>
                        <button className="att-edit-btn" onClick={() => openEdit(r)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 24px', borderTop: '1.5px solid #f1f5f9',
              background: '#fafafa',
            }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                Page <strong style={{ color: '#0f172a' }}>{currentPage}</strong> of <strong style={{ color: '#0f172a' }}>{totalPages}</strong>
                &nbsp;·&nbsp; {pagedDates.length} date{pagedDates.length !== 1 ? 's' : ''} shown
                &nbsp;·&nbsp; {displayed.length} records
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0',
                    background: currentPage === 1 ? '#f8fafc' : '#fff',
                    color: currentPage === 1 ? '#cbd5e1' : '#475569',
                    fontSize: 13, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  }}
                >«</button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0',
                    background: currentPage === 1 ? '#f8fafc' : '#fff',
                    color: currentPage === 1 ? '#cbd5e1' : '#475569',
                    fontSize: 13, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  }}
                >‹</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) => p === '...'
                    ? <span key={'dot'+idx} style={{ padding: '0 4px', color: '#94a3b8', fontSize: 13 }}>…</span>
                    : <button key={p}
                        onClick={() => setCurrentPage(p)}
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          border: p === currentPage ? 'none' : '1.5px solid #e2e8f0',
                          background: p === currentPage ? `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)` : '#fff',
                          color: p === currentPage ? '#fff' : '#475569',
                          fontSize: 13, fontWeight: p === currentPage ? 800 : 500,
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: p === currentPage ? `0 4px 12px ${roleColor}55` : 'none',
                        }}
                      >{p}</button>
                  )
                }

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0',
                    background: currentPage === totalPages ? '#f8fafc' : '#fff',
                    color: currentPage === totalPages ? '#cbd5e1' : '#475569',
                    fontSize: 13, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  }}
                >›</button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0',
                    background: currentPage === totalPages ? '#f8fafc' : '#fff',
                    color: currentPage === totalPages ? '#cbd5e1' : '#475569',
                    fontSize: 13, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  }}
                >»</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div style={{
          position:'fixed', inset: 0, background:'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(6px)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1000,
        }}>
          <div style={{
            background:'#fff', borderRadius: 22, padding: 32, width: 480,
            boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
            maxHeight: '90vh', overflowY:'auto',
            animation: 'att-fadeUp 0.3s ease both',
          }}>
            {/* Modal header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color:'#0f172a' }}>
                  {editRec ? 'Edit Record' : 'Add Record'}
                </div>
                <div style={{ fontSize: 12.5, color:'#94a3b8', marginTop: 3 }}>
                  {editRec ? 'Correct an auto-captured entry' : 'Add a missing attendance record'}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                width: 32, height: 32, borderRadius: 9, border:'1.5px solid #e2e8f0',
                background:'#f8fafc', color:'#64748b', fontSize: 18, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>×</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
              {/* Employee */}
              <label>
                <div style={lblStyle}>Employee <span style={{ color:'#f43f5e' }}>*</span></div>
                <select
                  className="att-input att-select"
                  style={{ marginTop: 6, width:'100%', minWidth:'unset', padding:'10px 34px 10px 14px' }}
                  value={form.employeeId}
                  onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                  disabled={!!editRec}
                >
                  <option value=''>— Select employee —</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.department})</option>)}
                </select>
              </label>

              {/* Date */}
              <label>
                <div style={lblStyle}>Date <span style={{ color:'#f43f5e' }}>*</span></div>
                <input className="att-input" type='date' value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} disabled={!!editRec} />
              </label>

              {/* Status */}
              <label>
                <div style={lblStyle}>Status <span style={{ color:'#f43f5e' }}>*</span></div>
                <select
                  className="att-input att-select"
                  style={{ marginTop: 6, width:'100%', minWidth:'unset', padding:'10px 34px 10px 14px' }}
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value='PRESENT'>✓ Present</option>
                  <option value='LATE'>⏱ Late</option>
                  <option value='ABSENT'>✗ Absent</option>
                  <option value='HALF_DAY'>½ Half Day</option>
                </select>
              </label>

              {/* Time row */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
                <label>
                  <div style={lblStyle}>Login Time</div>
                  <input className="att-input" type='time' value={form.loginTime}
                    onChange={e => setForm(f => ({ ...f, loginTime: e.target.value }))} />
                </label>
                <label>
                  <div style={lblStyle}>Logout Time</div>
                  <input className="att-input" type='time' value={form.logoutTime}
                    onChange={e => setForm(f => ({ ...f, logoutTime: e.target.value }))} />
                </label>
              </div>

              {/* Note */}
              <label>
                <div style={lblStyle}>Note / Reason</div>
                <input className="att-input" type='text'
                  placeholder='e.g. Employee forgot to logout…'
                  value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              </label>
            </div>

            {/* Modal actions */}
            <div style={{ display:'flex', gap: 10, marginTop: 26, justifyContent:'flex-end' }}>
              <button className="att-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="att-btn-primary" onClick={handleSave}>
                {editRec ? 'Save Changes' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

const lblStyle = { fontSize: 12.5, color: '#475569', fontWeight: 700 };
