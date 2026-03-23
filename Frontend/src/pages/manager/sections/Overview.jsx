import React, { useEffect, useState } from 'react'
import api from '../../../api/axios'
import { KpiCard, Card, CardHeader, CardTitle, ProgressBar, Avatar, Chip, Btn, Spinner } from '../../../components/UI'
import styles from './sections.module.css'

export default function Overview({ onNavigate }) {
  const [employees, setEmployees] = useState([])
  const [tasks, setTasks]         = useState([])
  const [leaves, setLeaves]       = useState([])
  const [projects, setProjects]   = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/auth/employees').catch(() => ({ data: { employees: [] } })),
      api.get('/manager-tasks/my-assigned').catch(() => ({ data: [] })),
      api.get('/leave/team').catch(() => ({ data: [] })),
      api.get('/projects').catch(() => ({ data: [] })),
    ]).then(([empRes, taskRes, leaveRes, projRes]) => {
      setEmployees(empRes.data.employees || [])
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : [])
      setLeaves(Array.isArray(leaveRes.data) ? leaveRes.data : [])
      setProjects(Array.isArray(projRes.data) ? projRes.data : [])
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  const pendingLeaves   = leaves.filter(l => l.status === 'PENDING')
  const pendingTasks    = tasks.filter(t => t.status === 'PENDING')
  const completedTasks  = tasks.filter(t => t.status === 'COMPLETED')

  const progressColor = (p) => p >= 80 ? 'blue' : p >= 50 ? 'blue' : 'blue'

  return (
    <div className="page-enter">
      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <KpiCard icon="👥" value={employees.length} label="Team Members"    color="blue"  delta="Your department" onClick={() => onNavigate('team')} />
        <KpiCard icon="✅" value={completedTasks.length} label="Tasks Completed" color="green" delta={`${tasks.length} total assigned`} onClick={() => onNavigate('tasks')} />
        <KpiCard icon="⏳" value={pendingTasks.length}  label="Pending Tasks"  color="warn"  delta="Awaiting action" onClick={() => onNavigate('tasks')} />
        <KpiCard icon="🗓️" value={pendingLeaves.length} label="Leave Requests" color="red"   delta="Pending review"  onClick={() => onNavigate('leave')} />
        <KpiCard icon="🚀" value={projects.length}      label="Active Projects" color="purple" delta="Under your management" onClick={() => onNavigate('projects')} />
        <KpiCard icon="📈" value={employees.length > 0 ? '4.2' : '—'} label="Avg. Performance" color="blue" delta="Last quarter" onClick={() => onNavigate('reports')} />
      </div>

      <div className={styles.overviewGrid}>
        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <Btn variant="ghost" size="sm" onClick={() => onNavigate('projects')}>View All</Btn>
          </CardHeader>
          {projects.length === 0 && <p className={styles.empty}>No projects yet. <button className={styles.link} onClick={() => onNavigate('projects')}>Add one →</button></p>}
          {projects.slice(0, 5).map(p => (
            <div key={p._id} className={styles.projRow}>
              <div className={styles.projRowTop}>
                <span className={styles.projName}>{p.name}</span>
                <span className={styles.projPct} style={{ color: p.progress >= 80 ? '#0ea5e9' : p.progress >= 50 ? '#0ea5e9' : '#f59e0b' }}>{p.progress}%</span>
              </div>
              <ProgressBar value={p.progress} color={progressColor(p.progress)} />
            </div>
          ))}
        </Card>

        {/* Pending Leaves */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
            <Btn variant="ghost" size="sm" onClick={() => onNavigate('leave')}>View All</Btn>
          </CardHeader>
          {pendingLeaves.length === 0 && <p className={styles.empty}>No pending requests 🎉</p>}
          {pendingLeaves.slice(0, 4).map(l => (
            <div key={l._id} className={styles.leaveRow}>
              <Avatar name={l.employee?.name || '?'} size="sm" />
              <div className={styles.leaveInfo}>
                <div className={styles.leaveName}>{l.employee?.name}</div>
                <div className={styles.leaveMeta}>{l.leaveType} · {l.totalDays} days · {new Date(l.fromDate).toLocaleDateString('en-IN')}</div>
              </div>
              <Chip color="warn">Pending</Chip>
            </div>
          ))}
        </Card>
      </div>

      {/* Team Quick View */}
      {employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team at a Glance</CardTitle>
            <Btn variant="ghost" size="sm" onClick={() => onNavigate('team')}>View All Members</Btn>
          </CardHeader>
          <div className={styles.teamGlance}>
            {employees.slice(0, 6).map(e => (
              <div key={e._id} className={styles.glanceCard}>
                <Avatar name={e.name} size="md" />
                <div className={styles.glanceName}>{e.name}</div>
                <div className={styles.glanceRole}>{e.designation || e.role}</div>
                <Chip color={e.isActive ? 'green' : 'gray'}>{e.isActive ? 'Active' : 'Inactive'}</Chip>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
