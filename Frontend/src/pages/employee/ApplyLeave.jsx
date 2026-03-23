import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Card, SectionHeader, Badge, Button, ProgressBar } from '../../components/UI';
import Loader from '../../components/Loader';
import { getAuthHeaders } from '../../services/api';

const apiFetch = async (path, method = 'GET', body = null) => {
  const opts = { method, headers: getAuthHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
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

const inp = {
  padding: '9px 12px', background: 'var(--bg-elevated)',
  border: '1px solid var(--border)', borderRadius: 8,
  color: 'var(--text-primary)', fontSize: 13,
  outline: 'none', width: '100%', fontFamily: 'inherit',
};

const LEAVE_TYPES = [
  { value: 'CASUAL',    label: 'Casual Leave' },
  { value: 'MEDICAL',   label: 'Medical / Sick Leave' },
  { value: 'PERSONAL',  label: 'Personal Leave' },
  { value: 'ANNUAL',    label: 'Annual Leave' },
  { value: 'OTHER',     label: 'Other' },
];

const POLICY_COLORS = ['#6C63FF', '#FF6584', '#FFB547', '#43E8AC', '#8B85FF'];

export default function ApplyLeave() {
  const [leaves, setLeaves]     = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]         = useState({ leaveType: 'CASUAL', fromDate: '', toDate: '', reason: '' });
  const [toast, setToast]       = useState(null);
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = useCallback(() => {
    Promise.all([
      apiFetch('/api/leave/my'),
      apiFetch('/api/hr/leave-policies').catch(() => ({ policies: [] })),
    ]).then(([l, p]) => {
      setLeaves(Array.isArray(l) ? l : (l?.leaves || []));
      setPolicies(p?.policies || []);
    }).catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalDays = form.fromDate && form.toDate
    ? Math.max(1, Math.ceil((new Date(form.toDate) - new Date(form.fromDate)) / 86400000) + 1)
    : null;

  const submit = async () => {
    if (!form.fromDate || !form.toDate || !form.reason.trim()) {
      showToast('Please fill all required fields', 'error'); return;
    }
    if (new Date(form.toDate) < new Date(form.fromDate)) {
      showToast('To date cannot be before from date', 'error'); return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/api/leave/apply', 'POST', form);
      showToast('Leave request submitted successfully!');
      setForm({ leaveType: 'CASUAL', fromDate: '', toDate: '', reason: '' });
      load();
    } catch (e) { showToast(e.message, 'error'); }
    setSubmitting(false);
  };

  const STATUS_LABEL = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'overdue', CANCELLED: 'inactive' };

  return (
    <Layout>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ maxWidth: 960 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 24, color: 'var(--role-color, #10b981)' }}>Leave Application</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Apply for leave and track your requests</p>
        </div>

        {/* Leave Policies */}
        {policies.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(policies.length, 4)}, 1fr)`, gap: 14, marginBottom: 24 }}>
            {policies.map((p, i) => {
              const c = POLICY_COLORS[i % POLICY_COLORS.length];
              return (
                <div key={p._id} style={{
                  background: 'var(--bg-surface)', border: `1px solid ${c}25`,
                  borderRadius: 'var(--r-md)', padding: '14px 16px',
                  borderTop: `3px solid ${c}`,
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.type}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 24, color: c }}>{p.days} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-secondary)' }}>days</span></div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {p.paid ? '✅ Paid' : '❌ Unpaid'}{p.carryOver ? ' · Carry-over' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Apply Form */}
          <Card>
            <SectionHeader title="Apply for Leave" subtitle="Fill in the details below" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Leave Type</label>
                <select style={inp} value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}>
                  {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>From Date</label>
                  <input type="date" style={inp} value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>To Date</label>
                  <input type="date" style={inp} value={form.toDate} min={form.fromDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} />
                </div>
              </div>

              {totalDays && (
                <div style={{ padding: '8px 14px', background: 'rgba(108,99,255,0.08)', borderRadius: 8, fontSize: 12, color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  📅 <span>Duration: <strong>{totalDays} day{totalDays > 1 ? 's' : ''}</strong></span>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Reason <span style={{ color: '#FF6584' }}>*</span></label>
                <textarea style={{ ...inp, resize: 'vertical' }} rows={3} placeholder="Briefly explain your reason for leave…" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
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
                {submitting ? 'Submitting…' : 'Submit Request →'}
              </button>
            </div>
          </Card>

          {/* My Requests */}
          <Card>
            <SectionHeader title="My Requests" subtitle={`${leaves.length} total application${leaves.length !== 1 ? 's' : ''}`} />
            {loading ? <Loader /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
                {leaves.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted)', fontSize: 13 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>No leave requests yet.
                  </div>
                ) : leaves.map(l => (
                  <div key={l._id} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                        {l.leaveType?.replace(/_/g, ' ')} Leave
                      </span>
                      <Badge status={STATUS_LABEL[l.status] || l.status?.toLowerCase()} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(l.fromDate).toLocaleDateString('en-IN')} → {new Date(l.toDate).toLocaleDateString('en-IN')}
                      {l.totalDays && <strong style={{ color: 'var(--text-secondary)' }}> · {l.totalDays} day{l.totalDays > 1 ? 's' : ''}</strong>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3,  }}>"{l.reason}"</div>
                    {l.managerRemarks && (
                      <div style={{ fontSize: 11, marginTop: 6, padding: '5px 10px', background: 'rgba(108,99,255,0.06)', borderRadius: 6, color: '#6C63FF', borderLeft: '2px solid #6C63FF' }}>
                        Manager note: {l.managerRemarks}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                      Applied {new Date(l.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
