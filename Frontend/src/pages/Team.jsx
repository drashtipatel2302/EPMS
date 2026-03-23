import React from 'react';
import { Avatar, Chip, Button } from '../components/UI';
import styles from './Pages.module.css';

export default function Team({ employees, onAssignTask, onEvaluate }) {
  return (
    <div className={styles.page}>
      <div className={styles.empGrid}>
        {employees.map(emp => (
          <div key={emp.id} className={styles.empCard}>
            <div className={styles.empCardTop}>
              <Avatar initials={emp.initials} gradient={emp.gradient} size="md" />
              <div>
                <div className={styles.empName}>{emp.name}</div>
                <div className={styles.empRole}>{emp.role}</div>
                <div style={{ marginTop: 4 }}>
                  <Chip color={emp.status === 'Active' ? 'green' : 'warn'}>{emp.status}</Chip>
                </div>
              </div>
            </div>
            <div className={styles.empStats}>
              <div className={styles.empStat}>
                <div className={styles.empStatVal} style={{ color: '#22d3a5' }}>{emp.rating}</div>
                <div className={styles.empStatLbl}>Rating</div>
              </div>
              <div className={styles.empStat}>
                <div className={styles.empStatVal}>{emp.tasksDone}</div>
                <div className={styles.empStatLbl}>Tasks Done</div>
              </div>
              <div className={styles.empStat}>
                <div className={styles.empStatVal} style={{ color: '#4f7cff' }}>{emp.attendance}%</div>
                <div className={styles.empStatLbl}>Attendance</div>
              </div>
              <div className={styles.empStat}>
                <div className={styles.empStatVal} style={{ color: '#f59e0b' }}>{emp.pending}</div>
                <div className={styles.empStatLbl}>Pending</div>
              </div>
            </div>
            <div className={styles.empActions}>
              <Button variant="ghost" size="sm" onClick={() => onEvaluate(emp)}>Rate</Button>
              <Button variant="primary" size="sm" onClick={() => onAssignTask(emp)}>Assign Task</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
