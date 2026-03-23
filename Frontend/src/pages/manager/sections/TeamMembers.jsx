import React, { useEffect, useState } from 'react'
import api from '../../../api/axios'
import { Card, CardHeader, CardTitle, Chip, Btn, Avatar, Spinner, Modal } from '../../../components/UI'
import styles from './sections.module.css'

export default function TeamMembers({ showToast, onNavigate }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [modal, setModal]         = useState(false)

  const fetchEmployees = () => {
    api.get(`/auth/employees?search=${search}`)
      .then(r => setEmployees(r.data.employees || []))
      .catch(() => showToast('Failed to load employees', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEmployees() }, [search])

  const filtered = employees

  if (loading) return <Spinner />

  return (
    <div className="page-enter">
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({employees.length})</CardTitle>
          <input
            className={styles.searchInput}
            placeholder="🔍 Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </CardHeader>

        {filtered.length === 0 && (
          <p className={styles.empty}>No team members found in your department.</p>
        )}

        <div className={styles.empGrid}>
          {filtered.map(emp => (
            <div key={emp._id} className={styles.empCard}>
              <div className={styles.empCardTop}>
                <Avatar name={emp.name} size="md" />
                <div>
                  <div className={styles.empName}>{emp.name}</div>
                  <div className={styles.empRole}>{emp.designation || '—'}</div>
                  <div className={styles.empDept}>{emp.department}</div>
                </div>
              </div>
              <div className={styles.empMeta}>
                <div className={styles.empMetaItem}>
                  <span className={styles.metaLabel}>Employee ID</span>
                  <span className={styles.metaVal}>{emp.employeeId || 'N/A'}</span>
                </div>
                <div className={styles.empMetaItem}>
                  <span className={styles.metaLabel}>Joined</span>
                  <span className={styles.metaVal}>{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                </div>
                <div className={styles.empMetaItem}>
                  <span className={styles.metaLabel}>Status</span>
                  <Chip color={emp.isActive ? 'green' : 'gray'}>{emp.isActive ? 'Active' : 'Inactive'}</Chip>
                </div>
              </div>
              <div className={styles.empActions}>
                <Btn variant="ghost" size="sm" onClick={() => { setSelected(emp); setModal(true) }}>View Details</Btn>
                <Btn variant="primary" size="sm" onClick={() => onNavigate ? onNavigate('tasks', emp) : showToast(`Opening tasks for ${emp.name}`)}>Assign Task</Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Employee Detail Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Employee Details">
        {selected && (
          <div className={styles.empDetail}>
            <div className={styles.empDetailHead}>
              <Avatar name={selected.name} size="lg" />
              <div>
                <h2 className={styles.empDetailName}>{selected.name}</h2>
                <p className={styles.empDetailRole}>{selected.designation}</p>
                <Chip color={selected.isActive ? 'green' : 'gray'}>{selected.isActive ? 'Active' : 'Inactive'}</Chip>
              </div>
            </div>
            <div className={styles.empDetailGrid}>
              {[
                ['Email',        selected.email],
                ['Employee ID',  selected.employeeId || 'N/A'],
                ['Department',   selected.department],
                ['Role',         selected.role],
                ['Joining Date', selected.joiningDate ? new Date(selected.joiningDate).toLocaleDateString('en-IN') : 'N/A'],
              ].map(([k, v]) => (
                <div key={k} className={styles.empDetailItem}>
                  <span className={styles.detailLabel}>{k}</span>
                  <span className={styles.detailVal}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
