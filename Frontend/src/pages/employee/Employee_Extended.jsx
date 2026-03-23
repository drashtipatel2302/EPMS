import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Card, SectionHeader, Badge, Button, StatCard } from '../../components/UI';
import Loader from '../../components/Loader';
import { getAuthHeaders } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ─── Shared helpers ────────────────────────────────────────────────────────────
const apiFetch = async (path, method = 'GET', body = null) => {
  const opts = { method, headers: getAuthHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const inp = {
  padding: '9px 12px', background: 'var(--bg-elevated)',
  border: '1px solid var(--border)', borderRadius: 8,
  color: 'var(--text-primary)', fontSize: 13,
  outline: 'none', width: '100%', fontFamily: 'inherit',
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 13,
      background: type === 'error' ? '#FF6584' : '#43E8AC', color: '#fff',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    }}>
      {type === 'error' ? '⚠️' : '✅'} {msg}
    </div>
  );
}

// ─── VIEW ANNOUNCEMENTS ───────────────────────────────────────────────────────
export function ViewAnnouncements() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast]   = useState(null);

  const load = useCallback(() => {
    apiFetch('/api/announcements/my')
      .then(d => setItems(d.announcements || []))
      .catch(e => setToast({ msg: e.message, type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try {
      await apiFetch(`/api/announcements/${id}/read`, 'PUT');
      setItems(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
    } catch {}
  };

  const CAT_COLORS = { GENERAL: '#6C63FF', HR: '#FF6584', POLICY: '#FFB547', EVENT: '#43E8AC', URGENT: '#FF6584', TRAINING: '#8B85FF' };
  const categories = ['all', ...new Set(items.map(a => a.category).filter(Boolean))];
  const filtered   = filter === 'all' ? items : items.filter(a => a.category === filter);
  const unreadCount = items.filter(a => !a.isRead).length;

  return (
    <Layout>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ maxWidth: 820 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 24, color: 'var(--role-color, #10b981)' }}>Announcements</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Company-wide news and updates</p>
          </div>
          {unreadCount > 0 && (
            <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(255,101,132,0.12)', color: '#FF6584', fontSize: 12, fontWeight: 700 }}>
              {unreadCount} unread
            </div>
          )}
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {categories.map(f => {
            const c = CAT_COLORS[f] || '#6C63FF';
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: filter === f ? c : 'var(--bg-elevated)',
                color:      filter === f ? '#fff' : 'var(--text-secondary)',
                border:     `1px solid ${filter === f ? c : 'var(--border)'}`,
                textTransform: 'capitalize', transition: 'all 0.15s',
              }}>{f}</button>
            );
          })}
        </div>

        {loading ? <Loader /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.length === 0 ? (
              <Card><div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📢</div>No announcements yet.
              </div></Card>
            ) : filtered.map(a => {
              const c = CAT_COLORS[a.category] || '#6C63FF';
              return (
                <Card key={a._id} style={{ borderLeft: `4px solid ${c}`, opacity: a.isRead ? 0.82 : 1, position: 'relative' }}>
                  {!a.isRead && (
                    <div style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: '50%', background: '#FF6584' }} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${c}15`, color: c }}>{a.category}</span>
                      <span style={{
                        padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: a.priority === 'HIGH' ? 'rgba(255,101,132,0.12)' : a.priority === 'LOW' ? 'rgba(67,232,172,0.12)' : 'rgba(255,181,71,0.12)',
                        color:      a.priority === 'HIGH' ? '#FF6584'               : a.priority === 'LOW' ? '#43E8AC'               : '#FFB547',
                      }}>{a.priority}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{a.content}</div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {a.postedBy?.name}</div>
                    {!a.isRead && (
                      <button
                        onClick={() => markRead(a._id)}
                        style={{
                          padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          background: 'rgba(67,232,172,0.1)', color: '#43E8AC',
                          border: '1px solid rgba(67,232,172,0.28)', transition: 'all 0.15s',
                        }}
                      >Mark as read ✓</button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

// ─── DAILY WORK REPORT ────────────────────────────────────────────────────────
export function DailyWorkReport() {
  const [reports, setReports]     = useState([]);
  const [todayReport, setTodayReport] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]           = useState({ tasksCompleted: '', tasksInProgress: '', blockers: '', hoursWorked: 8, mood: 'GOOD', notes: '' });
  const [toast, setToast]         = useState(null);
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const MOODS = [
    { key: 'GREAT',      label: '😄 Great',      color: '#43E8AC' },
    { key: 'GOOD',       label: '🙂 Good',       color: '#6C63FF' },
    { key: 'NEUTRAL',    label: '😐 Neutral',    color: '#FFB547' },
    { key: 'STRESSED',   label: '😓 Stressed',   color: '#FF6584' },
    { key: 'STRUGGLING', label: '😣 Struggling', color: '#FF6584' },
  ];

  const load = useCallback(() => {
    Promise.all([
      apiFetch('/api/daily-reports/today'),
      apiFetch('/api/daily-reports/my'),
    ]).then(([t, r]) => {
      const today = t?.report || null;
      setTodayReport(today);
      setReports(r?.reports || []);
      if (today) setForm({
        tasksCompleted:  today.tasksCompleted   || '',
        tasksInProgress: today.tasksInProgress  || '',
        blockers:        today.blockers         || '',
        hoursWorked:     today.hoursWorked      || 8,
        mood:            today.mood             || 'GOOD',
        notes:           today.notes            || '',
      });
    }).catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.tasksCompleted.trim()) { showToast('Please describe tasks completed', 'error'); return; }
    setSubmitting(true);
    try {
      await apiFetch('/api/daily-reports', 'POST', form);
      showToast(todayReport ? 'Report updated!' : 'Report submitted!');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    setSubmitting(false);
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Layout>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ maxWidth: 920 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 24, color: 'var(--role-color, #10b981)' }}>Daily Work Report</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Submit your end-of-day work summary</p>
        </div>

        {todayReport && (
          <div style={{ padding: '10px 16px', background: 'rgba(67,232,172,0.08)', border: '1px solid rgba(67,232,172,0.25)', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#2dca8d', fontWeight: 600 }}>
            ✓ Report submitted for today. You can update it below.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
          {/* Form */}
          <Card>
            <SectionHeader title={todayReport ? "Update Today's Report" : "Today's Report"} subtitle={today} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>✅ Tasks Completed <span style={{ color: '#FF6584' }}>*</span></label>
                <textarea style={{ ...inp, resize: 'vertical' }} rows={4} placeholder="What did you work on today?" value={form.tasksCompleted} onChange={e => setForm(f => ({ ...f, tasksCompleted: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>🔄 Tasks In Progress</label>
                <textarea style={{ ...inp, resize: 'vertical' }} rows={2} placeholder="What are you still working on? (optional)" value={form.tasksInProgress} onChange={e => setForm(f => ({ ...f, tasksInProgress: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>🚧 Blockers / Issues</label>
                <textarea style={{ ...inp, resize: 'vertical' }} rows={2} placeholder="Any blockers? (optional)" value={form.blockers} onChange={e => setForm(f => ({ ...f, blockers: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>⏱ Hours Worked</label>
                  <input type="number" min={0} max={24} step={0.5} style={inp} value={form.hoursWorked} onChange={e => setForm(f => ({ ...f, hoursWorked: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>📝 Notes</label>
                  <input type="text" style={inp} placeholder="Optional" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>How was your day?</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {MOODS.map(m => (
                    <button key={m.key} onClick={() => setForm(f => ({ ...f, mood: m.key }))} style={{
                      flex: '1 1 80px', padding: '7px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      background: form.mood === m.key ? `${m.color}18` : 'var(--bg-elevated)',
                      color:      form.mood === m.key ? m.color : 'var(--text-muted)',
                      border:     `1px solid ${form.mood === m.key ? m.color : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}>{m.label}</button>
                  ))}
                </div>
              </div>
              <button
                onClick={submit}
                disabled={submitting}
                style={{
                  padding: '11px', borderRadius: 8, fontWeight: 700, fontSize: 14,
                  background: submitting ? 'var(--bg-elevated)' : 'linear-gradient(90deg, #6C63FF, #8B85FF)',
                  color: submitting ? 'var(--text-muted)' : '#fff',
                  border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)', transition: 'opacity 0.2s',
                }}
              >
                {submitting ? 'Submitting…' : (todayReport ? 'Update Report →' : 'Submit Report →')}
              </button>
            </div>
          </Card>

          {/* History */}
          <Card>
            <SectionHeader title="Past Reports" subtitle="Recent submissions" />
            {loading ? <Loader /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 540, overflowY: 'auto', paddingRight: 4 }}>
                {reports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)', fontSize: 13 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>No reports yet.
                  </div>
                ) : reports.map(r => {
                  const mood = MOODS.find(m => m.key === r.mood) || MOODS[1];
                  return (
                    <div key={r._id} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                            {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                          </span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${mood.color}15`, color: mood.color, fontWeight: 600 }}>
                            {mood.label}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.hoursWorked}h</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.tasksCompleted}</div>
                      {r.tasksInProgress && <div style={{ fontSize: 11, color: '#6C63FF', marginTop: 3 }}>🔄 {r.tasksInProgress}</div>}
                      {r.blockers && <div style={{ fontSize: 11, color: '#FFB547', marginTop: 3,  }}>⚠ {r.blockers}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// ─── GRIEVANCES ───────────────────────────────────────────────────────────────
export function MyGrievances() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ subject: '', description: '', priority: 'MEDIUM' });
  const [toast, setToast]           = useState(null);
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = useCallback(() => {
    apiFetch('/api/grievances/my')
      .then(d => setGrievances(Array.isArray(d) ? d : (d?.grievances || [])))
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      showToast('Subject and description are required', 'error'); return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/api/grievances', 'POST', form);
      showToast('Grievance submitted successfully');
      setForm({ subject: '', description: '', priority: 'MEDIUM' });
      load();
    } catch (e) { showToast(e.message, 'error'); }
    setSubmitting(false);
  };

  const STATUS_STYLE = {
    PENDING:      { bg: 'rgba(108,99,255,0.12)', color: '#8B85FF'  },
    UNDER_REVIEW: { bg: 'rgba(255,181,71,0.15)', color: '#FFB547'  },
    RESOLVED:     { bg: 'rgba(67,232,172,0.12)', color: '#43E8AC'  },
    CLOSED:       { bg: 'rgba(139,144,167,0.12)',color: '#8B90A7'  },
  };
  const PSTYLE = {
    HIGH:   { bg: 'rgba(255,101,132,0.12)', color: '#FF6584' },
    MEDIUM: { bg: 'rgba(255,181,71,0.12)',  color: '#FFB547' },
    LOW:    { bg: 'rgba(67,232,172,0.12)',  color: '#43E8AC' },
  };

  return (
    <Layout>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ maxWidth: 960 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 24, color: 'var(--role-color, #10b981)' }}>Grievances</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Submit and track your workplace grievances</p>
        </div>

        <div style={{ padding: '10px 16px', background: 'rgba(108,99,255,0.07)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 10, marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          🔒 All grievances are handled confidentially by the HR team.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 20 }}>
          {/* Submit Form */}
          <Card>
            <SectionHeader title="Submit Grievance" subtitle="Describe your concern" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Subject <span style={{ color: '#FF6584' }}>*</span></label>
                <input type="text" style={inp} placeholder="Brief title for your grievance" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description <span style={{ color: '#FF6584' }}>*</span></label>
                <textarea style={{ ...inp, resize: 'vertical' }} rows={5} placeholder="Describe the issue in detail. Be as specific as possible…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Priority</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} style={{
                      flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      background: form.priority === p ? `${PSTYLE[p].color}18` : 'var(--bg-elevated)',
                      color:      form.priority === p ? PSTYLE[p].color : 'var(--text-muted)',
                      border:     `1px solid ${form.priority === p ? PSTYLE[p].color : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}>{p}</button>
                  ))}
                </div>
              </div>
              <button
                onClick={submit}
                disabled={submitting}
                style={{
                  padding: '11px', borderRadius: 8, fontWeight: 700, fontSize: 14,
                  background: submitting ? 'var(--bg-elevated)' : 'linear-gradient(90deg, #6C63FF, #8B85FF)',
                  color: submitting ? 'var(--text-muted)' : '#fff',
                  border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)', transition: 'opacity 0.2s',
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Grievance →'}
              </button>
            </div>
          </Card>

          {/* My Grievances */}
          <Card>
            <SectionHeader title="My Grievances" subtitle={`${grievances.length} submitted`} />
            {loading ? <Loader /> : grievances.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📨</div>No grievances submitted yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 460, overflowY: 'auto', paddingRight: 4 }}>
                {grievances.map(g => {
                  const ss = STATUS_STYLE[g.status] || STATUS_STYLE.PENDING;
                  const ps = PSTYLE[g.priority]     || PSTYLE.MEDIUM;
                  return (
                    <div key={g._id} style={{ padding: '14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', flex: 1, marginRight: 10 }}>{g.subject}</span>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: ps.bg, color: ps.color }}>{g.priority}</span>
                          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.color }}>{g.status?.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{g.description}</div>
                      {g.resolution && (
                        <div style={{ fontSize: 12, padding: '6px 10px', background: 'rgba(67,232,172,0.08)', borderRadius: 6, borderLeft: '2px solid #43E8AC', color: '#2dca8d', marginBottom: 4 }}>
                          ✅ Resolution: {g.resolution}
                        </div>
                      )}
                      {g.notes && (
                        <div style={{ fontSize: 12, padding: '6px 10px', background: 'rgba(255,181,71,0.08)', borderRadius: 6, borderLeft: '2px solid #FFB547', color: '#cc9420' }}>
                          📝 HR Note: {g.notes}
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
                        Submitted {new Date(g.createdAt).toLocaleDateString('en-IN')}
                        {g.resolvedAt && <> · Resolved {new Date(g.resolvedAt).toLocaleDateString('en-IN')}</>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// ─── TRAINING RECORDS ─────────────────────────────────────────────────────────
export function MyTraining() {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const [error, setError]       = useState(null);
  const [updating, setUpdating] = useState(null); // record being updated
  const [upForm, setUpForm]     = useState({ employeeStatus: '', employeeNote: '' });
  const [upSaving, setUpSaving] = useState(false);
  const [upSuccess, setUpSuccess] = useState('');

  const load = () => {
    apiFetch('/api/training/my')
      .then(d => setRecords(d.records || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleOpenUpdate = (r) => {
    setUpForm({ employeeStatus: r.employeeStatus || 'NOT_STARTED', employeeNote: r.employeeNote || '' });
    setUpdating(r);
    setUpSuccess('');
  };

  const handleSaveUpdate = async () => {
    if (!upForm.employeeStatus) return;
    setUpSaving(true);
    try {
      await apiFetch(`/api/training/my/${updating._id}`, 'PUT', upForm);
      setUpSuccess('Progress updated! HR has been notified.');
      setUpdating(null);
      load();
    } catch(e) { setError(e.message); }
    finally { setUpSaving(false); }
  };

  const STATUS_STYLE = {
    UPCOMING:    { bg: 'rgba(108,99,255,0.12)', color: '#8B85FF', label: 'Upcoming'    },
    IN_PROGRESS: { bg: 'rgba(255,181,71,0.15)', color: '#FFB547', label: 'In Progress' },
    COMPLETED:   { bg: 'rgba(67,232,172,0.12)', color: '#43E8AC', label: 'Completed'   },
    CANCELLED:   { bg: 'rgba(139,144,167,0.12)',color: '#8B90A7', label: 'Cancelled'   },
  };

  const filters = ['ALL', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED'];
  const filtered = filter === 'ALL' ? records : records.filter(r => r.status === filter);

  const total      = records.length;
  const completed  = records.filter(r => r.status === 'COMPLETED').length;
  const inProgress = records.filter(r => r.status === 'IN_PROGRESS').length;
  const avgScore   = records.filter(r => r.score).length
    ? Math.round(records.filter(r => r.score).reduce((s, r) => s + r.score, 0) / records.filter(r => r.score).length)
    : null;

  return (
    <Layout>
      <div style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 24, color: 'var(--role-color, #10b981)' }}>Training Records</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Your assigned courses and learning progress</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.2)', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#FF6584' }}>⚠️ {error}</div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Courses"  value={total}       icon="📚" color="#6C63FF" delay={0.05} />
          <StatCard label="In Progress"    value={inProgress}  icon="🔄" color="#FFB547" delay={0.08} />
          <StatCard label="Completed"      value={completed}   icon="🏆" color="#43E8AC" delay={0.11} />
          <StatCard label="Avg Score"      value={avgScore ? `${avgScore}%` : '—'} icon="⭐" color="#FFB547" delay={0.14} />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: filter === f ? '#6C63FF' : 'var(--bg-elevated)',
              color:      filter === f ? '#fff'    : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? '#6C63FF' : 'var(--border)'}`,
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}>{f === 'ALL' ? 'All' : f.replace('_', ' ')}</button>
          ))}
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 13 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
              No training records found.
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(r => {
              const ss = STATUS_STYLE[r.status] || STATUS_STYLE.UPCOMING;
              const startDate = new Date(r.startDate);
              const endDate   = new Date(r.endDate);
              const totalDays = Math.ceil((endDate - startDate) / 86400000);
              const progressDays = r.status === 'COMPLETED' ? totalDays : Math.max(0, Math.ceil((new Date() - startDate) / 86400000));
              const pct = r.status === 'COMPLETED' ? 100 : Math.min(100, Math.round((progressDays / totalDays) * 100));

              const empStatusStyle = {
                NOT_STARTED: { color:'#8B90A7', label:'Not Started' },
                IN_PROGRESS:  { color:'#FFB547', label:'In Progress' },
                COMPLETED:    { color:'#43E8AC', label:'Completed'   },
                NEEDS_HELP:   { color:'#FF6584', label:'Needs Help'  },
              };
              const empSt = empStatusStyle[r.employeeStatus] || empStatusStyle.NOT_STARTED;
              return (
                <Card key={r._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{r.course}</div>
                        <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.color }}>{ss.label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, flexWrap: 'wrap' }}>
                        <span>🏢 {r.provider}</span>
                        <span>📂 {r.category}</span>
                        <span>📅 {startDate.toLocaleDateString('en-IN')} – {endDate.toLocaleDateString('en-IN')}</span>
                        {r.score && <span style={{ color: '#FFB547', fontWeight: 600 }}>⭐ Score: {r.score}%</span>}
                      </div>
                      {/* Progress Bar */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                          <span>Progress</span>
                          <span>{pct}%</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: ss.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                        </div>
                      </div>

                      {/* My progress update */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: r.employeeNote || r.hrFeedback ? 10 : 0, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>My Status:</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: empSt.color, padding: '2px 8px', borderRadius: 20, background: `${empSt.color}18` }}>{empSt.label}</span>
                        {r.employeeUpdatedAt && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Updated {new Date(r.employeeUpdatedAt).toLocaleDateString('en-IN')}</span>}
                      </div>

                      {r.employeeNote && (
                        <div style={{ marginBottom: 8, padding: '8px 12px', background: 'rgba(108,99,255,0.07)', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)', borderLeft: '3px solid #6C63FF' }}>
                          <span style={{ fontWeight: 600, color: '#6C63FF' }}>My Note: </span>{r.employeeNote}
                        </div>
                      )}

                      {/* HR Feedback */}
                      {r.hrFeedback && (
                        <div style={{ marginBottom: 8, padding: '8px 12px', background: 'rgba(67,232,172,0.07)', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)', borderLeft: '3px solid #43E8AC' }}>
                          <span style={{ fontWeight: 600, color: '#43E8AC' }}>HR Feedback: </span>{r.hrFeedback}
                          {r.hrRespondedAt && <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>— {new Date(r.hrRespondedAt).toLocaleDateString('en-IN')}</span>}
                        </div>
                      )}

                      {r.notes && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.notes}</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {r.status === 'COMPLETED' && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(67,232,172,0.12)', border: '2px solid #43E8AC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏆</div>
                          {r.certificate && <div style={{ fontSize: 10, color: '#43E8AC', marginTop: 4, fontWeight: 600 }}>Certified</div>}
                        </div>
                      )}
                      {r.status !== 'COMPLETED' && (
                        <button onClick={() => handleOpenUpdate(r)} style={{
                          padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: 'linear-gradient(135deg,#6C63FF,#8B85FF)', color: '#fff',
                          fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap',
                        }}>✏️ Update Progress</button>
                      )}
                    </div>
                  </div>

                  {/* Update Progress Modal inline */}
                  {updating?._id === r._id && (
                    <div style={{ marginTop: 14, padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>Update Your Progress</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</label>
                          <select value={upForm.employeeStatus} onChange={e => setUpForm(f => ({ ...f, employeeStatus: e.target.value }))}
                            style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="NEEDS_HELP">Needs Help</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Note to HR</label>
                          <input value={upForm.employeeNote} onChange={e => setUpForm(f => ({ ...f, employeeNote: e.target.value }))}
                            placeholder="e.g. Completed module 2, stuck on module 3..."
                            style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      {upSuccess && <div style={{ fontSize: 12, color: '#43E8AC', marginBottom: 8 }}>✓ {upSuccess}</div>}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleSaveUpdate} disabled={upSaving} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#6C63FF', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                          {upSaving ? 'Saving...' : 'Send to HR'}
                        </button>
                        <button onClick={() => setUpdating(null)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

// ─── MY PROFILE ──────────────────────────────────────────────────────────────
export function MyProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [editing, setEditing]         = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [form, setForm]               = useState({});
  const [pwForm, setPwForm]           = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [toast, setToast]             = useState(null);

  // OTP state for change-password
  const [pwStep, setPwStep]       = useState('form');   // 'form' | 'otp'
  const [pwOtp, setPwOtp]         = useState('      ');
  const [otpSent, setOtpSent]     = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [pwOtpError, setPwOtpError] = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  useEffect(() => {
    apiFetch('/api/employee/profile')
      .then(u => {
        setProfile(u);
        setForm({ name: u.name || '', phone: u.phone || '', address: u.address || '', emergencyContact: u.emergencyContact || '', bio: u.bio || '' });
      })
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/employee/profile', 'PUT', form);
      setProfile(res.user || res);
      setEditing(false);
      showToast('Profile updated!');
    } catch (e) { showToast(e.message, 'error'); }
    setSaving(false);
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) { showToast('Passwords do not match', 'error'); return; }
    if (pwForm.newPassword.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    if (!otpSent) {
      // Step 1: validate form then send OTP
      if (!pwForm.currentPassword) { showToast('Please enter your current password', 'error'); return; }
      setOtpLoading(true);
      try {
        await apiFetch('/api/employee/change-password/send-otp', 'POST', {});
        setPwStep('otp');
        setPwOtp('      ');
        setPwOtpError('');
        setOtpSent(true);
      } catch (e) { showToast(e.message, 'error'); }
      setOtpLoading(false);
    }
  };

  const confirmChangePassword = async () => {
    const cleanOtp = pwOtp.trim();
    if (cleanOtp.length < 6) { setPwOtpError('Please enter the complete 6-digit OTP.'); return; }
    setSaving(true);
    try {
      await apiFetch('/api/employee/change-password', 'PUT', {
        otp: cleanOtp,
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showToast('Password changed successfully!');
      setShowPwModal(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwStep('form');
      setPwOtp('      ');
      setOtpSent(false);
      setPwOtpError('');
    } catch (e) { setPwOtpError(e.message); }
    setSaving(false);
  };

  const ROLE_COLOR = { EMPLOYEE: '#43E8AC', HR: '#FF6584', MANAGER: '#38BDF8', SUPER_ADMIN: '#6C63FF' };

  if (loading) return <Layout><Loader /></Layout>;

  const u = profile;
  const initials = u?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ME';
  const roleColor = ROLE_COLOR[u?.role] || '#6C63FF';

  return (
    <Layout>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Password Modal */}
      {showPwModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', padding: 28, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {[1, 2].map(n => (
                <div key={n} style={{ height: 3, flex: 1, borderRadius: 4, background: (pwStep === 'form' ? 1 : 2) >= n ? '#6C63FF' : 'var(--border)', transition: 'background 0.3s' }} />
              ))}
            </div>

            {pwStep === 'form' ? (
              <>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>🔑 Change Password</div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>Enter your current and new password, then we'll send an OTP to verify.</p>
                {[
                  { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                  { key: 'newPassword',     label: 'New Password',     placeholder: 'At least 6 characters' },
                  { key: 'confirmPassword', label: 'Confirm Password', placeholder: 'Repeat new password' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input type="password" style={inp} placeholder={f.placeholder} value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button onClick={() => { setShowPwModal(false); setPwStep('form'); setOtpSent(false); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                  <button onClick={changePassword} disabled={otpLoading} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #6C63FF, #8B85FF)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                    {otpLoading ? 'Sending OTP…' : 'Send OTP →'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>📲 Enter OTP</div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>A 6-digit code has been sent to your registered email.</p>
                {pwOtpError && (
                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '8px 12px', color: '#f43f5e', fontSize: 12, marginBottom: 12 }}>
                    ⚠️ {pwOtpError}
                  </div>
                )}
                {/* Mini OTP boxes */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '20px 0' }}>
                  {[0,1,2,3,4,5].map(i => {
                    const inputsRef = [];
                    return (
                      <input
                        key={i}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={(pwOtp[i] || '').trim()}
                        onChange={e => {
                          const ch = e.target.value.replace(/\D/g,'').slice(-1);
                          const arr = (pwOtp + '      ').slice(0,6).split('');
                          arr[i] = ch;
                          setPwOtp(arr.join(''));
                          if (ch) {
                            const next = e.target.parentElement.children[i+1];
                            if (next) next.focus();
                          }
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Backspace' && !e.target.value && i > 0) {
                            const prev = e.target.parentElement.children[i-1];
                            if (prev) prev.focus();
                          }
                        }}
                        onPaste={e => {
                          const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
                          setPwOtp(p.padEnd(6,' ').slice(0,6));
                          e.preventDefault();
                        }}
                        style={{
                          width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 700,
                          border: (pwOtp[i]||'').trim() ? '2px solid #6C63FF' : '1.5px solid var(--border)',
                          borderRadius: 8,
                          background: (pwOtp[i]||'').trim() ? 'rgba(108,99,255,0.07)' : 'var(--bg-elevated)',
                          color: 'var(--text-primary)', outline: 'none', caretColor: 'transparent',
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setPwStep('form'); setPwOtpError(''); setOtpSent(false); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
                  <button onClick={confirmChangePassword} disabled={saving} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: 'linear-gradient(90deg, #6C63FF, #8B85FF)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                    {saving ? 'Verifying…' : 'Confirm Change'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 24, color: 'var(--role-color, #10b981)' }}>My Profile</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>View and update your personal information</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
          {/* Profile Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card style={{ textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 700, color: '#fff',
                margin: '0 auto 14px',
                boxShadow: `0 8px 24px ${roleColor}40`,
              }}>{initials}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{u?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{u?.designation}</div>
              <div style={{ marginTop: 8, display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${roleColor}18`, color: roleColor }}>
                {u?.role?.replace('_', ' ')}
              </div>
              {u?.bio && (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,  }}>"{u.bio}"</div>
              )}
            </Card>

            <Card style={{ padding: '16px 18px' }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Quick Info</div>
              {[
                { icon: '🏢', label: 'Department',  value: u?.department },
                { icon: '🪪', label: 'Employee ID', value: u?.employeeId || '—' },
                { icon: '📧', label: 'Email',       value: u?.email },
                { icon: '📅', label: 'Joined',      value: u?.joiningDate ? new Date(u.joiningDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—' },
                { icon: '✅', label: 'Status',      value: u?.isActive ? 'Active' : 'Inactive' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Edit Panel */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <SectionHeader title="Personal Information" subtitle="Keep your details up to date" />
              {!editing ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowPwModal(true)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    🔑 Password
                  </button>
                  <button onClick={() => setEditing(true)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'linear-gradient(90deg, #6C63FF, #8B85FF)', color: '#fff', fontFamily: 'var(--font-body)' }}>
                    ✏️ Edit
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditing(false)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>Cancel</button>
                  <button onClick={save} disabled={saving} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: '#43E8AC', color: '#fff', fontFamily: 'var(--font-body)' }}>
                    {saving ? 'Saving…' : '✓ Save'}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { key: 'name',             label: 'Full Name',         type: 'text',  placeholder: 'Your full name' },
                { key: 'phone',            label: 'Phone Number',      type: 'tel',   placeholder: '+91 XXXXX XXXXX' },
                { key: 'address',          label: 'Address',           type: 'text',  placeholder: 'Your address' },
                { key: 'emergencyContact', label: 'Emergency Contact', type: 'text',  placeholder: 'Name & phone' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{field.label}</label>
                  {editing ? (
                    <input
                      type={field.type}
                      style={inp}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    />
                  ) : (
                    <div style={{ padding: '9px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 13, color: form[field.key] ? 'var(--text-primary)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      {form[field.key] || <span style={{  }}>Not set</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bio - full width */}
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Bio / About Me</label>
              {editing ? (
                <textarea style={{ ...inp, resize: 'vertical' }} rows={3} placeholder="A short bio about yourself…" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
              ) : (
                <div style={{ padding: '9px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 13, color: form.bio ? 'var(--text-secondary)' : 'var(--text-muted)', border: '1px solid var(--border)', minHeight: 60 }}>
                  {form.bio || <span style={{  }}>No bio added yet.</span>}
                </div>
              )}
            </div>

            {/* Read-only fields */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>System Information (Read-only)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Email',       value: u?.email },
                  { label: 'Role',        value: u?.role?.replace('_', ' ') },
                  { label: 'Department',  value: u?.department },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', border: '1px solid var(--border)', opacity: 0.75 }}>{f.value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// Legacy exports for backward compatibility
export { ViewAnnouncements as MyAnnouncements };
export { MyGrievances as Grievances };
export { MyTraining as Training };
