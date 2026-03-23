import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, Table, Stars, Button, FormGroup, Select, Textarea, Input } from '../components/UI';
import styles from './Pages.module.css';

const INIT = { employee: 'Anita Sharma', period: 'Monthly – February 2026', task: '5', teamwork: '5', communication: '5', punctuality: '5', remarks: '', overall: '' };
const SCALE = ['5 – Excellent','4 – Good','3 – Average','2 – Below Avg','1 – Poor'];

export default function Evaluate({ employees, evaluations, onShowToast }) {
  const [form, setForm] = useState(INIT);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div className={styles.page}>
      <Card>
        <CardHeader><CardTitle>Employee Performance Evaluation</CardTitle></CardHeader>
        <div className={styles.formGrid}>
          <FormGroup label="Select Employee">
            <Select value={form.employee} onChange={set('employee')}>
              {employees.map(e => <option key={e.id}>{e.name}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Review Period">
            <Select value={form.period} onChange={set('period')}>
              {['Monthly – February 2026','Quarterly – Q1 2026','Annual – 2025'].map(p => <option key={p}>{p}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Task Completion (1-5)">
            <Select value={form.task} onChange={set('task')}>
              {SCALE.map(s => <option key={s}>{s}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Teamwork (1-5)">
            <Select value={form.teamwork} onChange={set('teamwork')}>
              {SCALE.map(s => <option key={s}>{s}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Communication (1-5)">
            <Select value={form.communication} onChange={set('communication')}>
              {SCALE.map(s => <option key={s}>{s}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Punctuality (1-5)">
            <Select value={form.punctuality} onChange={set('punctuality')}>
              {SCALE.map(s => <option key={s}>{s}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Performance Remarks" full>
            <Textarea placeholder="Add detailed feedback, achievements, areas of improvement..." value={form.remarks} onChange={set('remarks')} />
          </FormGroup>
          <FormGroup label="Overall Rating (1–5)" full>
            <Input type="number" min="1" max="5" step="0.1" placeholder="e.g. 4.2" value={form.overall} onChange={set('overall')} style={{ maxWidth: 200 }} />
          </FormGroup>
        </div>
        <div className={styles.formActions}>
          <Button variant="primary" size="md" onClick={() => { onShowToast('Evaluation submitted!'); setForm(INIT); }}>Submit Evaluation</Button>
          <Button variant="ghost" size="md" onClick={() => onShowToast('Draft saved!')}>Save Draft</Button>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Evaluations</CardTitle></CardHeader>
        <Table headers={['Employee','Period','Task','Teamwork','Communication','Overall','Date']}>
          {evaluations.map(ev => (
            <tr key={ev.id}>
              <td><strong>{ev.name}</strong></td>
              <td style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{ev.period}</td>
              <td><Stars count={ev.task} /></td>
              <td><Stars count={ev.teamwork} /></td>
              <td><Stars count={ev.communication} /></td>
              <td><strong style={{ color: ev.overall >= 4.5 ? '#22d3a5' : ev.overall >= 4 ? '#4f7cff' : '#f59e0b' }}>{ev.overall}</strong></td>
              <td style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{ev.date}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
