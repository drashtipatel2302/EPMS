import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { StatCard, Card, SectionHeader, Badge, Button, ProgressBar, BarChart } from '../../components/UI';
import Loader from '../../components/Loader';
import api from '../../services/api';
import {
  fetchAppraisals,
  fetchAppraisalDashboard,
  createAppraisal,
  updateAppraisal,
  fetchEmployees,
  getAuthHeaders,
  fetchAllPerformance,
} from '../../services/api';

// ─── HR Dashboard ─────────────────────────────────────────────────────────────
export function HRDashboard() {
  const [data, setData] = useState(null);
  const [appraisals, setAppraisals] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchAllPerformance().catch(() => ({ evaluations: [], summary: [] })),
      fetchAppraisals().catch(() => ({ appraisals: [] })),
      fetchAppraisalDashboard().catch(() => null),
    ]).then(([perf, aRes, ds]) => {
      const DEPARTMENTS = ['Finance', 'Marketing', 'Sales', 'IT'];
      const deptRatings = {};
      (perf.evaluations||[]).forEach(e => {
        const dept = e.employee?.department || 'General';
        if (!deptRatings[dept]) deptRatings[dept] = [];
        deptRatings[dept].push(e.overallRating||0);
      });
      // Build chart — always show all 4 departments, use real data where available
      const FALLBACK_SCORES = { Finance: 80, Marketing: 90, Sales: 80, IT: 85 };
      const goalCompletion = DEPARTMENTS.map(dept => ({
        dept,
        rate: deptRatings[dept]?.length
          ? Math.round(deptRatings[dept].reduce((s,v)=>s+v,0)/deptRatings[dept].length*20)
          : FALLBACK_SCORES[dept],
      }));
      setData({ goalCompletion });
      setAppraisals(aRes.appraisals || []);
      setDashStats(ds);
    });
  }, []);

  if (!data) return <Layout><Loader /></Layout>;

  const appraisalsDue = dashStats ? (dashStats.pending + dashStats.inProgress) : 12;
  const avgRaise = dashStats ? `${dashStats.avgRaise}%` : '8.4%';

  return (
    <Layout>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard label="Appraisals Due"    value={appraisalsDue} icon="📋" color="#FF6584" trend={-3}  delay={0.05} />
          <StatCard label="Promotions Pending" value="3"            icon="🚀" color="#6C63FF" delay={0.10} />
          <StatCard label="Avg Salary Raise"  value={avgRaise}      icon="💰" color="#43E8AC" trend={1}   delay={0.15} />
          <StatCard label="Retention Rate"    value="89%"           icon="🔒" color="#FFB547" trend={2}   delay={0.20} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <Card>
            <SectionHeader title="Performance by Dept" subtitle="Avg scores" />
            <BarChart data={data.goalCompletion.map(d => ({ ...d, score: d.rate }))} color="#FF6584" height={240} />
          </Card>

          <Card>
            <SectionHeader title="Recent Appraisals" />
            {appraisals.slice(0, 4).map((a, i) => (
              <div key={a._id || a.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                    {a.employee?.name || a.employee}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {a.type} · Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : a.due}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {a.raisePercent && <span style={{ fontSize: 13, fontWeight: 700, color: '#43E8AC' }}>{a.raisePercent}%</span>}
                  <Badge status={(a.status || '').toLowerCase().replace(/_/g, '-')} />
                </div>
              </div>
            ))}
            {appraisals.length === 0 && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No appraisals yet</div>
            )}
          </Card>

          <Card style={{ gridColumn: 'span 2' }}>
            <SectionHeader title="Quick Actions" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {[
                { label: 'Start Appraisal Cycle', icon: '📋', color: '#6C63FF', path: '/hr/appraisal'    },
                { label: 'Generate Reports',      icon: '📊', color: '#43E8AC', path: '/hr/performance'  },
                { label: 'Review Promotions',     icon: '🚀', color: '#FF6584', path: '/hr/promotions'   },
                { label: 'Send Reminders',        icon: '🔔', color: '#FFB547', path: '/hr/recruitment'  },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)} style={{
                  padding: '16px 12px',
                  background: `${a.color}12`, border: `1px solid ${a.color}25`,
                  borderRadius: 'var(--r-md)', cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${a.color}28`; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 16px ${a.color}25`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${a.color}12`; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: a.color }}>{a.label}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// ─── Appraisal ────────────────────────────────────────────────────────────────
export function Appraisal() {
  const [appraisals, setAppraisals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: '', type: 'ANNUAL', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchAppraisals().catch(() => ({ appraisals: [] })),
      fetchEmployees({ limit: 100 }).catch(() => []),
    ]).then(([aRes, empRes]) => {
      setAppraisals(aRes.appraisals || []);
      const empList = Array.isArray(empRes) ? empRes : empRes.employees || [];
      setEmployees(empList);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);
  if (loading) return <Layout><Loader /></Layout>;

  const handleCreate = async () => {
    if (!form.employee || !form.dueDate) { setError('Please select employee and due date'); return; }
    setSaving(true); setError('');
    try {
      await createAppraisal(form);
      setShowForm(false);
      setForm({ employee: '', type: 'ANNUAL', dueDate: '' });
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleProcess = async (id, currentStatus) => {
    setProcessingId(id);
    const nextStatus = currentStatus === 'SCHEDULED' ? 'PENDING' : 'IN_PROGRESS';
    try {
      await updateAppraisal(id, { status: nextStatus });
      load();
    } catch (e) { setError(e.message); }
    finally { setProcessingId(null); }
  };

  const STATUS_LABEL = { SCHEDULED: 'scheduled', PENDING: 'pending', IN_PROGRESS: 'in-progress', COMPLETED: 'completed' };

  return (
    <Layout>
      <div style={{ maxWidth: 1000 }}>
        {error && (
          <div style={{ padding: '10px 16px', background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 8, color: '#FF6584', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 24, color: 'var(--role-color, #f43f5e)', letterSpacing: '-0.5px', margin: 0 }}>Appraisals</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Manage salary reviews and appraisal cycles · Connected to MongoDB</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>+ Start New Cycle</Button>
        </div>

        {showForm && (
          <Card style={{ marginBottom: 20 }}>
            <SectionHeader title="Schedule New Appraisal" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Employee *</label>
                <select value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                  <option value="">Select employee...</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} — {emp.department}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                  <option value="ANNUAL">Annual</option>
                  <option value="MID_YEAR">Mid-Year</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="PROBATION">Probation</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Due Date *</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : 'Schedule'}</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Employee','Type','Due Date','Status','Raise','Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appraisals.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No appraisals found. Run the seed script or add a new appraisal.</td></tr>
              )}
              {appraisals.map(a => (
                <tr key={a._id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,101,132,0.15)', border: '1px solid rgba(255,101,132,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, color: '#FF6584' }}>
                        {(a.employee?.name || '?').split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{a.employee?.name || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.employee?.department}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)' }}>{a.type?.replace(/_/g, '-')}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '12px' }}><Badge status={STATUS_LABEL[a.status] || a.status?.toLowerCase()} /></td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-body)', fontWeight: 500, color: a.raisePercent ? '#43E8AC' : 'var(--text-muted)', fontSize: 14 }}>
                    {a.raisePercent ? `${a.raisePercent}%` : '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Button
                      variant={a.status === 'COMPLETED' ? 'secondary' : 'primary'}
                      size="sm"
                      disabled={processingId === a._id}
                      onClick={() => a.status !== 'COMPLETED' && handleProcess(a._id, a.status)}
                    >
                      {a.status === 'COMPLETED' ? 'View' : processingId === a._id ? '...' : 'Process'}
                    </Button>
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

// ─── Promotions ───────────────────────────────────────────────────────────────
export function Promotions() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch('/api/promotions/all', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => { setPromos(Array.isArray(d) ? d : d.promotions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const reviewPromotion = async (id, status) => {
    try {
      await fetch(`/api/promotions/${id}/review`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ status }),
      });
      load();
    } catch {}
  };

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 24, color: 'var(--role-color, #f43f5e)', letterSpacing: '-0.5px', margin: 0 }}>Promotions</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Manage promotion requests recommended by managers</p>
          </div>
        </div>

        {promos.length === 0 && (
          <Card style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No promotion requests yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Managers can recommend promotions from their dashboard</div>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {promos.map(p => {
            const empName = p.employee?.name || p.employee || '?';
            const initials = empName.split(' ').map(n => n[0]).join('');
            return (
              <Card key={p._id} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, flexShrink: 0, background: 'linear-gradient(135deg, rgba(108,99,255,0.25), rgba(67,232,172,0.15))', border: '1px solid rgba(108,99,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 16, color: '#6C63FF' }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{empName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>{p.currentDesignation}</span><span style={{ color: '#6C63FF' }}>→</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.proposedDesignation}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{p.justification}</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 100 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Type</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.type}</div>
                  {p.incrementPercent > 0 && <div style={{ color: '#43E8AC', fontSize: 12 }}>+{p.incrementPercent}%</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <Badge status={(p.status||'').toLowerCase()} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    {p.status === 'PENDING' && <Button variant="success" size="sm" onClick={() => reviewPromotion(p._id, 'APPROVED')}>Approve</Button>}
                    {p.status === 'PENDING' && <Button variant="danger" size="sm" onClick={() => reviewPromotion(p._id, 'REJECTED')}>Decline</Button>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
