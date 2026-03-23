import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Card, SectionHeader, ProgressBar, Button } from '../../components/UI';
import Loader from '../../components/Loader';
import { fetchAllPerformance, fetchEmployees } from '../../services/api';

const ROLE_COLORS = { SUPER_ADMIN: '#6C63FF', HR: '#FF6584', MANAGER: '#38BDF8', EMPLOYEE: '#43E8AC' };
const STAR_COLOR = '#FFB547';

const ratingLabel = (r) => {
  if (!r) return { label: 'Not Rated', color: '#888' };
  if (r >= 4.5) return { label: 'Outstanding',           color: '#43E8AC' };
  if (r >= 3.5) return { label: 'Exceeds Expectations',  color: '#6C63FF' };
  if (r >= 2.5) return { label: 'Meets Expectations',    color: '#FFB547' };
  if (r >= 1.5) return { label: 'Below Expectations',    color: '#FF9548' };
  return                { label: 'Needs Improvement',    color: '#FF6584' };
};

const Stars = ({ val, max = 5, size = 13 }) => (
  <span style={{ fontSize: size, letterSpacing: 1 }}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} style={{ color: i < Math.round(val || 0) ? STAR_COLOR : 'var(--border)' }}>★</span>
    ))}
  </span>
);

const MetricBar = ({ label, value, color }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{value ?? '—'}/5</span>
    </div>
    <ProgressBar value={value || 0} max={5} color={color} />
  </div>
);

