import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, Table, Chip, Button, FormGroup, Select, Input, Textarea } from '../components/UI';
import styles from './Pages.module.css';

const INIT = { employee: 'Neha Kapoor', type: 'Promotion', currentRole: '', proposedRole: '', ctc: '', increment: '', remarks: '' };

export default function Promote({ employees, promotionHistory, onShowToast }) {
  const [form, setForm] = useState(INIT);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div className={styles.page}>
      <Card>
        <CardHeader><CardTitle>Recommend Promotion / Increment</CardTitle></CardHeader>
        <div className={styles.formGrid}>
          <FormGroup label="Employee">
            <Select value={form.employee} onChange={set('employee')}>
              {employees.map(e => <option key={e.id}>{e.name}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Recommendation Type">
            <Select value={form.type} onChange={set('type')}>
              {['Promotion','Salary Increment','Both'].map(t => <option key={t}>{t}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Current Designation">
            <Input placeholder="e.g. UI/UX Designer" value={form.currentRole} onChange={set('currentRole')} />
          </FormGroup>
          <FormGroup label="Proposed Designation">
            <Input placeholder="e.g. Senior UI/UX Designer" value={form.proposedRole} onChange={set('proposedRole')} />
          </FormGroup>
          <FormGroup label="Current CTC (₹)">
            <Input type="number" placeholder="e.g. 600000" value={form.ctc} onChange={set('ctc')} />
          </FormGroup>
          <FormGroup label="Proposed Increment %">
            <Input type="number" placeholder="e.g. 20" value={form.increment} onChange={set('increment')} />
          </FormGroup>
          <FormGroup label="Justification / Remarks" full>
            <Textarea placeholder="Why does this employee deserve a promotion or increment?" value={form.remarks} onChange={set('remarks')} />
          </FormGroup>
        </div>
        <div className={styles.formActions}>
          <Button variant="primary" size="md" onClick={() => { onShowToast('Recommendation submitted to HR!'); setForm(INIT); }}>Submit to HR</Button>
          <Button variant="ghost" size="md" onClick={() => onShowToast('Draft saved!')}>Save Draft</Button>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Promotion History</CardTitle></CardHeader>
        <Table headers={['Employee','Type','Old Role','New Role','Increment','Date','Status']}>
          {promotionHistory.map(p => (
            <tr key={p.id}>
              <td><strong>{p.name}</strong></td>
              <td style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{p.type}</td>
              <td>{p.oldRole}</td>
              <td>{p.newRole}</td>
              <td style={{ color: '#22d3a5', fontWeight: 600 }}>{p.increment}</td>
              <td style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{p.date}</td>
              <td><Chip color="green">{p.status}</Chip></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
