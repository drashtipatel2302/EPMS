import React from 'react';
import { KpiCard, Card, CardHeader, CardTitle, Table, Chip, Button, ProgressBar } from '../components/UI';
import styles from './Pages.module.css';

const reportData = [
  { name: 'Neha Kapoor',  role: 'UI/UX Designer', done: '11 / 12', attendance: 98, rating: 4.8, trend: '↑ +0.3', trendColor: '#22d3a5', status: 'Top Performer', statusColor: 'green', attColor: 'green' },
  { name: 'Anita Sharma', role: 'Frontend Dev',    done: '8 / 10',  attendance: 94, rating: 4.5, trend: '↑ +0.2', trendColor: '#22d3a5', status: 'Good',         statusColor: 'blue',  attColor: 'blue'  },
  { name: 'Rohit Singh',  role: 'QA Engineer',     done: '9 / 11',  attendance: 91, rating: 4.1, trend: '→ 0.0',  trendColor: '#6b7280', status: 'Good',         statusColor: 'blue',  attColor: 'blue'  },
  { name: 'Vijay Patel',  role: 'Backend Dev',     done: '6 / 9',   attendance: 87, rating: 3.8, trend: '↓ -0.2', trendColor: '#ef4444', status: 'Needs Improvement', statusColor: 'warn', attColor: 'warn' },
];

export default function Reports({ onShowToast }) {
  return (
    <div className={styles.page}>
      <div className={styles.kpiGrid}>
        <KpiCard icon="📊" value="4.2"  label="Team Avg. Rating"     color="blue"  />
        <KpiCard icon="✅" value="83%"  label="Task Completion Rate"  color="green" />
        <KpiCard icon="🕐" value="92%"  label="Avg. Attendance"       color="warn"  />
        <KpiCard icon="⚠️" value="3"    label="Underperformers"       color="red"   />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Individual Performance Summary</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onShowToast('Report exported!')}>Export PDF</Button>
        </CardHeader>
        <Table headers={['Employee','Role','Tasks Done','Attendance','Rating','Trend','Status']}>
          {reportData.map(r => (
            <tr key={r.name}>
              <td><strong>{r.name}</strong></td>
              <td style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{r.role}</td>
              <td>{r.done}</td>
              <td>
                <span>{r.attendance}%</span>
                <ProgressBar value={r.attendance} color={r.attColor} />
              </td>
              <td><strong style={{ color: r.rating >= 4.5 ? '#22d3a5' : r.rating >= 4 ? '#4f7cff' : '#f59e0b' }}>{r.rating} ⭐</strong></td>
              <td style={{ color: r.trendColor, fontWeight: 600 }}>{r.trend}</td>
              <td><Chip color={r.statusColor}>{r.status}</Chip></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
