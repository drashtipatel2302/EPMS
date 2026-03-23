import React, { useEffect, useState } from 'react'
import api from '../../../api/axios'
import { Card, CardHeader, CardTitle, Chip, Btn, ProgressBar, Modal, FormGroup, Spinner } from '../../../components/UI'
import styles from './sections.module.css'

const INIT = { name:'', description:'', status:'NOT_STARTED', progress:0, startDate:'', dueDate:'', teamMembers:[] }

const STATUS_STYLE = {
  NOT_STARTED:     { color:'gray',  label:'Not Started'     },
  IN_PROGRESS:     { color:'warn',  label:'In Progress'     },
  NEAR_COMPLETION: { color:'blue',  label:'Near Completion' },
  COMPLETED:       { color:'green', label:'Completed'       },
  ON_HOLD:         { color:'gray',  label:'On Hold'         },
  BEHIND_SCHEDULE: { color:'red',   label:'Behind Schedule' },
}

const PC = p => p >= 80 ? '#0ea5e9' : p >= 40 ? '#6C63FF' : '#FFB547'
const fmtDT = d => d ? new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit', hour12:true }) : '—'
const fmtD  = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'

// ── Updates panel shown inside manager's project card ────────────────────────
function UpdatesPanel({ updates }) {
  const [open, setOpen] = useState(false)
  const sorted = [...(updates||[])].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))

  return (
    <div style={{ marginTop:12, borderTop:'1px solid var(--border)', paddingTop:10 }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        fontSize:12, fontWeight:700, color:'#6C63FF', background:'none', border:'none',
        cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:6
      }}>
        {open ? '▲' : '▼'} Employee Updates ({updates?.length||0})
        {updates?.length > 0 && !open && (
          <span style={{ fontSize:11, fontWeight:400, color:'var(--text-muted)' }}>
            — Last: {fmtDT(sorted[0]?.createdAt)}
          </span>
        )}
      </button>

      {open && (
        <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8, maxHeight:320, overflowY:'auto' }}>
          {sorted.length === 0 ? (
            <div style={{ fontSize:12, color:'var(--text-muted)', padding:'8px 0' }}>No updates from employees yet.</div>
          ) : sorted.map((u,i) => (
            <div key={i} style={{
              padding:'10px 14px', background:'var(--bg-elevated)', borderRadius:10,
              border:'1px solid var(--border)', borderLeft:`3px solid ${PC(u.progress)}`
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{
                    width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#6C63FF,#8B85FF)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'#fff', fontSize:11, fontWeight:800, flexShrink:0
                  }}>
                    {(u.updatedBy?.name||'?')[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{u.updatedBy?.name||'Team member'}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:PC(u.progress) }}>{u.progress}%</span>
                  <span style={{
                    fontSize:11, padding:'2px 8px', borderRadius:20,
                    background: u.status === 'COMPLETED' ? 'rgba(67,232,172,0.18)' : u.status === 'IN_PROGRESS' ? 'rgba(108,99,255,0.12)' : 'rgba(156,163,175,0.15)',
                    color: u.status === 'COMPLETED' ? '#059669' : u.status === 'IN_PROGRESS' ? '#6C63FF' : '#6B7280',
                    fontWeight:600
                  }}>
                    {STATUS_STYLE[u.status]?.label || u.status}
                  </span>
                  {u.hoursLogged > 0 && (
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>⏱ {u.hoursLogged}h</span>
                  )}
                </div>
                <span style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0 }}>{fmtDT(u.createdAt)}</span>
              </div>
              {u.note && (
                <div style={{ fontSize:12, color:'var(--text-primary)', lineHeight:1.5, marginBottom: u.blockers ? 5 : 0 }}>
                  📝 {u.note}
                </div>
              )}
              {u.blockers && (
                <div style={{ fontSize:12, color:'#EF4444', marginTop:4, padding:'6px 10px', background:'rgba(239,68,68,0.06)', borderRadius:6 }}>
                  🚧 <strong>Blocker:</strong> {u.blockers}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProjectProgress({ showToast }) {
  const [projects,  setProjects]  = useState([])
  const [employees, setEmployees] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState({ open:false, mode:'add', project:null })
  const [form,      setForm]      = useState(INIT)
  const [saving,    setSaving]    = useState(false)
  const [viewUpdates, setViewUpdates] = useState(null) // project id with expanded updates

  const fetchAll = () => {
    Promise.all([
      api.get('/projects'),
      api.get('/projects/assignable-employees'),
    ]).then(([p, e]) => {
      setProjects(Array.isArray(p.data) ? p.data : [])
      setEmployees(e.data.employees || [])
    }).catch(() => showToast('Failed to load projects', 'error'))
    .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const openAdd = () => { setForm(INIT); setModal({ open:true, mode:'add', project:null }) }
  const openEdit = proj => {
    setForm({
      name:        proj.name,
      description: proj.description || '',
      status:      proj.status,
      progress:    proj.progress,
      startDate:   proj.startDate?.slice(0,10) || '',
      dueDate:     proj.dueDate?.slice(0,10)   || '',
      teamMembers: proj.teamMembers?.map(m => m._id || m) || [],
    })
    setModal({ open:true, mode:'edit', project:proj })
  }

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Project name required', 'error'); return }
    setSaving(true)
    try {
      if (modal.mode === 'add') {
        await api.post('/projects', form)
        showToast('Project created!')
      } else {
        await api.put(`/projects/${modal.project._id}`, form)
        showToast('Project updated!')
      }
      setModal({ open:false, mode:'add', project:null })
      fetchAll()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this project?')) return
    await api.delete(`/projects/${id}`)
    showToast('Project deleted')
    fetchAll()
  }

  const INP = { width:'100%', padding:'9px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:13, outline:'none', boxSizing:'border-box' }

  if (loading) return <Spinner />

  return (
    <div className="page-enter">
      <div className={styles.projHeader}>
        <h2 className={styles.projCount}>{projects.length} Project{projects.length!==1?'s':''}</h2>
        <Btn variant="primary" size="md" onClick={openAdd}>+ New Project</Btn>
      </div>

      {projects.length === 0 && (
        <Card><p className={styles.empty}>No projects yet. Click <strong>+ New Project</strong> to create one.</p></Card>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        {projects.map(p => {
          const st = STATUS_STYLE[p.status] || STATUS_STYLE.NOT_STARTED
          const pc = PC(p.progress)
          const isOverdue = p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'COMPLETED'
          const hasBlockers = (p.updates||[]).some(u => u.blockers)
          const newUpdates = (p.updates||[]).length

          return (
            <Card key={p._id}>
              <div style={{ display:'flex', gap:18 }}>
                {/* Main info */}
                <div style={{ flex:1, minWidth:0 }}>
                  {/* Title row */}
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:16, color:'var(--text-primary)' }}>{p.name}</div>
                      {p.description && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>{p.description}</div>}
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0, marginLeft:12 }}>
                      <Chip color={st.color}>{st.label}</Chip>
                      {isOverdue && <Chip color="red">OVERDUE</Chip>}
                      {hasBlockers && <Chip color="red">🚧 Blocker</Chip>}
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Progress</span>
                      <span style={{ fontSize:13, fontWeight:800, color:pc }}>{p.progress}%</span>
                    </div>
                    <div style={{ height:8, background:'var(--bg-elevated)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${p.progress}%`, background:`linear-gradient(90deg,${pc},${pc}cc)`, borderRadius:99, transition:'width 0.5s' }}/>
                    </div>
                  </div>

                  {/* Meta grid */}
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:12, color:'var(--text-secondary)', marginBottom:8 }}>
                    {p.startDate && <span>🚀 Start: <strong>{fmtD(p.startDate)}</strong></span>}
                    <span style={{ color: isOverdue ? '#EF4444' : 'inherit' }}>📅 Due: <strong>{fmtD(p.dueDate)}</strong></span>
                    {p.teamMembers?.length > 0 && (
                      <span>👥 <strong>{p.teamMembers.map(m=>m.name||m).join(', ')}</strong></span>
                    )}
                    {newUpdates > 0 && (
                      <span style={{ color:'#6C63FF' }}>📬 <strong>{newUpdates}</strong> update{newUpdates!==1?'s':''} from team</span>
                    )}
                  </div>

                  {/* Updates panel */}
                  <UpdatesPanel updates={p.updates} />
                </div>

                {/* Actions column */}
                <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                  <Btn variant="ghost" size="sm" onClick={() => openEdit(p)}>✏️ Edit</Btn>
                  <Btn variant="danger" size="sm" onClick={() => handleDelete(p._id)}>🗑 Delete</Btn>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open:false, mode:'add', project:null })}
        title={modal.mode === 'add' ? 'Create New Project' : `Edit: ${modal.project?.name}`}
        size="lg"
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', display:'block', marginBottom:5 }}>Project Name *</label>
            <input placeholder="e.g. ERP Migration" value={form.name} onChange={set('name')} style={INP}/>
          </div>

          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', display:'block', marginBottom:5 }}>Status</label>
            <select value={form.status} onChange={set('status')} style={INP}>
              {Object.entries(STATUS_STYLE).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', display:'block', marginBottom:5 }}>
              Progress: <span style={{ color:PC(form.progress) }}>{form.progress}%</span>
            </label>
            <input type="range" min={0} max={100} step={5} value={form.progress} onChange={set('progress')} style={{ width:'100%', accentColor:'#6C63FF', marginTop:10 }}/>
          </div>

          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', display:'block', marginBottom:5 }}>Start Date</label>
            <input type="date" value={form.startDate} onChange={set('startDate')} style={INP}/>
          </div>

          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', display:'block', marginBottom:5 }}>Due Date</label>
            <input type="date" value={form.dueDate} onChange={set('dueDate')} style={INP}/>
          </div>

          <div style={{ gridColumn:'1/-1' }}>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', display:'block', marginBottom:5 }}>
              Team Members ({employees.length} available)
            </label>
            <select multiple value={form.teamMembers}
              onChange={e => setForm(p => ({ ...p, teamMembers: Array.from(e.target.selectedOptions, o => o.value) }))}
              style={{ ...INP, minHeight:110 }}>
              {employees.map(e => <option key={e._id} value={e._id}>{e.name} — {e.department||'No Dept'} · {e.designation||'Employee'}</option>)}
            </select>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Hold Ctrl/Cmd to select multiple</div>
          </div>

          <div style={{ gridColumn:'1/-1' }}>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', display:'block', marginBottom:5 }}>Description</label>
            <textarea rows={3} placeholder="Project description, goals, scope..." value={form.description} onChange={set('description')} style={{ ...INP, resize:'vertical', lineHeight:1.6 }}/>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
          <Btn variant="primary" size="md" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : modal.mode === 'add' ? 'Create Project' : 'Save Changes'}</Btn>
          <Btn variant="ghost"   size="md" onClick={() => setModal({ open:false, mode:'add', project:null })}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}
