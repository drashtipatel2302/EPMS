import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Layout from '../../components/Layout';
import { Card, SectionHeader } from '../../components/UI';
import { getAllAttendance, manualMarkAttendance } from '../../services/attendanceApi';
import { fetchEmployees } from '../../services/api';

const ROLE_COLOR = '#f43f5e';
const ROLE_BG    = '#fff1f2';

const STATUS_COLOR = { PRESENT: '#43E8AC', LATE: '#FFB547', ABSENT: '#FF6584', HALF_DAY: '#f43f5e' };
const STATUS_BG    = { PRESENT: 'rgba(67,232,172,0.15)', LATE: 'rgba(255,181,71,0.15)', ABSENT: 'rgba(255,101,132,0.15)', HALF_DAY: 'rgba(244,63,94,0.15)' };
const STATUS_ICON  = { PRESENT: '✅', LATE: '⏰', ABSENT: '❌', HALF_DAY: '🕐' };

const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
const fmtDate = (s) => {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS  = [2023, 2024, 2025, 2026];

function EmpDropdown({ employees, value, onChange, selStyle }) {
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
      zIndex: 99999, background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 10, boxShadow: '0 12px 32px rgba(0,0,0,0.22)', overflow: 'hidden',
    }}>
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
        <input autoFocus placeholder="Type to search…" value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
            color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
      </div>
      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
        <div onClick={() => handleSelect('')} style={{
          padding: '9px 14px', fontSize: 13, cursor: 'pointer',
          color: !value ? ROLE_COLOR : 'var(--text-secondary)',
          background: !value ? `${ROLE_COLOR}18` : 'transparent',
          fontWeight: !value ? 700 : 400, borderBottom: '1px solid var(--border)',
        }}>All Employees</div>
        {filtered.length === 0 && <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>No results</div>}
        {filtered.map(e => (
          <div key={e._id} onClick={() => handleSelect(e._id)} style={{
            padding: '9px 14px', fontSize: 13, cursor: 'pointer',
            background: value === e._id ? `${ROLE_COLOR}18` : 'transparent',
            color: value === e._id ? ROLE_COLOR : 'var(--text-primary)',
            fontWeight: value === e._id ? 700 : 400, borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>{e.name}</span>
            {e.department && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.department}</span>}
          </div>
        ))}
      </div>
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} style={{ position: 'relative', minWidth: 200, display: 'inline-block' }}>
      <div onClick={() => open ? (setOpen(false), setQuery('')) : openDropdown()} style={{
        ...selStyle, display: 'flex', alignItems: 'center', gap: 8,
        cursor: 'pointer', userSelect: 'none', minWidth: 200,
        border: open ? `1px solid ${ROLE_COLOR}` : selStyle?.border,
      }}>
        <span style={{ fontSize: 13 }}>🔍</span>
        <span style={{ flex: 1, color: selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {selected ? selected.name : 'All Employees'}
        </span>
        {selected
          ? <span onClick={e => { e.stopPropagation(); handleSelect(''); }} style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1 }}>×</span>
          : <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{open ? '▲' : '▼'}</span>
        }
      </div>
      {dropdownList}
    </div>
  );
}

