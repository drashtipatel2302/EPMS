import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Layout from '../../components/Layout';
import { Card, SectionHeader, Badge, Button, ProgressBar, StatCard } from '../../components/UI';
import Loader from '../../components/Loader';
import {
  fetchAllAttendanceHR,
  manualMarkAttendance,
  fetchSalaries,
  createSalarySlip,
  updateSalarySlip,
  fetchLeavePolicies,
  createLeavePolicyAPI,
  updateLeavePolicyAPI,
  fetchGrievances,
  updateGrievanceStatus,
  addGrievanceNote,
  fetchTraining,
  createTraining,
  updateTrainingRecord,
  fetchRecruitment,
  createJobPosting,
  updateJobPosting,
  fetchApplicants,
  addApplicant,
  updateApplicant,
  deleteApplicant,
  fetchEmployees,
  submitPerformanceEvaluation,
  fetchAllPerformance,
  respondToTraining,
} from '../../services/api';

// ─── Attendance ───────────────────────────────────────────────────────────────
function EmpDropdown({ employees, value, onChange }) {
  const [query, setQuery]   = React.useState('');
  const [open, setOpen]     = React.useState(false);
  const [rect, setRect]     = React.useState(null);
  const triggerRef          = React.useRef(null);
  const listRef             = React.useRef(null);

  const selected = employees.find(e => (e._id || e.id) === value);
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

  const handleSelect = (id) => { onChange(id || 'all'); setQuery(''); setOpen(false); };

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
            color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} />
      </div>
      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
        <div onClick={() => handleSelect('')} style={{
          padding: '9px 14px', fontSize: 12, cursor: 'pointer',
          color: value === 'all' ? '#6C63FF' : 'var(--text-secondary)',
          background: value === 'all' ? 'rgba(108,99,255,0.1)' : 'transparent',
          fontWeight: value === 'all' ? 700 : 400, borderBottom: '1px solid var(--border)',
        }}>All Employees</div>
        {filtered.length === 0 && <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>No results</div>}
        {filtered.map(e => (
          <div key={e._id || e.id} onClick={() => handleSelect(e._id || e.id)} style={{
            padding: '9px 14px', fontSize: 12, cursor: 'pointer',
            background: value === (e._id || e.id) ? 'rgba(108,99,255,0.1)' : 'transparent',
            color: value === (e._id || e.id) ? '#6C63FF' : 'var(--text-primary)',
            fontWeight: value === (e._id || e.id) ? 700 : 400,
            borderBottom: '1px solid var(--border)',
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
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
        background: 'var(--bg-elevated)', border: `1px solid ${open ? '#6C63FF' : 'var(--border)'}`,
        borderRadius: 8, cursor: 'pointer', userSelect: 'none', fontSize: 12,
        color: selected ? 'var(--text-primary)' : 'var(--text-secondary)', minWidth: 200,
      }}>
        <span>🔍</span>
        <span style={{ flex: 1 }}>{selected ? selected.name : 'All Employees'}</span>
        {selected
          ? <span onClick={e => { e.stopPropagation(); handleSelect(''); }} style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1 }}>×</span>
          : <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{open ? '▲' : '▼'}</span>
        }
      </div>
      {dropdownList}
    </div>
  );
}

