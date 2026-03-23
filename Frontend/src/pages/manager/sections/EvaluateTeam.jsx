import React, { useEffect, useState } from 'react'
import api from '../../../api/axios'
import { Card, CardHeader, CardTitle, Table, Stars, Btn, FormGroup, Select, Input, Textarea, FormGrid, FormActions, Chip, Spinner } from '../../../components/UI'
import styles from './sections.module.css'

const INIT = { employee:'', reviewPeriod:'MONTHLY', reviewMonth:'', taskCompletion:'5', teamwork:'5', communication:'5', punctuality:'5', overallRating:'', remarks:'' }
const SCALE = [['5','5 – Excellent'],['4','4 – Good'],['3','3 – Average'],['2','2 – Below Avg'],['1','1 – Poor']]

export default function EvaluateTeam({ showToast }) {
  const [employees, setEmployees]     = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [form, setForm]               = useState(INIT)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)

  const fetchAll = () => {
    Promise.all([
      api.get('/auth/employees'),
      api.get('/performance/team'),
    ]).then(([e, ev]) => {
      setEmployees(e.data.employees || [])
      setEvaluations(Array.isArray(ev.data) ? ev.data : [])
    }).catch(() => showToast('Failed to load data', 'error'))
    .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const set = f => e => {
    let val = e.target.value;
    // Clamp overallRating between 1 and 5
    if (f === 'overallRating' && val !== '') {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        if (num > 5) val = '5';
        if (num < 1) val = '1';
        // Round to 1 decimal
        val = String(Math.round(num * 10) / 10);
      }
    }
    setForm(p => ({ ...p, [f]: val }));
  }

  const handleSubmit = async () => {
    const rating = parseFloat(form.overallRating);
    if (!form.employee || !form.overallRating) {
      showToast('Employee and Overall Rating are required', 'error'); return;
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
      showToast('Overall Rating must be between 1 and 5', 'error'); return;
    }
    setSaving(true)
    try {
      await api.post('/performance/evaluate', {
        ...form,
        taskCompletion: Number(form.taskCompletion),
        teamwork: Number(form.teamwork),
        communication: Number(form.communication),
        punctuality: Number(form.punctuality),
        overallRating: Number(form.overallRating),
      })
      showToast('Evaluation submitted successfully!')
      setForm(INIT)
      fetchAll()
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed', 'error')
    } finally { setSaving(false) }
  }

  if (loading) return <Spinner />

  const ratingColor = (r) => r >= 4.5 ? '#22d3a5' : r >= 4 ? '#4f7cff' : r >= 3 ? '#f59e0b' : '#ef4444'

  return (
    <div className="page-enter">
      <Card>
        <CardHeader><CardTitle>Employee Performance Evaluation</CardTitle></CardHeader>
        <FormGrid>
          <FormGroup label="Select Employee *">
            <Select value={form.employee} onChange={set('employee')}>
              <option value="">— Select Employee —</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.designation || e.role})</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Review Period">
            <Select value={form.reviewPeriod} onChange={set('reviewPeriod')}>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="ANNUAL">Annual</option>
            </Select>
          </FormGroup>
          <FormGroup label="Review Month / Period Label" full>
            <Input placeholder="e.g. February 2026 or Q1 2026" value={form.reviewMonth} onChange={set('reviewMonth')} />
          </FormGroup>

          <FormGroup label="Task Completion (1–5)">
            <Select value={form.taskCompletion} onChange={set('taskCompletion')}>
              {SCALE.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Teamwork (1–5)">
            <Select value={form.teamwork} onChange={set('teamwork')}>
              {SCALE.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Communication (1–5)">
            <Select value={form.communication} onChange={set('communication')}>
              {SCALE.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Punctuality (1–5)">
            <Select value={form.punctuality} onChange={set('punctuality')}>
              {SCALE.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Overall Rating (1–5) *">
            <Select value={form.overallRating} onChange={set('overallRating')}>
              <option value="">— Select Rating —</option>
              {['5','4.5','4','3.5','3','2.5','2','1.5','1'].map(v => (
                <option key={v} value={v}>{v} {v==='5'?'– Excellent':v==='4'?'– Good':v==='3'?'– Average':v==='2'?'– Below Avg':v==='1'?'– Poor':''}</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Performance Remarks" full>
            <Textarea placeholder="Strengths, achievements, areas for improvement..." value={form.remarks} onChange={set('remarks')} />
          </FormGroup>
        </FormGrid>
        <FormActions>
          <Btn variant="primary" size="md" onClick={handleSubmit} disabled={saving}>{saving ? 'Submitting...' : 'Submit Evaluation'}</Btn>
          <Btn variant="ghost" size="md" onClick={() => setForm(INIT)}>Clear</Btn>
        </FormActions>
      </Card>

      <Card>
        <CardHeader><CardTitle>Evaluation History ({evaluations.length})</CardTitle></CardHeader>
        <Table headers={['Employee', 'Period', 'Task', 'Teamwork', 'Comm.', 'Punct.', 'Overall', 'Date']}>
          {evaluations.map(ev => (
            <tr key={ev._id}>
              <td><strong>{ev.employee?.name}</strong><div style={{fontSize:'0.75rem',color:'var(--muted)'}}>{ev.employee?.designation}</div></td>
              <td><Chip color="blue">{ev.reviewPeriod}</Chip>{ev.reviewMonth && <div style={{fontSize:'0.72rem',color:'var(--muted)',marginTop:3}}>{ev.reviewMonth}</div>}</td>
              <td><Stars value={ev.taskCompletion} /></td>
              <td><Stars value={ev.teamwork} /></td>
              <td><Stars value={ev.communication} /></td>
              <td><Stars value={ev.punctuality} /></td>
              <td><strong style={{ color: ratingColor(ev.overallRating), fontSize:'1rem' }}>{ev.overallRating}</strong></td>
              <td style={{fontSize:'0.78rem',color:'var(--muted)'}}>{new Date(ev.createdAt).toLocaleDateString('en-IN')}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
