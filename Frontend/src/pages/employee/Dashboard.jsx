import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { StatCard, Card, SectionHeader, Badge } from '../../components/UI';
import Loader from '../../components/Loader';
import { getAuthHeaders } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const apiFetch = async (path) => {
  const res = await fetch(path, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function StarRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {[1,2,3,4,5].map(n => (
          <span key={n} style={{ color: n <= Math.round(value) ? '#FFB547' : '#e2e5ef', fontSize: 14 }}>★</span>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>{value}/5</span>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user, updateUser } = useAuth();
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    // Fetch dashboard data
    apiFetch('/api/employee/dashboard')
      .then(setDash)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));

    // Sync designation/department from live profile so greeting shows latest data
    apiFetch('/api/employee/profile')
      .then(u => updateUser({ name: u.name, designation: u.designation, department: u.department }))
      .catch(() => {});
  }, []);

  if (loading) return <Layout><Loader /></Layout>;

  if (error) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Could not load dashboard</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{error}</div>
      </div>
    </Layout>
  );

  const { taskSummary, leaveSummary, attendanceSummary, latestPerformance, todayAttendance, recentTasks } = dash;
  const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
  const normStatus = s => ({ IN_PROGRESS: 'in-progress', PENDING: 'pending', COMPLETED: 'completed', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' }[s] || s?.toLowerCase());

  return (
    <Layout>
      <div style={{ maxWidth: 1100 }}>

        {/* ── Greeting Banner ── */}
        <div style={{
          background: 'linear-gradient(120deg, rgba(108,99,255,0.15) 0%, rgba(255,181,71,0.08) 100%)',
          border: '1px solid rgba(108,99,255,0.18)',
          borderRadius: 'var(--r-xl)', padding: '22px 28px',
          marginBottom: 24, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', fontSize: 80, opacity: 0.07 }}>🚀</div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
            {greeting()}, {user?.name?.split(' ')[0]}! 👋
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {user?.designation && <><strong style={{ color: 'var(--accent)' }}>{user.designation}</strong> · </>}
            {user?.department} Department
          </div>

          {todayAttendance && (
            <div style={{
              marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.6)', borderRadius: 30,
              padding: '6px 16px', border: '1px solid rgba(108,99,255,0.12)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#43E8AC', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Logged in at <strong style={{ color: 'var(--text-primary)' }}>{fmtTime(todayAttendance.loginTime)}</strong>
                {todayAttendance.logoutTime
                  ? <> · out at <strong style={{ color: 'var(--text-primary)' }}>{fmtTime(todayAttendance.logoutTime)}</strong></>
                  : <span style={{ color: '#43E8AC' }}> · Active</span>}
              </span>
              <span style={{
                padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: todayAttendance.status === 'PRESENT' ? 'rgba(67,232,172,0.18)' : todayAttendance.status === 'LATE' ? 'rgba(255,181,71,0.18)' : 'rgba(255,101,132,0.18)',
                color:      todayAttendance.status === 'PRESENT' ? '#43E8AC'               : todayAttendance.status === 'LATE' ? '#FFB547'               : '#FF6584',
              }}>{todayAttendance.status}</span>
            </div>
          )}
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Tasks"     value={taskSummary.total}       icon="📋" color="#6C63FF" delay={0.05} />
          <StatCard label="In Progress"     value={taskSummary.inProgress}  icon="⚡" color="#FFB547" delay={0.10} />
          <StatCard label="Completed"       value={taskSummary.completed}   icon="✅" color="#43E8AC" delay={0.15} />
          <StatCard label="Leaves Pending"  value={leaveSummary.pending}    icon="📅" color="#FF6584" delay={0.20} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Recent Tasks */}
          <Card>
            <SectionHeader title="Recent Tasks" subtitle="Your latest assigned work" />
            {recentTasks?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentTasks.map(t => (
                  <div key={t._id} style={{
                    padding: '12px 14px', background: 'var(--bg-elevated)',
                    borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        By {t.assignedBy?.name} · Due {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-IN') : '—'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      <Badge status={normStatus(t.priority)} />
                      <Badge status={normStatus(t.status)} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>No tasks assigned yet.</div>
            )}
          </Card>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Attendance Summary */}
            <Card>
              <SectionHeader title="This Month" subtitle="Attendance summary" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Present',   value: attendanceSummary.present,          color: '#43E8AC', icon: '✅' },
                  { label: 'Late',      value: attendanceSummary.late,             color: '#FFB547', icon: '⏰' },
                  { label: 'Half Day',  value: attendanceSummary.halfDay,          color: '#6C63FF', icon: '🕐' },
                  { label: 'Total Hrs', value: `${attendanceSummary.totalHours}h`, color: '#43E8AC', icon: '⏱' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18 }}>{s.icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Latest Performance */}
            <Card>
              <SectionHeader title="Latest Review" subtitle="Your performance rating" />
              {latestPerformance ? (
                <>
                  <StarRow label="Overall"        value={latestPerformance.overallRating}  />
                  <StarRow label="Task Completion" value={latestPerformance.taskCompletion} />
                  <StarRow label="Teamwork"        value={latestPerformance.teamwork}       />
                  <StarRow label="Communication"   value={latestPerformance.communication}  />
                  {latestPerformance.remarks && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(108,99,255,0.06)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)',  borderLeft: '2px solid var(--accent)' }}>
                      "{latestPerformance.remarks}"
                    </div>
                  )}
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>By {latestPerformance.evaluatedBy?.name} · {latestPerformance.reviewMonth || latestPerformance.reviewPeriod}</div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>No reviews yet.</div>
              )}
            </Card>
          </div>
        </div>

        {/* Leave Summary Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { label: 'Approved Leaves',  value: leaveSummary.approved, color: '#43E8AC', icon: '✅' },
            { label: 'Pending Requests', value: leaveSummary.pending,  color: '#FFB547', icon: '⏳' },
            { label: 'Rejected',         value: leaveSummary.rejected, color: '#FF6584', icon: '❌' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-surface)', border: `1px solid ${s.color}30`,
              borderRadius: 'var(--r-md)', padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
              borderLeft: `4px solid ${s.color}`,
            }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 26, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
