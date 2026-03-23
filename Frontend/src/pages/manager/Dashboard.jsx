import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { StatCard, Card, SectionHeader, Badge, ProgressBar, Sparkline } from '../../components/UI';
import Loader from '../../components/Loader';
import api from '../../services/api';

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    Promise.all([api.getChartData(), api.getReviews()]).then(([c, r]) => {
      setData(c); setReviews(r);
    });
  }, []);

  if (!data) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: 1100 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Team Members"   value="8"    icon="👥" color="#43E8AC" trend={0}  delay={0.05} />
          <StatCard label="Goals Assigned" value="24"   icon="🎯" color="#6C63FF" trend={4}  delay={0.10} />
          <StatCard label="Pending Reviews" value="3"   icon="📝" color="#FFB547" trend={-1} delay={0.15} />
          <StatCard label="Team Avg Score" value="81%"  icon="📈" color="#FF6584" trend={6}  delay={0.20} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Team performance */}
          <Card>
            <SectionHeader title="Team Performance Trend" subtitle="Last 6 months" />
            <Sparkline data={data.performance} color="#43E8AC" height={90} />
            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
              {data.performance.map((d, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14, color: '#43E8AC' }}>{d.score}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.month}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Reviews */}
          <Card>
            <SectionHeader title="Recent Reviews" subtitle="Q4 cycle" />
            {reviews.map((r, i) => (
              <div key={r.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < reviews.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{r.employee}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.period}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {r.score && (
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, color: '#43E8AC' }}>
                      ★ {r.score}
                    </span>
                  )}
                  <Badge status={r.status} />
                </div>
              </div>
            ))}
          </Card>

          {/* Action items */}
          <Card>
            <SectionHeader title="Action Items" subtitle="Needs your attention" />
            {[
              { text: 'Complete review for Morgan Lee', priority: 'high', due: 'Due today' },
              { text: 'Taylor Nguyen review overdue', priority: 'high', due: 'Overdue 3d' },
              { text: 'Set Q1 goals for team', priority: 'medium', due: 'Due Feb 28' },
              { text: 'Quarterly 1-on-1 meetings', priority: 'low', due: 'Due Mar 1' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: item.priority === 'high' ? '#FF6584' : item.priority === 'medium' ? '#FFB547' : '#43E8AC',
                }}/>
                <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{item.text}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{item.due}</div>
              </div>
            ))}
          </Card>

          {/* Goal status */}
          <Card>
            <SectionHeader title="Team Goal Status" subtitle="Current quarter" />
            {data.goalCompletion.slice(0, 4).map((d, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Team Goal {i + 1}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{d.rate}%</span>
                </div>
                <ProgressBar value={d.rate} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
