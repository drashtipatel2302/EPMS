import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, SectionHeader, Badge, Button, StatCard } from '../../components/UI';
import Loader from '../../components/Loader';
import api from '../../services/api';

export default function LeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { api.getLeaveRequests().then(r => { setRequests(r); setLoading(false); }); }, []);
  if (loading) return <Layout><Loader /></Layout>;

  const handleAction = (id, action) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const TYPE_COLORS = { 'Sick Leave': '#FF6584', 'Casual Leave': '#FFB547', 'Annual Leave': '#6C63FF' };

  return (
    <Layout>
      <div style={{ maxWidth: 1000 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--role-color)', margin: 0, letterSpacing: '-0.3px' }}>Leave Requests</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Approve or reject team leave applications</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Requests" value={requests.length} icon="📋" color="#6C63FF" delay={0.05} />
          <StatCard label="Pending" value={requests.filter(r => r.status === 'pending').length} icon="⏳" color="#FFB547" delay={0.10} />
          <StatCard label="Approved" value={requests.filter(r => r.status === 'approved').length} icon="✅" color="#43E8AC" delay={0.15} />
          <StatCard label="Rejected" value={requests.filter(r => r.status === 'rejected').length} icon="❌" color="#FF6584" delay={0.20} />
        </div>

        <Card>
          <SectionHeader title="All Requests" subtitle="Manage team leave applications" />

          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['all','pending','approved','rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                textTransform: 'capitalize',
                background: filter === f ? '#6C63FF' : 'var(--bg-elevated)',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${filter === f ? '#6C63FF' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>{f}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px', borderRadius: 12,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: `${TYPE_COLORS[r.type] || '#6C63FF'}18`,
                  border: `1px solid ${TYPE_COLORS[r.type] || '#6C63FF'}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {r.type === 'Sick Leave' ? '🤒' : r.type === 'Annual Leave' ? '🏖️' : '🗓️'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{r.employee}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {r.type} · {r.from} → {r.to} · <strong style={{ color: 'var(--text-secondary)' }}>{r.days} day{r.days > 1 ? 's' : ''}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2,  }}>"{r.reason}"</div>
                </div>

                <Badge status={r.status} />

                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button variant="success" size="sm" onClick={() => handleAction(r.id, 'approved')}>Approve</Button>
                    <Button variant="danger" size="sm" onClick={() => handleAction(r.id, 'rejected')}>Reject</Button>
                  </div>
                )}
                {r.status !== 'pending' && (
                  <Button variant="secondary" size="sm">View</Button>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>No {filter} requests found.</div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
