import React from 'react';
import { KpiCard, Card, CardHeader, CardTitle, ProgressBar, Avatar, Chip, Button } from '../components/UI';
import styles from './Pages.module.css';

const projects = [
  { name: 'ERP Migration', pct: 78,  color: 'blue', colorHex: '#4f7cff' },
  { name: 'Mobile App v2', pct: 91,  color: 'green', colorHex: '#22d3a5' },
  { name: 'API Refactor',  pct: 45,  color: 'warn', colorHex: '#f59e0b' },
  { name: 'Data Pipeline', pct: 62,  color: 'blue', colorHex: '#4f7cff' },
];

export default function Dashboard({ leaveRequests, onApprove, onReject }) {
  const pending = leaveRequests.filter(l => l.status === 'Pending');

  return (
    <div className={styles.page}>
      <div className={styles.kpiGrid}>
        <KpiCard icon="👥" value="12" label="Team Members"   delta="↑ 2 added this month"    color="blue"  />
        <KpiCard icon="✅" value="47" label="Tasks Completed" delta="↑ 12% vs last month"     color="green" />
        <KpiCard icon="⏳" value="9"  label="Pending Tasks"   delta="2 overdue"               color="warn"  />
        <KpiCard icon="🗓️" value={pending.length} label="Leave Requests" delta="Awaiting review" color="red" />
        <KpiCard icon="📊" value="4.2" label="Avg. Performance" delta="↑ 0.3 from last quarter" color="blue" />
        <KpiCard icon="🚀" value="5"  label="Active Projects" delta="2 due this month"        color="green" />
      </div>

      <div className={styles.twoCol}>
        <Card>
          <CardHeader><CardTitle>Project Progress</CardTitle></CardHeader>
          {projects.map(p => (
            <div key={p.name} className={styles.projItem}>
              <div className={styles.projRow}>
                <span className={styles.projName}>{p.name}</span>
                <span style={{ fontFamily:'var(--font-head)', fontWeight:700, color: p.colorHex }}>{p.pct}%</span>
              </div>
              <ProgressBar value={p.pct} color={p.color} />
            </div>
          ))}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
          </CardHeader>
          {pending.length === 0 && <p className={styles.empty}>No pending requests 🎉</p>}
          {pending.map(l => (
            <div key={l.id} className={styles.leaveItem}>
              <div className={styles.leaveInfo}>
                <Avatar initials={l.initials} gradient={l.gradient} size="sm" />
                <div>
                  <div className={styles.leaveName}>{l.name}</div>
                  <div className={styles.leaveDates}>{l.from} – {l.to} · {l.days} days</div>
                  <div className={styles.leaveReason}>{l.reason}</div>
                </div>
              </div>
              <div className={styles.leaveActions}>
                <Button variant="success" size="sm" onClick={() => onApprove(l.id)}>✓</Button>
                <Button variant="danger"  size="sm" onClick={() => onReject(l.id)}>✕</Button>
              </div>
            </div>
          ))}
          {pending.length === 0 && null}
        </Card>
      </div>
    </div>
  );
}
