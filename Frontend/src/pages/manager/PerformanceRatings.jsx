import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, SectionHeader, Badge, Button, ProgressBar } from '../../components/UI';
import Loader from '../../components/Loader';
import api from '../../services/api';

const CRITERIA = ['Goal Achievement', 'Work Quality', 'Collaboration', 'Communication', 'Learning & Growth'];

export default function PerformanceRatings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [ratings, setRatings] = useState({});
  const [remark, setRemark] = useState('');
  const [period, setPeriod] = useState('Q4 2023');
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    api.getUsers().then(u => {
      setUsers(u.filter(x => x.role === 'employee'));
      setLoading(false);
    });
  }, []);

  if (loading) return <Layout><Loader /></Layout>;

  const handleSubmit = () => {
    if (selected && Object.keys(ratings).length === CRITERIA.length) {
      setSubmitted(s => ({ ...s, [selected]: { ratings, remark, period } }));
      setRatings({});
      setRemark('');
      setSelected(null);
    }
  };

  const avg = Object.values(ratings).length ? (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length).toFixed(1) : null;
  const activeUser = users.find(u => u.id === parseInt(selected));

  return (
    <Layout>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--role-color)', margin: 0, letterSpacing: '-0.3px' }}>Performance Ratings</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Give ratings and performance remarks to your team</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>

          {/* Team list */}
          <div>
            <Card>
              <SectionHeader title="Team Members" subtitle="Select to rate" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {users.map(u => (
                  <div key={u.id} onClick={() => { setSelected(String(u.id)); setRatings({}); setRemark(''); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px', borderRadius: 10, cursor: 'pointer',
                      background: selected === String(u.id) ? 'rgba(108,99,255,0.08)' : 'var(--bg-elevated)',
                      border: `1px solid ${selected === String(u.id) ? '#6C63FF40' : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: 12, color: '#6C63FF',
                    }}>{u.name.split(' ').map(n => n[0]).join('')}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.dept}</div>
                    </div>
                    {submitted[u.id] ? (
                      <Badge status="completed" />
                    ) : (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Rating form */}
          <div>
            {!selected ? (
              <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
                  <div style={{ fontSize: 14 }}>Select a team member to start rating</div>
                </div>
              </Card>
            ) : (
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>{activeUser?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activeUser?.dept}</div>
                  </div>
                  <select value={period} onChange={e => setPeriod(e.target.value)} style={{
                    padding: '7px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text-primary)', fontSize: 12, outline: 'none',
                  }}>
                    {['Q4 2023','Q3 2023','Q2 2023','Q1 2024'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 }}>
                  {CRITERIA.map(c => (
                    <div key={c}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c}</span>
                        {ratings[c] && <span style={{ fontSize: 12, color: '#FFB547', fontWeight: 600 }}>
                          {['','Needs Improvement','Below Expectations','Meets Expectations','Exceeds Expectations','Outstanding'][ratings[c]]}
                        </span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {[1,2,3,4,5].map(n => (
                          <button key={n} onClick={() => setRatings(r => ({ ...r, [c]: n }))} style={{
                            flex: 1, height: 36, borderRadius: 8, cursor: 'pointer',
                            fontSize: 16, transition: 'all 0.15s',
                            background: ratings[c] >= n ? 'rgba(255,181,71,0.15)' : 'var(--bg-elevated)',
                            border: `1px solid ${ratings[c] >= n ? '#FFB547' : 'var(--border)'}`,
                            color: ratings[c] >= n ? '#FFB547' : 'var(--text-muted)',
                          }}>★</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {avg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
                    padding: '10px 14px', background: 'rgba(67,232,172,0.08)', borderRadius: 10, border: '1px solid rgba(67,232,172,0.2)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Average Score</span>
                    <span style={{ fontSize: 22, fontWeight: 600, color: '#43E8AC' }}>{avg}/5</span>
                    <div style={{ flex: 1 }}><ProgressBar value={parseFloat(avg)} max={5} color="#43E8AC" /></div>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Performance Remarks
                  </label>
                  <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={4}
                    placeholder="Add overall performance comments, feedback, and suggestions for improvement…"
                    style={{
                      width: '100%', padding: '10px 12px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#6C63FF'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="secondary" onClick={() => { setSelected(null); setRatings({}); setRemark(''); }}>Cancel</Button>
                  <button onClick={handleSubmit} style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                    background: Object.keys(ratings).length === CRITERIA.length ? 'linear-gradient(90deg, #6C63FF, #8B85FF)' : 'var(--bg-elevated)',
                    color: Object.keys(ratings).length === CRITERIA.length ? '#fff' : 'var(--text-muted)',
                    border: 'none', fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
                  }}>
                    {Object.keys(ratings).length === CRITERIA.length ? 'Submit Rating →' : `Rate all ${CRITERIA.length} criteria to submit`}
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