export function Attendance() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchAllAttendanceHR().catch(() => ({ records: [] })),
      fetchEmployees({ limit: 100 }).catch(() => []),
    ]).then(([aRes, empRes]) => {
      setRecords(aRes.records || []);
      const empList = Array.isArray(empRes) ? empRes : empRes.employees || [];
      setUsers(empList.filter(u => u.role === 'EMPLOYEE'));
      setLoading(false);
    }).catch(() => {
      // fallback to mock
      setRecords([]); setUsers([]); setLoading(false);
    });
  }, []);

  if (loading) return <Layout><Loader /></Layout>;

  const STATUS_COLORS = { PRESENT: '#43E8AC', present: '#43E8AC', ABSENT: '#FF6584', absent: '#FF6584', LATE: '#FFB547', late: '#FFB547', HALF_DAY: '#6C63FF' };
  const filtered = selectedUser === 'all' ? records : records.filter(r => (r.employee?._id || r.employee) === selectedUser);
  const present = records.filter(r => ['PRESENT','present'].includes(r.status)).length;
  const absent = records.filter(r => ['ABSENT','absent'].includes(r.status)).length;
  const late = records.filter(r => ['LATE','late'].includes(r.status)).length;

  return (
    <Layout>
      <div style={{ maxWidth: 1000 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--role-color, #f43f5e)', margin: 0, letterSpacing: '-0.5px' }}>Attendance Records</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Track employee check-in/check-out and attendance status · Connected to MongoDB</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Records" value={records.length} icon="📅" color="#6C63FF" delay={0.05} />
          <StatCard label="Present"       value={present}        icon="✅" color="#43E8AC" delay={0.10} />
          <StatCard label="Absent"        value={absent}         icon="❌" color="#FF6584" delay={0.15} />
          <StatCard label="Late"          value={late}           icon="⏰" color="#FFB547" delay={0.20} />
        </div>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <SectionHeader title="Attendance Log" />
            <EmpDropdown
              employees={users}
              value={selectedUser}
              onChange={setSelectedUser}
            />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Employee','Date','Check In','Check Out','Hours','Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No attendance records found</td></tr>
              )}
              {filtered.map((r, i) => (
                <tr key={r._id || r.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{r.employee?.name || '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{r.date}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: r.checkIn || r.loginTime ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {r.checkIn || (r.loginTime ? new Date(r.loginTime).toLocaleTimeString() : '—')}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: r.checkOut || r.logoutTime ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {r.checkOut || (r.logoutTime ? new Date(r.logoutTime).toLocaleTimeString() : '—')}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-primary)' }}>{r.hours || r.hoursWorked ? `${r.hours || r.hoursWorked}h` : '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${STATUS_COLORS[r.status] || '#8B90A7'}18`, color: STATUS_COLORS[r.status] || '#8B90A7', textTransform: 'capitalize' }}>
                      {r.status?.toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Layout>
  );
}

// ─── Salary Management ────────────────────────────────────────────────────────
export function SalaryManagement() {
  const [slips, setSlips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: '', month: '', basicSalary: '', hra: '', allowances: '', deductions: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchSalaries().catch(() => ({ salaries: [] })),
      fetchEmployees({ limit: 100 }).catch(() => []),
    ]).then(([sRes, empRes]) => {
      setSlips(sRes.salaries || []);
      const empList = Array.isArray(empRes) ? empRes : empRes.employees || [];
      setEmployees(empList);
      setLoading(false);
    }).catch(() => {
      setSlips([]); setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);
  if (loading) return <Layout><Loader /></Layout>;

  const totalPayroll = slips.filter(s => s.status === 'PAID' || s.status === 'paid').reduce((s, x) => s + (x.netSalary || x.net || 0), 0);

  const handleCreate = async () => {
    if (!form.employee || !form.month || !form.basicSalary) { setError('Employee, month and basic salary are required'); return; }
    setSaving(true); setError('');
    try {
      await createSalarySlip({
        ...form,
        basicSalary: Number(form.basicSalary),
        hra: Number(form.hra || 0),
        allowances: Number(form.allowances || 0),
        deductions: Number(form.deductions || 0),
      });
      setShowForm(false);
      setForm({ employee: '', month: '', basicSalary: '', hra: '', allowances: '', deductions: '' });
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id) => {
    try { await updateSalarySlip(id, { status: 'PAID' }); load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <Layout>
      <div style={{ maxWidth: 900 }}>
        {error && <div style={{ padding: '10px 16px', background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 8, color: '#FF6584', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--role-color, #f43f5e)', margin: 0, letterSpacing: '-0.5px' }}>Salary Management</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Approve salary structure and generate payslips · Connected to MongoDB</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>+ Process Payroll</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Payroll"    value={`₹${(totalPayroll/100000).toFixed(1)}L`} icon="💰" color="#43E8AC" delay={0.05} />
          <StatCard label="Slips Generated"  value={slips.length}                             icon="📄" color="#6C63FF" delay={0.10} />
          <StatCard label="Pending Approval" value={slips.filter(s => s.status === 'PENDING').length} icon="⏳" color="#FFB547" delay={0.15} />
        </div>

        {showForm && (
          <Card style={{ marginBottom: 20 }}>
            <SectionHeader title="Create Salary Slip" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Employee *</label>
                <select value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                  <option value="">Select...</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Month * (YYYY-MM)</label>
                <input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Basic Salary *</label>
                <input type="number" value={form.basicSalary} onChange={e => setForm(f => ({ ...f, basicSalary: e.target.value }))} placeholder="45000"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>HRA</label>
                <input type="number" value={form.hra} onChange={e => setForm(f => ({ ...f, hra: e.target.value }))} placeholder="18000"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Allowances</label>
                <input type="number" value={form.allowances} onChange={e => setForm(f => ({ ...f, allowances: e.target.value }))} placeholder="5000"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Deductions</label>
                <input type="number" value={form.deductions} onChange={e => setForm(f => ({ ...f, deductions: e.target.value }))} placeholder="6800"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : 'Create Slip'}</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {slips.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No salary slips found. Run the seed script or create a new one.</div>}
          {slips.map(s => (
            <Card key={s._id || s.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === (s._id || s.id) ? null : (s._id || s.id))}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(67,232,172,0.12)', border: '1px solid rgba(67,232,172,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📄</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{s.monthLabel || s.month}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {s.employee?.name && <span style={{ marginRight: 8 }}>{s.employee.name}</span>}
                      Net Pay: <strong style={{ color: '#43E8AC' }}>₹{(s.netSalary || s.net || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Badge status={(s.status || '').toLowerCase()} />
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>{expanded === (s._id || s.id) ? '▲' : '▼'}</span>
                </div>
              </div>
              {expanded === (s._id || s.id) && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Earnings</div>
                      {[['Basic Salary', s.basicSalary || s.basic], ['HRA', s.hra], ['Allowances', s.allowances]].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#43E8AC' }}>₹{(v || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Deductions</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Deductions</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#FF6584' }}>−₹{(s.deductions || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Net Salary</span>
                    <span style={{ fontSize: 18, fontWeight: 600, color: '#43E8AC' }}>₹{(s.netSalary || s.net || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                    {(s.status === 'PENDING' || s.status === 'APPROVED') && (
                      <Button variant="success" size="sm" onClick={() => handleApprove(s._id || s.id)}>Mark as Paid</Button>
                    )}
                    {s.status === 'PENDING' && (
                      <Button variant="primary" size="sm" onClick={async () => {
                        try {
                          await updateSalarySlip(s._id || s.id, { status: 'APPROVED' });
                          load();
                        } catch (e) { setError(e.message); }
                      }}>Send to Employee</Button>
                    )}
                    {s.status === 'APPROVED' && (
                      <Button variant="secondary" size="sm" disabled style={{ opacity: 0.6 }}>✓ Sent to Employee</Button>
                    )}
                    {s.status === 'PAID' && (
                      <Button variant="secondary" size="sm" disabled style={{ opacity: 0.6 }}>✓ Paid & Sent</Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

// ─── Leave Policies ───────────────────────────────────────────────────────────
export function LeavePolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saved, setSaved] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: '', days: '', paid: true, carryOver: false, description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    fetchLeavePolicies().then(res => {
      setPolicies(res.policies || []);
      setLoading(false);
    }).catch(() => {
      // fallback static data
      setPolicies([
        { _id: '1', type: 'Annual Leave', days: 21, carryOver: true, paid: true, description: 'Yearly vacation entitlement.' },
        { _id: '2', type: 'Sick Leave', days: 12, carryOver: false, paid: true, description: 'Medical leave for illness.' },
      ]);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);
  if (loading) return <Layout><Loader /></Layout>;

  const handleSave = async (p) => {
    try {
      await updateLeavePolicyAPI(p._id, { type: p.type, days: p.days, paid: p.paid, carryOver: p.carryOver, description: p.description });
      setEditing(null); setSaved(p._id); setTimeout(() => setSaved(null), 2000);
    } catch (e) { setError(e.message); }
  };

  const handleCreate = async () => {
    if (!form.type || !form.days) { setError('Type and days are required'); return; }
    setSaving(true); setError('');
    try {
      await createLeavePolicyAPI({ ...form, days: Number(form.days) });
      setShowForm(false); setForm({ type: '', days: '', paid: true, carryOver: false, description: '' });
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Layout>
      <div style={{ maxWidth: 900 }}>
        {error && <div style={{ padding: '10px 16px', background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 8, color: '#FF6584', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--role-color, #f43f5e)', margin: 0, letterSpacing: '-0.5px' }}>Leave Policies</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Manage and configure company leave types · Connected to MongoDB</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>+ Add Leave Type</Button>
        </div>

        {showForm && (
          <Card style={{ marginBottom: 20 }}>
            <SectionHeader title="New Leave Policy" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Leave Type *</label>
                <input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="e.g. Paternity Leave"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Days per Year *</label>
                <input type="number" value={form.days} onChange={e => setForm(f => ({ ...f, days: e.target.value }))} placeholder="15"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Paid?</label>
                <select value={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.value === 'true' }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                  <option value="true">Paid</option><option value="false">Unpaid</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Carry Over?</label>
                <select value={form.carryOver} onChange={e => setForm(f => ({ ...f, carryOver: e.target.value === 'true' }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                  <option value="false">No</option><option value="true">Yes</option>
                </select>
              </div>
            </div>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Description..."
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', outline: 'none', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : 'Create Policy'}</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {policies.map(p => (
            <Card key={p._id} style={{ borderTop: `3px solid ${p.paid ? '#43E8AC' : '#FFB547'}` }}>
              {editing === p._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input value={p.type} onChange={e => setPolicies(ps => ps.map(x => x._id === p._id ? { ...x, type: e.target.value } : x))}
                    style={{ padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Days</label>
                      <input type="number" value={p.days} onChange={e => setPolicies(ps => ps.map(x => x._id === p._id ? { ...x, days: Number(e.target.value) } : x))}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Paid?</label>
                      <select value={p.paid} onChange={e => setPolicies(ps => ps.map(x => x._id === p._id ? { ...x, paid: e.target.value === 'true' } : x))}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                        <option value="true">Paid</option><option value="false">Unpaid</option>
                      </select>
                    </div>
                  </div>
                  <textarea value={p.description} rows={2} onChange={e => setPolicies(ps => ps.map(x => x._id === p._id ? { ...x, description: e.target.value } : x))}
                    style={{ padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12, resize: 'vertical', outline: 'none' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="primary" size="sm" onClick={() => handleSave(p)}>Save to DB</Button>
                    <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{p.type}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: p.paid ? 'rgba(67,232,172,0.12)' : 'rgba(255,181,71,0.12)', color: p.paid ? '#43E8AC' : '#FFB547' }}>
                        {p.paid ? 'PAID' : 'UNPAID'}
                      </span>
                      {p.carryOver && <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(108,99,255,0.12)', color: '#6C63FF' }}>CARRY OVER</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 4 }}>{p.days} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>days/year</span></div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>{p.description}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" size="sm" onClick={() => setEditing(p._id)}>Edit</Button>
                    {saved === p._id && <span style={{ fontSize: 12, color: '#43E8AC', alignSelf: 'center', fontWeight: 600 }}>✓ Saved to DB!</span>}
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

// ─── Grievances ───────────────────────────────────────────────────────────────
export function Grievances() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteOpenId, setNoteOpenId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState('');

  const load = () => {
    setLoading(true);
    fetchGrievances().then(res => {
      setItems(res.grievances || []);
      setLoading(false);
    }).catch(() => {
      setItems([]); setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);
  if (loading) return <Layout><Loader /></Layout>;

  const handleStatus = async (id, status) => {
    try {
      await updateGrievanceStatus(id, { status });
      setItems(prev => prev.map(g => (g._id || g.id) === id ? { ...g, status } : g));
    } catch (e) {
      setError(e.message);
      setItems(prev => prev.map(g => (g._id || g.id) === id ? { ...g, status } : g));
    }
  };

  const handleNoteOpen = (id) => {
    const grievance = items.find(g => (g._id || g.id) === id);
    setNoteText(grievance?.notes || '');
    setNoteOpenId(id);
    setNoteSuccess('');
    setError('');
  };

  const handleNoteClose = () => {
    setNoteOpenId(null);
    setNoteText('');
    setNoteSuccess('');
  };

  const handleNoteSave = async (id) => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      await addGrievanceNote(id, noteText.trim());
      setItems(prev => prev.map(g => (g._id || g.id) === id ? { ...g, notes: noteText.trim() } : g));
      setNoteSuccess('Note saved successfully!');
      setTimeout(() => { handleNoteClose(); }, 1500);
    } catch (e) {
      setError(e.message || 'Failed to save note');
    } finally {
      setNoteSaving(false);
    }
  };

  const PRIORITY_COLORS = { HIGH: '#FF6584', high: '#FF6584', MEDIUM: '#FFB547', medium: '#FFB547', LOW: '#43E8AC', low: '#43E8AC' };

  return (
    <Layout>
      <div style={{ maxWidth: 900 }}>
        {error && <div style={{ padding: '10px 16px', background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 8, color: '#FF6584', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--role-color, #f43f5e)', margin: 0, letterSpacing: '-0.5px' }}>Employee Grievances</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Handle and resolve employee complaints · Connected to MongoDB</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total"        value={items.length} icon="📋" color="#6C63FF" delay={0.05} />
          <StatCard label="Under Review" value={items.filter(g => ['UNDER_REVIEW','under-review'].includes(g.status)).length} icon="🔍" color="#FFB547" delay={0.10} />
          <StatCard label="Resolved"     value={items.filter(g => ['RESOLVED','resolved'].includes(g.status)).length}       icon="✅" color="#43E8AC" delay={0.15} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No grievances found</div>}
          {items.map(g => {
            const gId = g._id || g.id;
            const isNoteOpen = noteOpenId === gId;
            return (
              <Card key={gId} style={{ borderLeft: `4px solid ${PRIORITY_COLORS[g.priority] || '#8B90A7'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{g.subject}</div>
                      <Badge status={(g.priority || '').toLowerCase()} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Raised by <strong style={{ color: 'var(--text-secondary)' }}>{g.employee?.name || g.employee}</strong>
                      {g.employee?.department && <span> · {g.employee.department}</span>}
                      {g.createdAt && <span> · {new Date(g.createdAt).toLocaleDateString()}</span>}
                    </div>
                    {g.description && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>{g.description}</p>}
                    {g.notes && !isNoteOpen && (
                      <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(108,99,255,0.07)', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)', borderLeft: '3px solid #6C63FF' }}>
                        <span style={{ fontWeight: 600, color: '#6C63FF' }}>Note: </span>{g.notes}
                      </div>
                    )}
                  </div>
                  <Badge status={(g.status || '').toLowerCase().replace(/_/g, '-')} />
                </div>

                {!['RESOLVED','CLOSED','resolved'].includes(g.status) && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="primary" size="sm" onClick={() => handleStatus(gId, 'UNDER_REVIEW')}>Take Up</Button>
                      <Button variant="success" size="sm" onClick={() => handleStatus(gId, 'RESOLVED')}>Mark Resolved</Button>
                      <Button variant="secondary" size="sm" onClick={() => isNoteOpen ? handleNoteClose() : handleNoteOpen(gId)}>
                        {isNoteOpen ? 'Cancel' : 'Add Note'}
                      </Button>
                    </div>

                    {isNoteOpen && (
                      <div style={{ marginTop: 12, padding: 14, background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                          {g.notes ? 'Update Note' : 'Add Note'}
                        </div>
                        <textarea
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="Type your note here..."
                          rows={3}
                          style={{
                            width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                            fontSize: 13, borderRadius: 6, border: '1px solid var(--border)',
                            background: 'var(--bg-surface)', color: 'var(--text-primary)',
                            resize: 'vertical', fontFamily: 'inherit', outline: 'none',
                          }}
                          onFocus={e => e.target.style.borderColor = '#6C63FF'}
                          onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                        {noteSuccess && (
                          <div style={{ marginTop: 6, fontSize: 12, color: '#43E8AC', fontWeight: 500 }}>✓ {noteSuccess}</div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <Button variant="primary" size="sm"
                            onClick={() => handleNoteSave(gId)}
                            disabled={noteSaving || !noteText.trim()}>
                            {noteSaving ? 'Saving...' : 'Save Note'}
                          </Button>
                          <Button variant="secondary" size="sm" onClick={handleNoteClose}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

// ─── Training Records ─────────────────────────────────────────────────────────
export function Training() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: '', course: '', provider: '', category: 'Technical', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [respondId, setRespondId]   = useState(null);
  const [respondForm, setRespondForm] = useState({ hrFeedback: '', status: '', score: '' });
  const [respondSaving, setRespondSaving] = useState(false);
  const [respondSuccess, setRespondSuccess] = useState('');

  const handleRespond = async (rId) => {
    setRespondSaving(true);
    try {
      const payload = { hrFeedback: respondForm.hrFeedback };
      if (respondForm.status) payload.status = respondForm.status;
      if (respondForm.score)  payload.score  = Number(respondForm.score);
      await respondToTraining(rId, payload);
      setRespondSuccess('Response sent to employee!');
      setRespondForm({ hrFeedback: '', status: '', score: '' });
      setRespondId(null);
      setTimeout(() => setRespondSuccess(''), 3000);
      load();
    } catch(e) { setError(e.message); }
    finally { setRespondSaving(false); }
  };

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchTraining().catch(() => ({ records: [] })),
      fetchEmployees({ limit: 100 }).catch(() => []),
    ]).then(([tRes, empRes]) => {
      setRecords(tRes.records || []);
      const empList = Array.isArray(empRes) ? empRes : empRes.employees || [];
      setEmployees(empList);
      setLoading(false);
    }).catch(() => {
      setRecords([]); setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);
  if (loading) return <Layout><Loader /></Layout>;

  const handleCreate = async () => {
    if (!form.employee || !form.course || !form.provider || !form.startDate || !form.endDate) {
      setError('All fields are required'); return;
    }
    setSaving(true); setError('');
    try {
      await createTraining(form);
      setShowForm(false); setForm({ employee: '', course: '', provider: '', category: 'Technical', startDate: '', endDate: '' });
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const STATUS_COLORS = { completed: '#43E8AC', 'in-progress': '#FFB547', upcoming: '#6C63FF', pending: '#8B90A7' };

  return (
    <Layout>
      <div style={{ maxWidth: 900 }}>
        {error && <div style={{ padding: '10px 16px', background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 8, color: '#FF6584', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--role-color, #f43f5e)', margin: 0, letterSpacing: '-0.5px' }}>Training Records</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Track employee learning and development · Connected to MongoDB</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>+ Add Training</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Trainings" value={records.length} icon="🎓" color="#6C63FF" delay={0.05} />
          <StatCard label="Completed"       value={records.filter(r => r.status === 'COMPLETED' || r.status === 'completed').length} icon="✅" color="#43E8AC" delay={0.10} />
          <StatCard label="In Progress"     value={records.filter(r => r.status === 'IN_PROGRESS' || r.status === 'in-progress').length} icon="📚" color="#FFB547" delay={0.15} />
        </div>

        {showForm && (
          <Card style={{ marginBottom: 20 }}>
            <SectionHeader title="Add Training Record" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Employee *</label>
                <select value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                  <option value="">Select...</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Course *</label>
                <input value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} placeholder="Advanced React"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Provider *</label>
                <input value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} placeholder="Udemy"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                  {['Technical','Design','Marketing','Leadership','HR','General'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Start Date *</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>End Date *</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : 'Add Record'}</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {records.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No training records found</div>}
          {records.map(r => {
            const rId = r._id || r.id;
            const isOpen = expandedId === rId;
            const statusKey = (r.status || '').toLowerCase().replace(/_/g, '-');
            const statusColor = STATUS_COLORS[statusKey] || '#8B90A7';
            return (
              <Card key={rId} style={{ borderLeft: isOpen ? `4px solid ${statusColor}` : '4px solid transparent', transition: 'border-color 0.2s' }}>
                {/* ── Main row ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{r.course}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {r.employee?.name || r.employee} · {r.provider} · {r.startDate ? new Date(r.startDate).toLocaleDateString() : ''} → {r.endDate ? new Date(r.endDate).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 60 }}>
                    {r.score ? (
                      <><div style={{ fontSize: 20, fontWeight: 500, color: '#43E8AC' }}>{r.score}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Score</div></>
                    ) : <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</div>}
                  </div>
                  <Badge status={statusKey} />
                  <Button
                    variant={isOpen ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setExpandedId(isOpen ? null : rId)}
                  >
                    {isOpen ? 'Close' : 'View'}
                  </Button>
                </div>

                {/* ── Expanded detail panel ── */}
                {isOpen && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
                      {[
                        { label: 'Employee',   value: r.employee?.name || r.employee || '—' },
                        { label: 'Course',     value: r.course || '—' },
                        { label: 'Provider',   value: r.provider || '—' },
                        { label: 'Category',   value: r.category || '—' },
                        { label: 'Start Date', value: r.startDate ? new Date(r.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                        { label: 'End Date',   value: r.endDate   ? new Date(r.endDate).toLocaleDateString('en-IN',   { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 14px' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Employee Status Update */}
                    {r.employeeStatus && r.employeeStatus !== 'NOT_STARTED' && (
                      <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(108,99,255,0.07)', borderRadius: 8, borderLeft: '3px solid #6C63FF' }}>
                        <div style={{ fontSize: 11, color: '#6C63FF', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Employee Update {r.employeeUpdatedAt ? `· ${new Date(r.employeeUpdatedAt).toLocaleDateString('en-IN')}` : ''}
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color:
                            r.employeeStatus === 'COMPLETED' ? '#43E8AC' :
                            r.employeeStatus === 'NEEDS_HELP' ? '#FF6584' :
                            r.employeeStatus === 'IN_PROGRESS' ? '#FFB547' : '#8B90A7',
                            padding: '2px 10px', borderRadius: 20,
                            background: r.employeeStatus === 'NEEDS_HELP' ? 'rgba(255,101,132,0.12)' : 'rgba(67,232,172,0.12)',
                          }}>
                            {r.employeeStatus === 'NOT_STARTED' ? 'Not Started' :
                             r.employeeStatus === 'IN_PROGRESS' ? 'In Progress' :
                             r.employeeStatus === 'COMPLETED'   ? 'Completed'   : 'Needs Help 🆘'}
                          </span>
                          {r.employeeNote && <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{r.employeeNote}"</span>}
                        </div>
                      </div>
                    )}

                    {/* HR Previous Feedback */}
                    {r.hrFeedback && (
                      <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(67,232,172,0.07)', borderRadius: 8, borderLeft: '3px solid #43E8AC' }}>
                        <div style={{ fontSize: 11, color: '#43E8AC', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Your Previous Response {r.hrRespondedAt ? `· ${new Date(r.hrRespondedAt).toLocaleDateString('en-IN')}` : ''}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.hrFeedback}</div>
                      </div>
                    )}

                    {/* Score & Status summary row */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                      <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 16px', textAlign: 'center', minWidth: 70 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase' }}>Score</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: r.score ? '#43E8AC' : 'var(--text-muted)' }}>{r.score || '—'}</div>
                      </div>
                      <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 16px', textAlign: 'center', minWidth: 90 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase' }}>Status</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: statusColor, textTransform: 'capitalize' }}>{statusKey.replace(/-/g, ' ')}</div>
                      </div>
                      {r.notes && (
                        <div style={{ flex: 1, background: 'rgba(108,99,255,0.07)', borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid #6C63FF' }}>
                          <div style={{ fontSize: 10, color: '#6C63FF', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase' }}>HR Notes</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.notes}</div>
                        </div>
                      )}
                    </div>

                    {/* HR Respond button */}
                    {respondSuccess && <div style={{ fontSize: 12, color: '#43E8AC', marginBottom: 10 }}>✓ {respondSuccess}</div>}
                    {respondId !== rId ? (
                      <Button variant="primary" size="sm" onClick={() => {
                        setRespondId(rId);
                        setRespondForm({ hrFeedback: r.hrFeedback || '', status: r.status || '', score: r.score || '' });
                      }}>
                        💬 Respond to Employee
                      </Button>
                    ) : (
                      <div style={{ padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>Send Feedback to Employee</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                          <div>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Feedback / Message *</label>
                            <input value={respondForm.hrFeedback} onChange={e => setRespondForm(f => ({ ...f, hrFeedback: e.target.value }))}
                              placeholder="Great progress! Keep it up..."
                              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Update Status</label>
                            <select value={respondForm.status} onChange={e => setRespondForm(f => ({ ...f, status: e.target.value }))}
                              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                              <option value="">Keep current</option>
                              <option value="UPCOMING">Upcoming</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Score (%)</label>
                            <input type="number" min="0" max="100" value={respondForm.score} onChange={e => setRespondForm(f => ({ ...f, score: e.target.value }))}
                              placeholder="e.g. 85"
                              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button variant="primary" size="sm" onClick={() => handleRespond(rId)} disabled={respondSaving || !respondForm.hrFeedback.trim()}>
                            {respondSaving ? 'Sending...' : '📨 Send Response'}
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => setRespondId(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

// ─── Applicant Status Config ──────────────────────────────────────────────────
const APPL_STATUSES = ['APPLIED','SHORTLISTED','INTERVIEW','SELECTED','REJECTED'];
const APPL_COLORS   = { APPLIED:'#8B90A7', SHORTLISTED:'#6C63FF', INTERVIEW:'#FFB547', SELECTED:'#43E8AC', REJECTED:'#FF6584' };

// ─── ApplicantPanel — shown inside expanded job card ─────────────────────────
function ApplicantPanel({ job, onCountsChanged }) {
  const [applicants, setApplicants]     = useState([]);
  const [loadingAppl, setLoadingAppl]   = useState(true);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [apForm, setApForm]             = useState({ name:'', email:'', phone:'', experience:'', notes:'' });
  const [apSaving, setApSaving]         = useState(false);
  const [apError, setApError]           = useState('');
  const [activeTab, setActiveTab]       = useState('ALL');

  const jId = job._id || job.id;

  const loadApplicants = () => {
    setLoadingAppl(true);
    fetchApplicants(jId)
      .then(res => { setApplicants(res.applicants || []); setLoadingAppl(false); })
      .catch(() => setLoadingAppl(false));
  };

  useEffect(() => { loadApplicants(); }, [jId]);

  const handleAddApplicant = async () => {
    if (!apForm.name || !apForm.email) { setApError('Name and email are required'); return; }
    setApSaving(true); setApError('');
    try {
      await addApplicant(jId, apForm);
      setApForm({ name:'', email:'', phone:'', experience:'', notes:'' });
      setShowAddForm(false);
      loadApplicants();
      onCountsChanged();
    } catch(e) { setApError(e.message); }
    finally { setApSaving(false); }
  };

  const handleStatusChange = async (applicantId, status) => {
    try {
      await updateApplicant(jId, applicantId, { status });
      setApplicants(prev => prev.map(a => (a._id||a.id) === applicantId ? { ...a, status } : a));
      onCountsChanged();
    } catch(e) { setApError(e.message); }
  };

  const handleDelete = async (applicantId) => {
    if (!window.confirm('Remove this applicant?')) return;
    try {
      await deleteApplicant(jId, applicantId);
      setApplicants(prev => prev.filter(a => (a._id||a.id) !== applicantId));
      onCountsChanged();
    } catch(e) { setApError(e.message); }
  };

  const tabs = ['ALL','APPLIED','SHORTLISTED','INTERVIEW','SELECTED','REJECTED'];
  const filtered = activeTab === 'ALL' ? applicants : applicants.filter(a => a.status === activeTab);

  const inputStyle = { width:'100%', padding:'8px 12px', background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:13, outline:'none', boxSizing:'border-box' };

  return (
    <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>

      {/* Job detail info */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
        {[
          { label:'Department', value: job.department || '—' },
          { label:'Openings',   value: job.openings   || '—' },
          { label:'Posted',     value: job.postedDate ? new Date(job.postedDate).toLocaleDateString() : '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background:'var(--bg-elevated)', borderRadius:8, padding:'10px 14px' }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>
      {job.description && (
        <div style={{ marginBottom:16, padding:'10px 14px', background:'var(--bg-elevated)', borderRadius:8, fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>
          <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>Description</span>
          {job.description}
        </div>
      )}
      {job.requirements && (
        <div style={{ marginBottom:16, padding:'10px 14px', background:'var(--bg-elevated)', borderRadius:8, fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>
          <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>Requirements</span>
          {job.requirements}
        </div>
      )}

      {/* Applicants section header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>
          Applicants <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:400 }}>({applicants.length})</span>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddForm(s => !s)}>
          {showAddForm ? 'Cancel' : '+ Add Applicant'}
        </Button>
      </div>

      {apError && <div style={{ padding:'8px 12px', background:'rgba(255,101,132,0.1)', border:'1px solid rgba(255,101,132,0.3)', borderRadius:6, color:'#FF6584', fontSize:12, marginBottom:12 }}>{apError}</div>}

      {/* Add Applicant form */}
      {showAddForm && (
        <div style={{ background:'var(--bg-elevated)', borderRadius:10, padding:14, marginBottom:14, border:'1px solid var(--border)' }}>
          <div style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)', marginBottom:10 }}>New Applicant</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <div><label style={{ fontSize:11, color:'var(--text-muted)', display:'block', marginBottom:3 }}>Full Name *</label>
              <input value={apForm.name} onChange={e => setApForm(f => ({ ...f, name:e.target.value }))} placeholder="Riya Shah" style={inputStyle} /></div>
            <div><label style={{ fontSize:11, color:'var(--text-muted)', display:'block', marginBottom:3 }}>Email *</label>
              <input value={apForm.email} onChange={e => setApForm(f => ({ ...f, email:e.target.value }))} placeholder="riya@email.com" style={inputStyle} /></div>
            <div><label style={{ fontSize:11, color:'var(--text-muted)', display:'block', marginBottom:3 }}>Phone</label>
              <input value={apForm.phone} onChange={e => setApForm(f => ({ ...f, phone:e.target.value }))} placeholder="+91 98765 43210" style={inputStyle} /></div>
            <div><label style={{ fontSize:11, color:'var(--text-muted)', display:'block', marginBottom:3 }}>Experience</label>
              <input value={apForm.experience} onChange={e => setApForm(f => ({ ...f, experience:e.target.value }))} placeholder="3 years" style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom:10 }}><label style={{ fontSize:11, color:'var(--text-muted)', display:'block', marginBottom:3 }}>Notes</label>
            <textarea value={apForm.notes} onChange={e => setApForm(f => ({ ...f, notes:e.target.value }))} rows={2} placeholder="Any notes about this candidate..."
              style={{ ...inputStyle, resize:'vertical', fontFamily:'inherit' }} /></div>
          <div style={{ display:'flex', gap:8 }}>
            <Button variant="primary" size="sm" onClick={handleAddApplicant} disabled={apSaving}>{apSaving ? 'Saving...' : 'Add Applicant'}</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Tab filter */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
        {tabs.map(t => {
          const count = t === 'ALL' ? applicants.length : applicants.filter(a => a.status === t).length;
          return (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', border:'none',
              background: activeTab === t ? (APPL_COLORS[t] || '#6C63FF') : 'var(--bg-elevated)',
              color: activeTab === t ? '#fff' : 'var(--text-secondary)',
              transition:'all 0.15s',
            }}>{t} ({count})</button>
          );
        })}
      </div>

      {/* Applicants list */}
      {loadingAppl ? (
        <div style={{ padding:24, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>Loading applicants...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding:24, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>
          {applicants.length === 0 ? 'No applicants yet. Click "+ Add Applicant" to add one.' : `No applicants with status "${activeTab}".`}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(a => {
            const aId = a._id || a.id;
            const color = APPL_COLORS[a.status] || '#8B90A7';
            return (
              <div key={aId} style={{ background:'var(--bg-elevated)', borderRadius:10, padding:'12px 14px', border:`1px solid var(--border)`, borderLeft:`3px solid ${color}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)', marginBottom:2 }}>{a.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                      {a.email}{a.phone && ` · ${a.phone}`}{a.experience && ` · ${a.experience} exp`}
                    </div>
                    {a.notes && <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:4, fontStyle:'italic' }}>"{a.notes}"</div>}
                  </div>
                  <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:`${color}20`, color, textTransform:'uppercase', letterSpacing:'0.04em' }}>{a.status}</span>
                  </div>
                </div>
                {/* Status action buttons */}
                <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
                  {APPL_STATUSES.filter(s => s !== a.status).map(s => (
                    <button key={s} onClick={() => handleStatusChange(aId, s)} style={{
                      padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer',
                      background:`${APPL_COLORS[s]}15`, color:APPL_COLORS[s],
                      border:`1px solid ${APPL_COLORS[s]}40`, transition:'all 0.15s',
                    }}>→ {s.charAt(0)+s.slice(1).toLowerCase()}</button>
                  ))}
                  <button onClick={() => handleDelete(aId)} style={{
                    padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', marginLeft:'auto',
                    background:'rgba(255,101,132,0.1)', color:'#FF6584', border:'1px solid rgba(255,101,132,0.3)',
                  }}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Recruitment ──────────────────────────────────────────────────────────────
export function Recruitment() {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ position:'', department:'', description:'', requirements:'', openings:1 });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [expandedJobId, setExpandedJobId] = useState(null);

  const load = () => {
    setLoading(true);
    fetchRecruitment().then(res => {
      setJobs(res.jobs || []);
      setLoading(false);
    }).catch(() => { setJobs([]); setLoading(false); });
  };

  useEffect(() => { load(); }, []);
  if (loading) return <Layout><Loader /></Layout>;

  const STATUS_COLORS = { ACTIVE:'#43E8AC', active:'#43E8AC', INTERVIEW:'#6C63FF', interview:'#6C63FF', OFFER:'#FFB547', offer:'#FFB547', CLOSED:'#8B90A7', closed:'#8B90A7' };

  const handleCreate = async () => {
    if (!form.position || !form.department) { setError('Position and department are required'); return; }
    setSaving(true); setError('');
    try {
      await createJobPosting(form);
      setShowForm(false); setForm({ position:'', department:'', description:'', requirements:'', openings:1 });
      load();
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try { await updateJobPosting(id, { status }); load(); }
    catch(e) { setError(e.message); }
  };

  return (
    <Layout>
      <div style={{ maxWidth: 960 }}>
        {error && <div style={{ padding:'10px 16px', background:'rgba(255,101,132,0.1)', border:'1px solid rgba(255,101,132,0.3)', borderRadius:8, color:'#FF6584', fontSize:13, marginBottom:16 }}>{error}</div>}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--role-color, #f43f5e)', margin: 0, letterSpacing: '-0.5px' }}>Recruitment</h2>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>Manage open positions and hiring pipeline · Connected to MongoDB</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>+ Post Job</Button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
          <StatCard label="Open Positions"  value={jobs.filter(j => !['CLOSED','closed'].includes(j.status)).length} icon="💼" color="#6C63FF" delay={0.05} />
          <StatCard label="Total Applicants" value={jobs.reduce((s,j) => s+(j.applicants||0), 0)} icon="👥" color="#FFB547" delay={0.10} />
          <StatCard label="Shortlisted"     value={jobs.reduce((s,j) => s+(j.shortlisted||0), 0)} icon="⭐" color="#43E8AC" delay={0.15} />
        </div>

        {showForm && (
          <Card style={{ marginBottom:20 }}>
            <SectionHeader title="Post New Job" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:11, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Position *</label>
                <input value={form.position} onChange={e => setForm(f => ({ ...f, position:e.target.value }))} placeholder="Senior Developer"
                  style={{ width:'100%', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:13, outline:'none' }} />
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Department *</label>
                <input value={form.department} onChange={e => setForm(f => ({ ...f, department:e.target.value }))} placeholder="Engineering"
                  style={{ width:'100%', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:13, outline:'none' }} />
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Openings</label>
                <input type="number" value={form.openings} onChange={e => setForm(f => ({ ...f, openings:Number(e.target.value) }))} min="1"
                  style={{ width:'100%', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:13, outline:'none' }} />
              </div>
            </div>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} rows={2} placeholder="Job description..."
              style={{ width:'100%', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:13, resize:'vertical', outline:'none', marginBottom:8 }} />
            <textarea value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements:e.target.value }))} rows={2} placeholder="Requirements (e.g. 3+ years React, Node.js)..."
              style={{ width:'100%', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:13, resize:'vertical', outline:'none', marginBottom:12 }} />
            <div style={{ display:'flex', gap:8 }}>
              <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : 'Post Job'}</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {jobs.length === 0 && <div style={{ padding:24, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>No job postings found. Click "+ Post Job" to create one.</div>}
          {jobs.map(j => {
            const jId = j._id || j.id;
            const isOpen = expandedJobId === jId;
            const sc = STATUS_COLORS[j.status] || '#8B90A7';
            return (
              <Card key={jId} style={{ borderLeft: isOpen ? `4px solid ${sc}` : '4px solid transparent', transition:'border-color 0.2s' }}>
                {/* ── Summary row ── */}
                <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                  <div style={{ width:48, height:48, borderRadius:12, flexShrink:0, background:`${sc}18`, border:`1px solid ${sc}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>💼</div>
                  <div style={{ flex:'1 1 140px', minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.position}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{j.department} · Posted {j.postedDate ? new Date(j.postedDate).toLocaleDateString() : ''}</div>
                  </div>
                  <div style={{ display:'flex', gap:16, alignItems:'center', flexShrink:0 }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:20, fontWeight:800, color:'var(--role-color, #f43f5e)', lineHeight:1 }}>{j.applicants || 0}</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Applied</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:20, fontWeight:800, color:'#43E8AC', lineHeight:1 }}>{j.shortlisted || 0}</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Shortlisted</div>
                    </div>
                  </div>
                  <span style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600, textTransform:'capitalize', background:`${sc}18`, color:sc, flexShrink:0 }}>
                    {(j.status||'').toLowerCase()}
                  </span>
                  <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap' }}>
                    <Button variant={isOpen ? 'secondary' : 'primary'} size="sm" onClick={() => setExpandedJobId(isOpen ? null : jId)}>
                      {isOpen ? 'Close' : 'View'}
                    </Button>
                    {j.status !== 'CLOSED' && j.status !== 'closed' && (
                      <Button variant="secondary" size="sm" onClick={() => handleStatusChange(jId, 'CLOSED')}>Close Job</Button>
                    )}
                  </div>
                </div>

                {/* ── Expanded applicant panel ── */}
                {isOpen && (
                  <ApplicantPanel job={j} onCountsChanged={load} />
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

// ─── Performance Evaluation ───────────────────────────────────────────────────
export function PerformanceEvaluation() {
  const [employees, setEmployees] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const EMPTY = { employee: '', reviewPeriod: 'MONTHLY', reviewMonth: '', taskCompletion: '5', teamwork: '5', communication: '5', punctuality: '5', overallRating: '', goalsAchieved: '', totalGoals: '', salaryRaise: '0', remarks: '' };
  const [form, setForm] = useState(EMPTY);

  const SCALE = [['5','5 – Excellent'],['4','4 – Good'],['3','3 – Average'],['2','2 – Below Avg'],['1','1 – Poor']];

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchEmployees({ limit: 100 }).catch(() => []),
      fetchAllPerformance().catch(() => ({ evaluations: [] })),
    ]).then(([empRes, perfRes]) => {
      const empList = Array.isArray(empRes) ? empRes : empRes.employees || [];
      setEmployees(empList.filter(e => e.role === 'EMPLOYEE' || e.role === 'employee'));
      setEvaluations(perfRes.evaluations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  if (loading) return <Layout><Loader /></Layout>;

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.employee || !form.overallRating) { setError('Employee and Overall Rating are required'); return; }
    const r = parseFloat(form.overallRating);
    if (isNaN(r) || r < 1 || r > 5) { setError('Overall Rating must be between 1 and 5'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await submitPerformanceEvaluation({
        ...form,
        taskCompletion:  Number(form.taskCompletion),
        teamwork:        Number(form.teamwork),
        communication:   Number(form.communication),
        punctuality:     Number(form.punctuality),
        overallRating:   Number(form.overallRating),
        goalsAchieved:   form.goalsAchieved !== '' ? Number(form.goalsAchieved) : null,
        totalGoals:      form.totalGoals    !== '' ? Number(form.totalGoals)    : null,
        salaryRaise:     Number(form.salaryRaise) || 0,
      });
      setSuccess('Evaluation submitted successfully!');
      setForm(EMPTY);
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' };
  const ratingColor = r => r >= 4.5 ? '#43E8AC' : r >= 4 ? '#6C63FF' : r >= 3 ? '#FFB547' : '#FF6584';

  return (
    <Layout>
      <div style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--role-color, #f43f5e)', margin: 0, letterSpacing: '-0.5px' }}>Performance Evaluation</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Submit and manage employee performance reviews</p>
          </div>
        </div>

        {/* Evaluation Form */}
        <Card style={{ marginBottom: 24 }}>
          <SectionHeader title="New Evaluation" />

          {error   && <div style={{ padding: '10px 14px', background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 8, color: '#FF6584', fontSize: 13, marginBottom: 14 }}>{error}</div>}
          {success && <div style={{ padding: '10px 14px', background: 'rgba(67,232,172,0.1)', border: '1px solid rgba(67,232,172,0.3)', borderRadius: 8, color: '#43E8AC', fontSize: 13, marginBottom: 14 }}>✓ {success}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Employee *</label>
              <select value={form.employee} onChange={set('employee')} style={inputStyle}>
                <option value="">— Select Employee —</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.department || e.designation || e.role})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Review Period</label>
              <select value={form.reviewPeriod} onChange={set('reviewPeriod')} style={inputStyle}>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Period Label</label>
              <input value={form.reviewMonth} onChange={set('reviewMonth')} placeholder="e.g. March 2026 / Q1 2026" style={inputStyle} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--role-color, #f43f5e)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display:'inline-block', width: 3, height: 16, borderRadius: 2, background: 'var(--role-color, #f43f5e)' }} />
              Performance Ratings
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 14 }}>
            {[['taskCompletion','Task Completion'],['teamwork','Teamwork'],['communication','Communication'],['punctuality','Punctuality']].map(([field, label]) => (
              <div key={field}>
                <label style={labelStyle}>{label} (1–5)</label>
                <select value={form[field]} onChange={set(field)} style={inputStyle}>
                  {SCALE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--role-color, #f43f5e)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display:'inline-block', width: 3, height: 16, borderRadius: 2, background: 'var(--role-color, #f43f5e)' }} />
              Goals & Compensation
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div>
                <label style={labelStyle}>Goals Achieved</label>
                <input type="number" min="0" value={form.goalsAchieved} onChange={set('goalsAchieved')} placeholder="e.g. 4" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Total Goals</label>
                <input type="number" min="0" value={form.totalGoals} onChange={set('totalGoals')} placeholder="e.g. 5" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Salary Raise %</label>
                <input type="number" min="0" max="100" step="0.5" value={form.salaryRaise} onChange={set('salaryRaise')} placeholder="e.g. 5" style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Overall Rating (1–5) *</label>
              <select value={form.overallRating} onChange={set('overallRating')} style={inputStyle}>
                <option value="">— Select Rating —</option>
                {['5','4.5','4','3.5','3','2.5','2','1.5','1'].map(v => (
                  <option key={v} value={v}>{v}{v==='5'?' – Excellent':v==='4'?' – Good':v==='3'?' – Average':v==='2'?' – Below Avg':v==='1'?' – Poor':''}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Remarks</label>
              <input value={form.remarks} onChange={set('remarks')} placeholder="Strengths, achievements, areas for improvement..."
                style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Submitting...' : '✅ Submit Evaluation'}
            </Button>
            <Button variant="secondary" onClick={() => { setForm(EMPTY); setError(''); }}>Clear</Button>
          </div>
        </Card>

        {/* Evaluation History */}
        <Card>
          <SectionHeader title={`Evaluation History (${evaluations.length})`} />
          {evaluations.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No evaluations submitted yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {evaluations.map(ev => (
                <div key={ev._id} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{ev.employee?.name || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {ev.reviewPeriod}{ev.reviewMonth ? ` · ${ev.reviewMonth}` : ''} · By {ev.evaluatedBy?.name || '—'} · {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString('en-IN') : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: ratingColor(ev.overallRating) }}>{ev.overallRating}/5</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                    {[['Task', ev.taskCompletion],['Teamwork', ev.teamwork],['Comm.', ev.communication],['Punct.', ev.punctuality]].map(([l,v]) => (
                      <div key={l} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: ratingColor(v) }}>{v}/5</div>
                      </div>
                    ))}
                  </div>
                  {ev.remarks && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 8 }}>"{ev.remarks}"</div>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