function DetailModal({ item, onClose }) {
  if (!item) return null;
  const color = ROLE_COLORS[item.employee?.role] || '#aaa';
  const ini = (item.employee?.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const rl = ratingLabel(item.avgOverall);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 560, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color }}>
              {ini}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>{item.employee?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {item.employee?.designation || '—'} · {item.employee?.department || '—'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Overall score banner */}
        <div style={{ background: `${rl.color}12`, border: `1px solid ${rl.color}30`, borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: rl.color, textTransform: 'uppercase', letterSpacing: 0.8 }}>Overall Rating</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: rl.color, marginTop: 2 }}>{item.avgOverall ?? 'N/A'}<span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>/5</span></div>
            <div style={{ fontSize: 12, color: rl.color, marginTop: 2 }}>{rl.label}</div>
          </div>
          <Stars val={item.avgOverall} size={22} />
        </div>

        {/* Metrics */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Performance Breakdown (Averages)</div>
          <MetricBar label="Task Completion"  value={item.avgTaskCompletion}  color="#6C63FF" />
          <MetricBar label="Teamwork"          value={item.avgTeamwork}         color="#43E8AC" />
          <MetricBar label="Communication"     value={item.avgCommunication}    color="#FFB547" />
          <MetricBar label="Punctuality"       value={item.avgPunctuality}      color="#FF6584" />
        </div>

        {/* Evaluation history */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
            Evaluation History ({item.evalCount})
          </div>
          {(item.allEvals || []).map((ev, i) => (
            <div key={ev._id || i} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 14px', marginBottom: 10, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.reviewPeriod}</span>
                  {ev.reviewMonth && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{ev.reviewMonth}</span>}
                </div>
                <Stars val={ev.overallRating} size={12} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: ev.remarks ? 6 : 0 }}>
                By: {ev.evaluatedBy?.name || '—'} · {new Date(ev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              {ev.remarks && <div style={{ fontSize: 12, color: 'var(--text-secondary)',  borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 6 }}>"{ev.remarks}"</div>}
            </div>
          ))}
          {(!item.allEvals || item.allEvals.length === 0) && (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>No evaluations found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmployeePerformance() {
  const [summary,   setSummary]   = useState([]);
  const [allEvals,  setAllEvals]  = useState([]);
  const [allEmps,   setAllEmps]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [tab,       setTab]       = useState('overview');
  const [search,    setSearch]    = useState('');
  const [deptFilter,setDeptFilter]= useState('all');
  const [sortBy,    setSortBy]    = useState('rating_desc');
  const [detail,    setDetail]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [perfData, empData] = await Promise.all([
        fetchAllPerformance(),
        fetchEmployees({ limit: 500 }),
      ]);
      const { evaluations = [], summary: s = [] } = perfData;
      setAllEvals(evaluations);
      setAllEmps(empData.employees || []);

      // Merge summary with full evals list for detail view
      const enriched = s.map(item => ({
        ...item,
        allEvals: evaluations.filter(ev => ev.employee?._id === item.employee?._id),
      }));

      // Also add employees with no evaluations
      const evalledIds = new Set(s.map(x => x.employee?._id?.toString()));
      const noEval = (empData.employees || [])
        .filter(e => !evalledIds.has(e._id?.toString()))
        .map(e => ({ employee: e, evalCount: 0, avgOverall: null, avgTaskCompletion: null, avgTeamwork: null, avgCommunication: null, avgPunctuality: null, allEvals: [] }));

      setSummary([...enriched, ...noEval]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const departments = [...new Set(allEmps.map(e => e.department).filter(Boolean))];

  const filtered = summary
    .filter(s => {
      const name = s.employee?.name?.toLowerCase() || '';
      const dept = s.employee?.department || '';
      return (
        (deptFilter === 'all' || dept === deptFilter) &&
        (search === '' || name.includes(search.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'rating_desc') return (b.avgOverall || 0) - (a.avgOverall || 0);
      if (sortBy === 'rating_asc')  return (a.avgOverall || 0) - (b.avgOverall || 0);
      if (sortBy === 'name')        return (a.employee?.name || '').localeCompare(b.employee?.name || '');
      if (sortBy === 'evals_desc')  return b.evalCount - a.evalCount;
      return 0;
    });

  const rated    = summary.filter(s => s.avgOverall !== null);
  const avgScore = rated.length ? (rated.reduce((s, x) => s + x.avgOverall, 0) / rated.length).toFixed(1) : 'N/A';
  const top5     = [...rated].sort((a, b) => b.avgOverall - a.avgOverall).slice(0, 5);
  const atRisk   = rated.filter(s => s.avgOverall < 2.5);

  const Tab = ({ label, id }) => (
    <button onClick={() => setTab(id)} style={{ padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === id ? '#6C63FF' : 'var(--bg-elevated)', color: tab === id ? '#fff' : 'var(--text-secondary)', border: tab === id ? 'none' : '1px solid var(--border)', transition: 'all .15s' }}>
      {label}
    </button>
  );

  const INP = { padding: '9px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-primary)', fontSize: 13, outline: 'none' };

  return (
    <Layout>
      {detail && <DetailModal item={detail} onClose={() => setDetail(null)} />}
      <div style={{ maxWidth: 1200 }}>

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--role-color)', marginBottom: 4 }}>Employee Performance</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Company-wide performance overview — all employees, all departments
          </div>
        </div>

        {/* KPI tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
          {[
            { label: 'Total Employees',    value: summary.length,          icon: '👥', color: '#6C63FF' },
            { label: 'Avg Company Rating', value: avgScore,                icon: '⭐', color: '#FFB547' },
            { label: 'Evaluated Staff',    value: rated.length,            icon: '📊', color: '#43E8AC' },
            { label: 'Needs Attention',    value: atRisk.length,           icon: '⚠️', color: '#FF6584' },
          ].map(s => (
            <Card key={s.label} style={{ padding: '16px 18px', borderLeft: `3px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <span style={{ fontSize: 10, color: s.color, fontWeight: 700, textTransform: 'uppercase' }}>TOTAL</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          <Tab label="📊 All Employees" id="overview" />
          <Tab label="🏆 Top Performers" id="top" />
          <Tab label="⚠️ Needs Attention" id="risk" />
          <Tab label="📋 Recent Evaluations" id="recent" />
        </div>

        {error && (
          <div style={{ background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 10, padding: '12px 16px', color: '#FF6584', marginBottom: 18 }}>
            ⚠ {error}
          </div>
        )}

        {loading ? <Loader /> : (
          <>
            {/* ── ALL EMPLOYEES ── */}
            {tab === 'overview' && (
              <Card>
                <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input placeholder="🔍 Search by name…" value={search} onChange={e => setSearch(e.target.value)}
                    style={{ ...INP, flex: 1, minWidth: 180 }}
                    onFocus={e => e.target.style.borderColor = '#6C63FF'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={INP}>
                    <option value="all">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={INP}>
                    <option value="rating_desc">Highest Rating</option>
                    <option value="rating_asc">Lowest Rating</option>
                    <option value="name">Name A–Z</option>
                    <option value="evals_desc">Most Evaluated</option>
                  </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(90deg, #4f46e5 0%, #6d64f0 100%)' }}>
                        {['Employee', 'Department', 'Role', 'Evaluations', 'Avg Rating', 'Breakdown', 'Status', 'Action'].map((h, i, arr) => (
                          <th key={h} style={{ padding: '13px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1.1, whiteSpace: 'nowrap', borderBottom: 'none', borderRadius: i === 0 ? '10px 0 0 10px' : i === arr.length - 1 ? '0 10px 10px 0' : 0 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={8} style={{ padding: '50px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>No employees found.
                        </td></tr>
                      ) : filtered.map(item => {
                        const emp = item.employee || {};
                        const c = ROLE_COLORS[emp.role] || '#aaa';
                        const ini = (emp.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        const rl = ratingLabel(item.avgOverall);
                        return (
                          <tr key={emp._id} style={{ borderBottom: '1px solid var(--border)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '11px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${c}20`, border: `1px solid ${c}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: c }}>{ini}</div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{emp.name}</div>
                                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{emp.designation || '—'}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '11px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{emp.department || '—'}</td>
                            <td style={{ padding: '11px 12px' }}>
                              <span style={{ padding: '3px 9px', borderRadius: 20, background: `${c}15`, color: c, fontSize: 11, fontWeight: 700 }}>
                                {(emp.role || '').replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 700, color: item.evalCount > 0 ? '#6C63FF' : 'var(--text-muted)' }}>
                              {item.evalCount}
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              {item.avgOverall !== null ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: 16, fontWeight: 800, color: rl.color }}>{item.avgOverall}</span>
                                  <Stars val={item.avgOverall} size={11} />
                                </div>
                              ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>}
                            </td>
                            <td style={{ padding: '11px 12px', minWidth: 130 }}>
                              {item.avgOverall !== null ? (
                                <div>
                                  {[
                                    { label: 'Task', val: item.avgTaskCompletion, color: '#6C63FF' },
                                    { label: 'Team', val: item.avgTeamwork,       color: '#43E8AC' },
                                  ].map(m => (
                                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                                      <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 30 }}>{m.label}</span>
                                      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${((m.val || 0) / 5) * 100}%`, background: m.color, borderRadius: 4 }} />
                                      </div>
                                      <span style={{ fontSize: 10, fontWeight: 700, color: m.color, width: 18 }}>{m.val}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No data</span>}
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${rl.color}15`, color: rl.color }}>
                                {rl.label}
                              </span>
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <button onClick={() => setDetail(item)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(108,99,255,0.4)', background: 'rgba(108,99,255,0.1)', color: '#9c8fff', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                                👁 View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ── TOP PERFORMERS ── */}
            {tab === 'top' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {top5.map((item, rank) => {
                    const emp = item.employee || {};
                    const c = ROLE_COLORS[emp.role] || '#aaa';
                    const ini = (emp.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const rl = ratingLabel(item.avgOverall);
                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                    return (
                      <Card key={emp._id} style={{ borderLeft: `3px solid ${rl.color}`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 32, opacity: 0.15 }}>{medals[rank]}</div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c}20`, border: `1px solid ${c}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: c }}>{ini}</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.department} · {emp.designation || '—'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: rl.color }}>{item.avgOverall}</div>
                            <div style={{ fontSize: 11, color: rl.color }}>{rl.label}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Stars val={item.avgOverall} size={16} />
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{item.evalCount} evaluation{item.evalCount !== 1 ? 's' : ''}</div>
                          </div>
                        </div>
                        <button onClick={() => setDetail(item)} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${rl.color}40`, background: `${rl.color}10`, color: rl.color, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                          View Full Report
                        </button>
                      </Card>
                    );
                  })}
                </div>
                {top5.length === 0 && (
                  <Card><div style={{ textAlign: 'center', padding: 50, color: 'var(--text-muted)' }}>No performance data available yet.</div></Card>
                )}
              </div>
            )}

            {/* ── AT RISK ── */}
            {tab === 'risk' && (
              <div>
                {atRisk.length === 0 ? (
                  <Card>
                    <div style={{ textAlign: 'center', padding: 60 }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#43E8AC' }}>No employees need attention right now!</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>All evaluated employees are performing well.</div>
                    </div>
                  </Card>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: 'rgba(255,101,132,0.08)', border: '1px solid rgba(255,101,132,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#FF6584' }}>
                      ⚠ <strong>{atRisk.length} employee{atRisk.length !== 1 ? 's' : ''}</strong> with rating below 2.5 need performance improvement plans.
                    </div>
                    {atRisk.map(item => {
                      const emp = item.employee || {};
                      const c = ROLE_COLORS[emp.role] || '#aaa';
                      const ini = (emp.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                      return (
                        <Card key={emp._id} style={{ borderLeft: '3px solid #FF6584' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c}20`, border: `1px solid ${c}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: c }}>{ini}</div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.department} · {emp.designation || emp.role}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#FF6584' }}>{item.avgOverall}/5</div>
                                <Stars val={item.avgOverall} size={12} />
                              </div>
                              <button onClick={() => setDetail(item)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,101,132,0.4)', background: 'rgba(255,101,132,0.1)', color: '#FF6584', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                                View Details
                              </button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── RECENT EVALUATIONS ── */}
            {tab === 'recent' && (
              <Card>
                <SectionHeader title="Recent Performance Evaluations" subtitle={`${allEvals.length} total evaluations`} />
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(90deg, #4f46e5 0%, #6d64f0 100%)' }}>
                        {['Employee', 'Evaluated By', 'Period', 'Month', 'Overall', 'Task', 'Teamwork', 'Communication', 'Punctuality', 'Date'].map((h, i, arr) => (
                          <th key={h} style={{ padding: '13px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1.1, whiteSpace: 'nowrap', borderBottom: 'none', borderRadius: i === 0 ? '10px 0 0 10px' : i === arr.length - 1 ? '0 10px 10px 0' : 0 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allEvals.length === 0 ? (
                        <tr><td colSpan={10} style={{ padding: '50px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>No evaluations found.
                        </td></tr>
                      ) : allEvals.slice(0, 50).map((ev, i) => {
                        const rl = ratingLabel(ev.overallRating);
                        return (
                          <tr key={ev._id || i} style={{ borderBottom: '1px solid var(--border)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.employee?.name || '—'}</td>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{ev.evaluatedBy?.name || '—'}</td>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{ev.reviewPeriod}</td>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{ev.reviewMonth || '—'}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: 20, background: `${rl.color}15`, color: rl.color, fontSize: 12, fontWeight: 700 }}>{ev.overallRating}/5</span>
                            </td>
                            {[ev.taskCompletion, ev.teamwork, ev.communication, ev.punctuality].map((val, j) => (
                              <td key={j} style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: val >= 4 ? '#43E8AC' : val >= 3 ? '#FFB547' : '#FF6584' }}>{val}/5</td>
                            ))}
                            <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)' }}>
                              {new Date(ev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