export default function HRAttendancePage() {
  const [records,   setRecords]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [month,     setMonth]     = useState(new Date().getMonth() + 1);
  const [year,      setYear]      = useState(new Date().getFullYear());
  const [filterEmp, setFilterEmp] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ employeeId: '', date: '', status: 'PRESENT', loginTime: '', logoutTime: '', note: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAttendance({ month, year, employeeId: filterEmp || undefined });
      setRecords(res.records || []);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [month, year, filterEmp]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    fetchEmployees({ limit: 200 }).then(d => setEmployees(d.employees || [])).catch(() => {});
  }, []);

  const handleCorrect = async () => {
    if (!form.employeeId || !form.date) return showToast('Please select employee and date', 'error');
    try {
      await manualMarkAttendance({
        ...form,
        loginTime:  form.loginTime  ? new Date(`${form.date}T${form.loginTime}`)  : null,
        logoutTime: form.logoutTime ? new Date(`${form.date}T${form.logoutTime}`) : null,
      });
      showToast('Attendance record corrected ✅');
      setShowModal(false);
      setForm({ employeeId: '', date: '', status: 'PRESENT', loginTime: '', logoutTime: '', note: '' });
      loadData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const present = records.filter(r => r.status === 'PRESENT').length;
  const late    = records.filter(r => r.status === 'LATE').length;
  const absent  = records.filter(r => r.status === 'ABSENT').length;
  const halfDay = records.filter(r => r.status === 'HALF_DAY').length;

  return (
    <Layout>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'error' ? '#FF6584' : '#43E8AC',
          color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>{toast.msg}</div>
      )}

      <div style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <SectionHeader
            title="Attendance Management"
            subtitle="Attendance is auto-recorded via login/logout. Correct records manually if needed."
          />
          <button onClick={() => setShowModal(true)} style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg, ${ROLE_COLOR}, ${ROLE_COLOR}cc)`,
            color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13,
          }}>
            ✏️ Correct Record
          </button>
        </div>

        {/* Info banner */}
        <div style={{
          background: `${ROLE_COLOR}10`, border: `1px solid ${ROLE_COLOR}30`,
          borderRadius: 12, padding: '12px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)',
        }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <span>
            Attendance is <strong style={{ color: ROLE_COLOR }}>automatically captured</strong> when employees login and logout.
            Use <em>"Correct Record"</em> only to fix errors or add missing entries.
          </span>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Present',  value: present,  color: '#43E8AC', icon: '✅' },
            { label: 'Late',     value: late,     color: '#FFB547', icon: '⏰' },
            { label: 'Absent',   value: absent,   color: '#FF6584', icon: '❌' },
            { label: 'Half Day', value: halfDay,  color: ROLE_COLOR, icon: '🕐' },
          ].map(({ label, value, color, icon }) => (
            <Card key={label} style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: 26 }}>{icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 2 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, padding: '12px 16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Filter:</span>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} style={sel}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))} style={sel}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <EmpDropdown
              employees={employees}
              value={filterEmp}
              onChange={setFilterEmp}
              selStyle={sel}
            />
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Employee', 'Department', 'Date', 'Login Time', 'Logout Time', 'Hours', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '11px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading…</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No records found.</td></tr>
                ) : records.map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{r.employee?.name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.employee?.employeeId || ''}</div>
                    </td>
                    <td style={td}>{r.employee?.department || '—'}</td>
                    <td style={td}>{fmtDate(r.date)}</td>
                    <td style={{ ...td, color: '#43E8AC', fontWeight: 600 }}>{fmtTime(r.loginTime)}</td>
                    <td style={{ ...td, color: r.logoutTime ? '#FF6584' : 'var(--text-muted)', fontWeight: r.logoutTime ? 600 : 400 }}>
                      {fmtTime(r.logoutTime)}
                      {!r.logoutTime && r.loginTime && <span style={{ fontSize: 10, marginLeft: 6, color: '#FFB547' }}>still in</span>}
                    </td>
                    <td style={td}>{r.hoursWorked ? `${r.hoursWorked}h` : '—'}</td>
                    <td style={td}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: STATUS_BG[r.status] || 'rgba(255,255,255,0.08)',
                        color: STATUS_COLOR[r.status] || '#fff',
                      }}>
                        {STATUS_ICON[r.status]} {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Correction Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, padding: 28, width: 440,
            border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6, color: 'var(--text-primary)' }}>Correct Attendance Record</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Use this only to fix incorrect or missing auto-recorded entries.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <label style={lbl}>Employee
                <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} style={inp}>
                  <option value=''>Select employee</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </label>
              <label style={lbl}>Date
                <input type='date' value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
              </label>
              <label style={lbl}>Status
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                  {['PRESENT','LATE','ABSENT','HALF_DAY'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={lbl}>Login Time
                  <input type='time' value={form.loginTime} onChange={e => setForm(f => ({ ...f, loginTime: e.target.value }))} style={inp} />
                </label>
                <label style={lbl}>Logout Time
                  <input type='time' value={form.logoutTime} onChange={e => setForm(f => ({ ...f, logoutTime: e.target.value }))} style={inp} />
                </label>
              </div>
              <label style={lbl}>Note (optional)
                <input type='text' placeholder='Reason for correction…' value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={inp} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600,
              }}>Cancel</button>
              <button onClick={handleCorrect} style={{
                padding: '9px 20px', borderRadius: 8, border: 'none',
                background: `linear-gradient(135deg, ${ROLE_COLOR}, ${ROLE_COLOR}cc)`,
                color: '#fff', cursor: 'pointer', fontWeight: 700,
              }}>Save Correction</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

const sel = {
  padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
};
const td  = { padding: '12px 14px', fontSize: 13, color: 'var(--text-primary)' };
const inp = {
  display: 'block', width: '100%', marginTop: 5, padding: '8px 10px',
  borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.07)', color: 'var(--text-primary)',
  fontSize: 13, outline: 'none', boxSizing: 'border-box',
};
const lbl = { fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, display: 'block' };
