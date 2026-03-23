import React, { useEffect, useState } from 'react'
import api from '../../../api/axios'
import { KpiCard, Card, CardHeader, CardTitle, Table, Chip, ProgressBar, Spinner, Btn, Stars } from '../../../components/UI'
import styles from './sections.module.css'

export default function TeamReports({ showToast }) {
  const [report, setReport] = useState(null)
  const [tasks, setTasks]   = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/performance/team/report'),
      api.get('/manager-tasks/my-assigned'),
      api.get('/leave/team'),
    ]).then(([r, t, l]) => {
      setReport(r.data)
      setTasks(Array.isArray(t.data) ? t.data : [])
      setLeaves(Array.isArray(l.data) ? l.data : [])
    }).catch(() => showToast('Failed to load reports', 'error'))
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const totalTasks    = tasks.length
  const completed     = tasks.filter(t => t.status === 'COMPLETED').length
  const completion    = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0
  const underperform  = (report?.summary || []).filter(s => s.avgRating && s.avgRating < 3.5).length

  const ratingColor = (r) => {
    if (!r) return 'var(--muted)'
    return r >= 4.5 ? '#22d3a5' : r >= 4 ? '#4f7cff' : r >= 3 ? '#f59e0b' : '#ef4444'
  }
  const statusLabel = (r) => {
    if (!r) return { label: 'Not Evaluated', color: 'gray' }
    return r >= 4.5 ? { label: 'Top Performer', color: 'green' }
         : r >= 4   ? { label: 'Good', color: 'blue' }
         : r >= 3   ? { label: 'Average', color: 'warn' }
                    : { label: 'Needs Improvement', color: 'red' }
  }

  return (
    <div className="page-enter">
      <div className={styles.kpiGrid}>
        <KpiCard icon="📊" value={report?.teamAvg || '—'} label="Team Avg. Rating"    color="blue"  />
        <KpiCard icon="✅" value={`${completion}%`}       label="Task Completion Rate" color="green" />
        <KpiCard icon="👥" value={report?.summary?.length || 0} label="Employees Evaluated" color="warn"  />
        <KpiCard icon="⚠️" value={underperform}            label="Need Improvement"   color="red"   />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Individual Performance Summary</CardTitle>
          <Btn variant="ghost" size="sm" onClick={() => showToast('Report export coming soon', 'info')}>Export PDF</Btn>
        </CardHeader>
        <Table headers={['Employee', 'Role', 'Avg. Rating', 'Evaluations', 'Status']}>
          {(report?.summary || []).map(s => {
            const st = statusLabel(s.avgRating)
            return (
              <tr key={s.employee?._id}>
                <td><strong>{s.employee?.name}</strong></td>
                <td style={{ color:'var(--muted)', fontSize:'0.82rem' }}>{s.employee?.designation}</td>
                <td>
                  {s.avgRating ? (
                    <div>
                      <strong style={{ color: ratingColor(s.avgRating), fontSize:'1.05rem' }}>{s.avgRating}</strong>
                      <Stars value={Math.round(s.avgRating)} />
                    </div>
                  ) : <span style={{ color:'var(--muted)' }}>—</span>}
                </td>
                <td>{s.evalCount}</td>
                <td><Chip color={st.color}>{st.label}</Chip></td>
              </tr>
            )
          })}
        </Table>
      </Card>

      <Card>
        <CardHeader><CardTitle>Task Summary by Employee</CardTitle></CardHeader>
        <Table headers={['Employee', 'Total Tasks', 'Completed', 'In Progress', 'Pending', 'Completion Rate']}>
          {(() => {
            const empMap = {}
            tasks.forEach(t => {
              const id = t.assignedTo?._id
              if (!id) return
              if (!empMap[id]) empMap[id] = { name: t.assignedTo?.name, total:0, done:0, inProgress:0, pending:0 }
              empMap[id].total++
              if (t.status === 'COMPLETED') empMap[id].done++
              else if (t.status === 'IN_PROGRESS') empMap[id].inProgress++
              else empMap[id].pending++
            })
            return Object.values(empMap).map((e, i) => {
              const pct = e.total > 0 ? Math.round((e.done/e.total)*100) : 0
              return (
                <tr key={i}>
                  <td><strong>{e.name}</strong></td>
                  <td>{e.total}</td>
                  <td style={{ color:'var(--accent2)' }}>{e.done}</td>
                  <td style={{ color:'var(--warn)' }}>{e.inProgress}</td>
                  <td style={{ color:'var(--muted)' }}>{e.pending}</td>
                  <td>
                    <div>{pct}%</div>
                    <ProgressBar value={pct} color={pct >= 80 ? 'blue' : pct >= 50 ? 'indigo' : 'warn'} />
                  </td>
                </tr>
              )
            })
          })()}
        </Table>
      </Card>
    </div>
  )
}
