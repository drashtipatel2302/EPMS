import React from 'react';
import { Card, CardHeader, CardTitle, Chip, Button, ProgressBar } from '../components/UI';
import styles from './Pages.module.css';

const statusColor = { 'In Progress': 'warn', 'Near Completion': 'blue', 'Behind Schedule': 'red', 'Completed': 'green' };
const progressColor = (pct) => pct >= 80 ? 'green' : pct >= 50 ? 'blue' : 'warn';

export default function Projects({ projects, onShowToast }) {
  return (
    <div className={styles.page}>
      <div className={styles.projGrid}>
        {projects.map(p => (
          <Card key={p.id} className={styles.projCard}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <Chip color={statusColor[p.status] || 'gray'}>{p.status}</Chip>
            </CardHeader>
            <div className={styles.projDue}>Due: {p.due}</div>
            <div className={styles.projProgress}>
              <span>Progress</span>
              <strong style={{ color: p.color }}>{p.progress}%</strong>
            </div>
            <ProgressBar value={p.progress} color={progressColor(p.progress)} />
            <div className={styles.projTeam}>👥 {p.team}</div>
            <div className={styles.projActions}>
              <Button variant="ghost" size="sm" onClick={() => onShowToast(`${p.name} details opened`)}>View Details</Button>
              <Button variant="primary" size="sm" onClick={() => onShowToast('Progress updated!')}>Update</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
