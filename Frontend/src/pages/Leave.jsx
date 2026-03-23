import React from 'react';
import { Card, CardHeader, CardTitle, Table, Chip, Button } from '../components/UI';
import styles from './Pages.module.css';

export default function Leave({ leaveRequests, onApprove, onReject }) {
  const pending = leaveRequests.filter(l => l.status === 'Pending').length;
  const statusColor = { Pending: 'warn', Approved: 'green', Rejected: 'red' };

  return (
    <div className={styles.page}>
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <Chip color="warn">{pending} Pending</Chip>
        </CardHeader>
        <Table headers={['Employee','Type','From','To','Days','Reason','Status','Action']}>
          {leaveRequests.map(l => (
            <tr key={l.id}>
              <td><strong>{l.name}</strong></td>
              <td>{l.type}</td>
              <td>{l.from}</td>
              <td>{l.to}</td>
              <td>{l.days}</td>
              <td style={{ color: 'var(--muted)', , fontSize: '.82rem' }}>{l.reason}</td>
              <td><Chip color={statusColor[l.status]}>{l.status}</Chip></td>
              <td>
                {l.status === 'Pending' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button variant="success" size="sm" onClick={() => onApprove(l.id)}>Approve</Button>
                    <Button variant="danger"  size="sm" onClick={() => onReject(l.id)}>Reject</Button>
                  </div>
                ) : (
                  <span style={{ color: 'var(--muted)', fontSize: '.8rem' }}>Reviewed</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
