import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, SectionHeader, ProgressBar, Button, Badge } from '../../components/UI';
import Loader from '../../components/Loader';
import { fetchAllPerformance, fetchEmployees, getAuthHeaders } from '../../services/api';

export default function KPI() {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAllPerformance().catch(() => ({ evaluations: [], summary: [] })),
      fetchEmployees({ limit: 500 }).catch(() => ({ employees: [] })),
    ]).then(([perf, empRes]) => {
      const employees = empRes.employees || [];
      // Build KPIs from real performance data: per-department averages
      const deptMap = {};
      (perf.evaluations || []).forEach(e => {
        const dept = e.employee?.department || 'General';
        if (!deptMap[dept]) deptMap[dept] = { ratings: [], taskCompletion: [], teamwork: [], communication: [], punctuality: [] };
        deptMap[dept].ratings.push(e.overallRating || 0);
        deptMap[dept].taskCompletion.push(e.taskCompletion || 0);
        deptMap[dept].teamwork.push(e.teamwork || 0);
        deptMap[dept].communication.push(e.communication || 0);
        deptMap[dept].punctuality.push(e.punctuality || 0);
      });
      const avg = arr => arr.length ? (arr.reduce((s,v)=>s+v,0)/arr.length).toFixed(1)*1 : 0;
      const kpiList = Object.entries(deptMap).map(([dept, data], i) => ({
        id: i+1, name: `${dept} Performance`, dept,
        target: 4, actual: avg(data.ratings), unit: '/5',
        taskCompletion: avg(data.taskCompletion),
        teamwork: avg(data.teamwork),
        communication: avg(data.communication),
        punctuality: avg(data.punctuality),
        evaluations: data.ratings.length,
      }));
      setKpis(kpiList.length ? kpiList : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--role-color)', margin: 0, letterSpacing: '-0.3px' }}>Key Performance Indicators</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Real-time KPIs derived from performance evaluations</p>
          </div>
        </div>

        {kpis.length === 0 && (
          <Card style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No performance data yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>KPIs will populate once managers submit performance evaluations</div>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {kpis.map((kpi) => {
            const pct = Math.round((kpi.actual / kpi.target) * 100);
            const achieved = kpi.actual >= kpi.target;
            const color = achieved ? '#43E8AC' : pct > 80 ? '#FFB547' : '#FF6584';

            return (
              <Card key={kpi.id} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                    color: 'var(--text-muted)', padding: '3px 8px',
                    background: 'var(--bg-elevated)', borderRadius: 4,
                  }}>
                    {kpi.dept}
                  </div>
                  <Badge status={achieved ? 'completed' : 'at-risk'} />
                </div>

                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>
                  {kpi.name}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Target</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 20, color: 'var(--text-primary)' }}>
                      {kpi.target}<span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>{kpi.unit}</span>
                    </div>
                  </div>
                  <div style={{ background: `${color}10`, borderRadius: 8, padding: '10px', border: `1px solid ${color}25` }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Actual</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 20, color }}>
                      {kpi.actual}<span style={{ fontSize: 11, marginLeft: 2 }}>{kpi.unit}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Achievement ({kpi.evaluations} evals)</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
                  </div>
                  <ProgressBar value={kpi.actual} max={kpi.target} color={color} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
