import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, Table, Chip, Button, FormGroup, Input, Select, Textarea } from '../components/UI';
import styles from './Pages.module.css';

const INIT = { title: '', employee: 'Anita Sharma', project: 'ERP Migration', priority: 'High', deadline: '', hours: '', description: '' };

export default function Tasks({ tasks, employees, onShowToast }) {
  const [form, setForm] = useState(INIT);
  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onShowToast('Task assigned successfully!');
    setForm(INIT);
  };

  const statusColor = { 'Done': 'green', 'In Progress': 'warn', 'Not Started': 'gray' };
  const priorityColor = { 'High': 'red', 'Medium': 'blue', 'Low': 'gray' };

  return (
    <div className={styles.page}>
      <Card>
        <CardHeader><CardTitle>Assign New Task</CardTitle></CardHeader>
        <div className={styles.formGrid}>
          <FormGroup label="Task Title">
            <Input placeholder="e.g. Implement login module" value={form.title} onChange={set('title')} />
          </FormGroup>
          <FormGroup label="Assign To">
            <Select value={form.employee} onChange={set('employee')}>
              {employees.map(e => <option key={e.id}>{e.name}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Project">
            <Select value={form.project} onChange={set('project')}>
              {['ERP Migration','Mobile App v2','API Refactor','Data Pipeline'].map(p => <option key={p}>{p}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Priority">
            <Select value={form.priority} onChange={set('priority')}>
              {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Deadline">
            <Input type="date" value={form.deadline} onChange={set('deadline')} />
          </FormGroup>
          <FormGroup label="Estimated Hours">
            <Input type="number" placeholder="e.g. 8" value={form.hours} onChange={set('hours')} />
          </FormGroup>
          <FormGroup label="Description" full>
            <Textarea placeholder="Task details and requirements..." value={form.description} onChange={set('description')} />
          </FormGroup>
        </div>
        <div className={styles.formActions}>
          <Button variant="primary" size="md" onClick={handleSubmit}>Assign Task</Button>
          <Button variant="ghost" size="md" onClick={() => setForm(INIT)}>Clear</Button>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Active Tasks</CardTitle></CardHeader>
        <Table headers={['Task','Employee','Project','Priority','Deadline','Status','Action']}>
          {tasks.map(t => (
            <tr key={t.id}>
              <td><strong>{t.title}</strong></td>
              <td>{t.employee}</td>
              <td>{t.project}</td>
              <td><Chip color={priorityColor[t.priority]}>{t.priority}</Chip></td>
              <td>{t.deadline}</td>
              <td><Chip color={statusColor[t.status]}>{t.status}</Chip></td>
              <td><Button variant="ghost" size="sm" onClick={() => onShowToast('Task editor opened')}>Edit</Button></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
