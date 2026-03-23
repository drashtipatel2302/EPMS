import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Card, Badge, ProgressBar, SectionHeader } from '../../components/UI';
import Loader from '../../components/Loader';
import api from '../../services/api';

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then(u => {
      setUsers(u.filter(x => x.role === 'employee'));
      setLoading(false);
    });
  }, []);

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: 1000 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--role-color)', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
            My Team
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {users.length} direct reports
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {users.map((u, i) => (
            <Card key={u.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(255,101,132,0.2))',
                border: '1px solid rgba(108,99,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 16, color: '#6C63FF',
              }}>
                {u.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.dept}</div>
                  </div>
                  <Badge status={u.status} />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Performance Score</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>
                      {u.score}/100
                    </span>
                  </div>
                  <ProgressBar value={u.score} max={100} />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{
                    flex: 1, padding: '6px 0',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)', fontSize: 11, fontWeight: 600,
                    color: 'var(--text-secondary)', cursor: 'pointer',
                  }}>View Goals</button>
                  <button style={{
                    flex: 1, padding: '6px 0',
                    background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)',
                    borderRadius: 'var(--r-sm)', fontSize: 11, fontWeight: 600,
                    color: '#8B85FF', cursor: 'pointer',
                  }}>Start Review</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
