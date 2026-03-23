import React, { useEffect, useState } from 'react'
import api from '../../../api/axios'
import { Card, CardHeader, CardTitle, Table, Chip, Btn, FormGroup, Select, Input, Textarea, FormGrid, FormActions, Spinner, Modal } from '../../../components/UI'
import styles from './sections.module.css'

const INIT = { employee:'', type:'PROMOTION', currentDesignation:'', proposedDesignation:'', currentCTC:'', incrementPercent:'', justification:'' }
const TYPE_COLOR   = { PROMOTION:'purple', INCREMENT:'blue', BOTH:'green' }
const STATUS_COLOR = { PENDING:'warn', APPROVED:'green', REJECTED:'red' }

export default function Promotions({ showToast }) {
  const [employees,  setEmployees]  = useState([])
  const [promotions, setPromotions] = useState([])
  const [form,       setForm]       = useState(INIT)
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [notifyModal, setNotifyModal] = useState({ open: false, promotion: null })
  const [customMsg,   setCustomMsg]   = useState('')
  const [notifying,   setNotifying]   = useState(false)

  const fetchAll = () => {
    Promise.all([
      api.get('/auth/employees'),
      api.get('/promotions/team'),
    ]).then(([e, p]) => {
      setEmployees(e.data.employees || [])
      setPromotions(Array.isArray(p.data) ? p.data : [])
    }).catch(() => showToast('Failed to load data', 'error'))
    .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.employee || !form.currentDesignation || !form.justification) {
      showToast('Employee, Current Designation, and Justification are required', 'error'); return
    }
    setSaving(true)
    try {
      await api.post('/promotions/recommend', { ...form, currentCTC: Number(form.currentCTC), incrementPercent: Number(form.incrementPercent) })
      showToast('Promotion recommendation submitted to HR!')
      setForm(INIT)
      fetchAll()
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed', 'error')
    } finally { setSaving(false) }
  }

  const openNotifyModal = (promo) => {
    const typeLabel = promo.type === 'PROMOTION' ? 'Promotion' : promo.type === 'INCREMENT' ? 'Salary Increment' : 'Promotion & Increment'
    setCustomMsg(`Congratulations ${promo.employee?.name}! Your ${typeLabel.toLowerCase()} has been officially approved. ${promo.proposedDesignation ? `Your new designation is ${promo.proposedDesignation}.` : ''} ${promo.incrementPercent ? `Salary increment: +${promo.incrementPercent}%.` : ''} We're proud of your hard work and dedication! 🎊`.trim())
    setNotifyModal({ open: true, promotion: promo })
  }

  const handleNotify = async () => {
    if (!notifyModal.promotion) return
    setNotifying(true)
    try {
      await api.post(`/promotions/${notifyModal.promotion._id}/notify`, { customMessage: customMsg })
      showToast(`✅ ${notifyModal.promotion.employee?.name} has been notified!`)
      setNotifyModal({ open: false, promotion: null })
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to notify', 'error')
    } finally { setNotifying(false) }
  }

  if (loading) return <Spinner />

  const approvedCount = promotions.filter(p => p.status === 'APPROVED').length

  return (
    <div className="page-enter">
      <Card>
        <CardHeader><CardTitle>Recommend Promotion / Increment</CardTitle></CardHeader>
        <FormGrid>
          <FormGroup label="Select Employee *">
            <Select value={form.employee} onChange={set('employee')}>
              <option value="">— Select Employee —</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.designation || e.role})</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Recommendation Type *">
            <Select value={form.type} onChange={set('type')}>
              <option value="PROMOTION">Promotion</option>
              <option value="INCREMENT">Salary Increment</option>
              <option value="BOTH">Promotion + Increment</option>
            </Select>
          </FormGroup>
          <FormGroup label="Current Designation *">
            <Input placeholder="e.g. Junior Developer" value={form.currentDesignation} onChange={set('currentDesignation')} />
          </FormGroup>
          <FormGroup label="Proposed Designation">
            <Input placeholder="e.g. Senior Developer" value={form.proposedDesignation} onChange={set('proposedDesignation')} />
          </FormGroup>
          <FormGroup label="Current CTC (₹)">
            <Input type="number" placeholder="e.g. 600000" value={form.currentCTC} onChange={set('currentCTC')} />
          </FormGroup>
          <FormGroup label="Proposed Increment %">
            <Input type="number" placeholder="e.g. 20" value={form.incrementPercent} onChange={set('incrementPercent')} />
          </FormGroup>
          <FormGroup label="Justification / Remarks *" full>
            <Textarea placeholder="Why does this employee deserve this promotion/increment? Mention key achievements, performance metrics..." value={form.justification} onChange={set('justification')} />
          </FormGroup>
        </FormGrid>
        <FormActions>
          <Btn variant="primary" size="md" onClick={handleSubmit} disabled={saving}>{saving ? 'Submitting...' : 'Submit to HR'}</Btn>
          <Btn variant="ghost" size="md" onClick={() => setForm(INIT)}>Clear</Btn>
        </FormActions>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promotion & Increment History ({promotions.length})</CardTitle>
          {approvedCount > 0 && (
            <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '4px 12px' }}>
              🎉 {approvedCount} approved — notify your team members!
            </div>
          )}
        </CardHeader>

        <Table headers={['Employee', 'Type', 'Current Role', 'Proposed Role', 'Increment %', 'Submitted', 'Status', 'Action']}>
          {promotions.map(p => (
            <tr key={p._id}>
              <td><strong>{p.employee?.name}</strong></td>
              <td><Chip color={TYPE_COLOR[p.type]}>{p.type}</Chip></td>
              <td>{p.currentDesignation}</td>
              <td>{p.proposedDesignation || '—'}</td>
              <td>
                {p.incrementPercent
                  ? <strong style={{ color:'#22d3a5' }}>+{p.incrementPercent}%</strong>
                  : <span style={{ color:'var(--muted)' }}>—</span>}
              </td>
              <td style={{ fontSize:'0.78rem', color:'var(--muted)' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
              <td><Chip color={STATUS_COLOR[p.status]}>{p.status}</Chip></td>
              <td>
                {p.status === 'APPROVED' ? (
                  <button
                    onClick={() => openNotifyModal(p)}
                    style={{
                      padding: '5px 12px', borderRadius: 8, border: '1.5px solid #bbf7d0',
                      background: '#f0fdf4', color: '#10b981', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#10b981'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#bbf7d0'; }}
                  >
                    🔔 Notify Employee
                  </button>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {p.status === 'PENDING' ? '⏳ Awaiting HR' : '—'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Notify Modal */}
      <Modal open={notifyModal.open} onClose={() => setNotifyModal({ open: false, promotion: null })} title={`Notify ${notifyModal.promotion?.employee?.name}`}>
        {notifyModal.promotion && (
          <div>
            {/* Promotion summary */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 32 }}>🎉</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{notifyModal.promotion.employee?.name}</div>
                  <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                    {notifyModal.promotion.type === 'PROMOTION' ? 'Promotion' : notifyModal.promotion.type === 'INCREMENT' ? 'Salary Increment' : 'Promotion & Increment'} — APPROVED by HR
                  </div>
                  {notifyModal.promotion.proposedDesignation && (
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                      {notifyModal.promotion.currentDesignation} → <strong>{notifyModal.promotion.proposedDesignation}</strong>
                    </div>
                  )}
                  {notifyModal.promotion.incrementPercent > 0 && (
                    <div style={{ fontSize: 12, color: '#475569' }}>Increment: <strong style={{ color:'#10b981' }}>+{notifyModal.promotion.incrementPercent}%</strong></div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569' }}>
              Notification Message
              <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8', marginLeft: 6 }}>The employee will see this in their notification bell</span>
            </div>
            <textarea
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a',
                resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                lineHeight: 1.6, boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#4f46e5'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" size="md" onClick={() => setNotifyModal({ open: false, promotion: null })}>Cancel</Btn>
              <Btn variant="primary" size="md" onClick={handleNotify} disabled={notifying || !customMsg.trim()}>
                {notifying ? 'Sending...' : '🔔 Send Notification'}
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
