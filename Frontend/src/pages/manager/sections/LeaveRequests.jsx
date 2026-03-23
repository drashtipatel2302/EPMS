import React, { useEffect, useState } from 'react'
import api from '../../../api/axios'
import { Card, CardHeader, CardTitle, Table, Chip, Btn, Spinner, Modal, FormGroup, Textarea } from '../../../components/UI'
import styles from './sections.module.css'

const STATUS_COLOR = { PENDING:'warn', APPROVED:'green', REJECTED:'red' }
const TYPE_COLOR   = { MEDICAL:'red', CASUAL:'blue', PERSONAL:'warn', ANNUAL:'green', OTHER:'gray' }

export default function LeaveRequests({ showToast }) {
  const [leaves, setLeaves]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  const [reviewModal, setReviewModal] = useState({ open:false, leave:null, action:'' })
  const [remarks, setRemarks]   = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchLeaves = () => {
    api.get('/leave/team')
      .then(r => setLeaves(Array.isArray(r.data) ? r.data : []))
      .catch(() => showToast('Failed to load leave requests', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLeaves() }, [])

  const openReview = (leave, action) => {
    setReviewModal({ open:true, leave, action })
    setRemarks('')
  }

  const handleReview = async () => {
    setProcessing(true)
    try {
      await api.put(`/leave/${reviewModal.leave._id}/review`, {
        status: reviewModal.action,
        managerRemarks: remarks
      })
      showToast(`Leave ${reviewModal.action.toLowerCase()} successfully!`)
      setReviewModal({ open:false, leave:null, action:'' })
      fetchLeaves()
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error')
    } finally { setProcessing(false) }
  }

  if (loading) return <Spinner />

  const filtered = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter)
  const pending  = leaves.filter(l => l.status === 'PENDING').length

  return (
    <div className="page-enter">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Leave Requests</CardTitle>
            {pending > 0 && <div style={{ marginTop:4 }}><Chip color="warn">{pending} Pending</Chip></div>}
          </div>
          <div className={styles.filterBtns}>
            {['ALL','PENDING','APPROVED','REJECTED'].map(f => (
              <Btn key={f} variant={filter===f ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter(f)}>{f}</Btn>
            ))}
          </div>
        </CardHeader>

        <Table headers={['Employee', 'Leave Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Action']}>
          {filtered.map(l => (
            <tr key={l._id}>
              <td>
                <div className={styles.inlineEmp}>
                  <span className={styles.empNameOnly}>{l.employee?.name}</span>
                  <div className={styles.empSubText}>{l.employee?.designation}</div>
                </div>
              </td>
              <td><Chip color={TYPE_COLOR[l.leaveType] || 'gray'}>{l.leaveType}</Chip></td>
              <td>{new Date(l.fromDate).toLocaleDateString('en-IN')}</td>
              <td>{new Date(l.toDate).toLocaleDateString('en-IN')}</td>
              <td><strong>{l.totalDays}</strong></td>
              <td><span className={styles.reasonText}>{l.reason}</span></td>
              <td><Chip color={STATUS_COLOR[l.status]}>{l.status}</Chip></td>
              <td>
                {l.status === 'PENDING' ? (
                  <div className={styles.actionBtns}>
                    <Btn variant="success" size="sm" onClick={() => openReview(l, 'APPROVED')}>Approve</Btn>
                    <Btn variant="danger"  size="sm" onClick={() => openReview(l, 'REJECTED')}>Reject</Btn>
                  </div>
                ) : (
                  <span className={styles.reviewedText}>
                    {l.reviewedBy?.name || 'Reviewed'}
                    {l.managerRemarks && <><br/><em>{l.managerRemarks}</em></>}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Review Modal */}
      <Modal
        open={reviewModal.open}
        onClose={() => setReviewModal({ open:false, leave:null, action:'' })}
        title={`${reviewModal.action === 'APPROVED' ? '✅ Approve' : '❌ Reject'} Leave`}
        size="sm"
      >
        <p className={styles.reviewInfo}>
          <strong>{reviewModal.leave?.employee?.name}</strong> — {reviewModal.leave?.leaveType} leave for <strong>{reviewModal.leave?.totalDays} day(s)</strong>
        </p>
        <p className={styles.reviewReason}>Reason: {reviewModal.leave?.reason}</p>
        <FormGroup label="Manager Remarks (optional)">
          <Textarea
            placeholder="Add any remarks..."
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            style={{ marginTop:8 }}
          />
        </FormGroup>
        <div className={styles.formActions}>
          <Btn
            variant={reviewModal.action === 'APPROVED' ? 'success' : 'danger'}
            size="md"
            onClick={handleReview}
            disabled={processing}
          >
            {processing ? 'Processing...' : `Confirm ${reviewModal.action === 'APPROVED' ? 'Approval' : 'Rejection'}`}
          </Btn>
          <Btn variant="ghost" size="md" onClick={() => setReviewModal({ open:false, leave:null, action:'' })}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  )
}
