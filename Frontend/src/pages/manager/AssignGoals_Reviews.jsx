import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, SectionHeader, Badge, Button, ProgressBar } from '../../components/UI';
import api from '../../services/api';
import Loader from '../../components/Loader';

// ─── Assign Goals ─────────────────────────────────────────────────────────────
export function AssignGoals() {
  const [users, setUsers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', due: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getUsers(), api.getGoals()]).then(([u, g]) => {
      setUsers(u.filter(x => x.role === 'employee'));
      setGoals(g);
      setLoading(false);
    });
  }, []);

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
          {/* Form */}
          <div>
            <Card style={{ marginBottom: 16 }}>
              <SectionHeader title="Assign New Goal" subtitle="Set a goal for a team member" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Assign To</label>
                  <select style={{
                    width: '100%', padding: '9px 12px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                  }} onChange={e => setSelected(e.target.value)}>
                    <option value="">Select employee…</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Goal Title</label>
                  <input
                    placeholder="e.g. Improve API response time by 30%"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    style={{
                      width: '100%', padding: '9px 12px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#6C63FF'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Due Date</label>
                    <input type="date" value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))}
                      style={{
                        width: '100%', padding: '9px 12px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                      style={{
                        width: '100%', padding: '9px 12px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                      }}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <Button variant="primary">Assign Goal →</Button>
              </div>
            </Card>
          </div>

          {/* Existing Goals */}
          <Card>
            <SectionHeader title="Active Goals" subtitle="All assigned team goals" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {goals.map(g => (
                <div key={g.id} style={{
                  padding: '12px 14px',
                  background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{g.title}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Badge status={g.priority} />
                      <Badge status={g.status} />
                    </div>
                  </div>
                  <ProgressBar value={g.progress} showLabel />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Due: {g.due}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReviews().then(r => { setReviews(r); setLoading(false); });
  }, []);

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--role-color)', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
            Team Reviews
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <Badge status="completed" /><span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 8 }}>
              {reviews.filter(r => r.status === 'completed').length} done
            </span>
            <Badge status="overdue" /><span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
              {reviews.filter(r => r.status === 'overdue').length} overdue
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(r => (
            <Card key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#6C63FF',
              }}>
                {r.employee.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{r.employee}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.period} · Manager: {r.manager}</div>
              </div>
              {r.score && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 20, color: '#43E8AC' }}>{r.score}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ 5.0</div>
                </div>
              )}
              <Badge status={r.status} />
              <Button variant={r.status === 'completed' ? 'secondary' : 'primary'} size="sm">
                {r.status === 'completed' ? 'View' : r.status === 'overdue' ? 'Start Now' : 'Continue'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
