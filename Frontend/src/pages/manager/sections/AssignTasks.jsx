import React, { useEffect, useState } from 'react'
import api from '../../../api/axios'
import { Card, CardHeader, CardTitle, Table, Chip, Btn, FormGroup, Input, Select, Textarea, FormGrid, FormActions, Modal, Spinner, Avatar } from '../../../components/UI'
import styles from './sections.module.css'

const INIT_FORM = { title:'', description:'', assignedTo:'', project:'', priority:'MEDIUM', dueDate:'', estimatedHours:'' }

const STATUS_COLOR  = { PENDING:'warn', IN_PROGRESS:'blue', COMPLETED:'green' }
const PRIORITY_COLOR = { HIGH:'red', MEDIUM:'blue', LOW:'gray' }

export default function AssignTasks({ showToast, preselectedEmployee, onClearPreselected }) {
  const [tasks, setTasks]       = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm]         = useState(INIT_FORM)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [editModal, setEditModal] = useState({ open:false, task:null })
  const [editForm, setEditForm] = useState({})

  // Auto-select employee if navigated from Team Members
  useEffect(() => {
    if (preselectedEmployee) {
      setForm(f => ({ ...f, assignedTo: preselectedEmployee._id }))
      if (onClearPreselected) onClearPreselected()
    }
  }, [preselectedEmployee])

  const fetchAll = () => {
    Promise.all([
      api.get('/manager-tasks/my-assigned'),
      api.get('/auth/employees'),
    ]).then(([t, e]) => {
      setTasks(Array.isArray(t.data) ? t.data : [])
      setEmployees(e.data.employees || [])
    }).catch(() => showToast('Failed to load data', 'error'))
    .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleAssign = async () => {
    if (!form.title.trim() || !form.assignedTo) {
      showToast('Title and Assignee are required', 'error'); return
    }
    setSaving(true)
    try {
      await api.post('/manager-tasks/assign', form)
      showToast('Task assigned successfully!')
      setForm(INIT_FORM)
      fetchAll()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign task', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return
    await api.delete(`/manager-tasks/${id}`)
    showToast('Task deleted')
    fetchAll()
  }

  const openEdit = (task) => {
    setEditForm({ status: task.status, priority: task.priority, title: task.title, dueDate: task.dueDate?.slice(0,10) || '' })
    setEditModal({ open:true, task })
  }

  const handleUpdate = async () => {
    try {
      await api.put(`/manager-tasks/${editModal.task._id}`, editForm)
      showToast('Task updated!')
      setEditModal({ open:false, task:null })
      fetchAll()
    } catch { showToast('Update failed', 'error') }
  }

  if (loading) return <Spinner />

  return (
    <div className="page-enter">
      {/* Assign Form */}
      <Card>
        <CardHeader><CardTitle>Assign New Task to Employee</CardTitle></CardHeader>
        <FormGrid>
          <FormGroup label="Task Title *">
            <Input placeholder="e.g. Implement login module" value={form.title} onChange={set('title')} />
          </FormGroup>
          <FormGroup label="Assign To *">
            <Select value={form.assignedTo} onChange={set('assignedTo')}>
              <option value="">— Select Employee —</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.designation || e.role})</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Project / Module">
            <Input placeholder="e.g. ERP Migration" value={form.project} onChange={set('project')} />
          </FormGroup>
          <FormGroup label="Priority">
            <Select value={form.priority} onChange={set('priority')}>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>
          </FormGroup>
          <FormGroup label="Deadline">
            <Input type="date" value={form.dueDate} onChange={set('dueDate')} />
          </FormGroup>
          <FormGroup label="Estimated Hours">
            <Input type="number" placeholder="e.g. 8" value={form.estimatedHours} onChange={set('estimatedHours')} />
          </FormGroup>
          <FormGroup label="Description" full>
            <Textarea placeholder="Task details, acceptance criteria..." value={form.description} onChange={set('description')} />
          </FormGroup>
        </FormGrid>
        <FormActions>
          <Btn variant="primary" size="md" onClick={handleAssign} disabled={saving}>{saving ? 'Assigning...' : 'Assign Task'}</Btn>
          <Btn variant="ghost" size="md" onClick={() => setForm(INIT_FORM)}>Clear</Btn>
        </FormActions>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tasks ({tasks.length})</CardTitle>
        </CardHeader>
        <Table headers={['Task', 'Assigned To', 'Project', 'Priority', 'Deadline', 'Status', 'Actions']}>
          {tasks.map(t => (
            <tr key={t._id}>
              <td><strong>{t.title}</strong></td>
              <td>
                <div className={styles.inlineEmp}>
                  <Avatar name={t.assignedTo?.name || '?'} size="sm" />
                  <span>{t.assignedTo?.name}</span>
                </div>
              </td>
              <td>{t.project || '—'}</td>
              <td><Chip color={PRIORITY_COLOR[t.priority]}>{t.priority}</Chip></td>
              <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-IN') : '—'}</td>
              <td><Chip color={STATUS_COLOR[t.status]}>{t.status.replace('_',' ')}</Chip></td>
              <td>
                <div className={styles.actionBtns}>
                  <Btn variant="ghost" size="sm" onClick={() => openEdit(t)}>Edit</Btn>
                  <Btn variant="danger" size="sm" onClick={() => handleDelete(t._id)}>Delete</Btn>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Edit Modal */}
      <Modal open={editModal.open} onClose={() => setEditModal({ open:false, task:null })} title={`Edit: ${editModal.task?.title}`}>
        <FormGrid>
          <FormGroup label="Title" full>
            <Input value={editForm.title || ''} onChange={e => setEditForm(p => ({...p, title:e.target.value}))} />
          </FormGroup>
          <FormGroup label="Status">
            <Select value={editForm.status || ''} onChange={e => setEditForm(p => ({...p, status:e.target.value}))}>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </FormGroup>
          <FormGroup label="Priority">
            <Select value={editForm.priority || ''} onChange={e => setEditForm(p => ({...p, priority:e.target.value}))}>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>
          </FormGroup>
          <FormGroup label="Deadline">
            <Input type="date" value={editForm.dueDate || ''} onChange={e => setEditForm(p => ({...p, dueDate:e.target.value}))} />
          </FormGroup>
        </FormGrid>
        <FormActions>
          <Btn variant="primary" size="md" onClick={handleUpdate}>Save Changes</Btn>
          <Btn variant="ghost" size="md" onClick={() => setEditModal({ open:false, task:null })}>Cancel</Btn>
        </FormActions>
      </Modal>
    </div>
  )
}
