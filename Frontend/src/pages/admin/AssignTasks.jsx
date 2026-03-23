import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, SectionHeader, Button } from '../../components/UI';
import Loader from '../../components/Loader';
import { assignTask, getAssignedTasks, updateAssignedTaskStatus, fetchManagers } from '../../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_META = {
  LOW:    { color: '#43E8AC', bg: 'rgba(67,232,172,0.12)'  },
  MEDIUM: { color: '#FFB547', bg: 'rgba(255,181,71,0.12)'  },
  HIGH:   { color: '#FF6584', bg: 'rgba(255,101,132,0.12)' },
};

const STATUS_META = {
  PENDING:     { color: '#FFB547', bg: 'rgba(255,181,71,0.12)',  label: 'Pending'     },
  IN_PROGRESS: { color: '#6C63FF', bg: 'rgba(108,99,255,0.12)', label: 'In Progress' },
  COMPLETED:   { color: '#43E8AC', bg: 'rgba(67,232,172,0.12)', label: 'Completed'   },
};

const inputStyle = {
  width: '100%', padding: '9px 12px', boxSizing: 'border-box',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)', color: 'var(--text-primary)',
  fontSize: 13, outline: 'none',
};

// ─── Helper components ────────────────────────────────────────────────────────

function Field({ label, required, children, half }) {
  return (
    <div style={{ marginBottom: 16, gridColumn: half ? undefined : '1 / -1' }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600,
        color: 'var(--text-muted)', textTransform: 'uppercase',
        letterSpacing: 0.8, marginBottom: 6,
      }}>
        {label}{required && <span style={{ color: '#FF6584' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      background: 'rgba(255,101,132,0.12)', border: '1px solid rgba(255,101,132,0.3)',
      borderRadius: 8, padding: '10px 14px', color: '#FF6584', fontSize: 13, marginBottom: 16,
    }}>{msg}</div>
  );
}

function SuccessBanner({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      background: 'rgba(67,232,172,0.12)', border: '1px solid rgba(67,232,172,0.3)',
      borderRadius: 8, padding: '10px 14px', color: '#43E8AC', fontSize: 13, marginBottom: 16,
    }}>✓ {msg}</div>
  );
}

function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority] || PRIORITY_META.MEDIUM;
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, background: m.bg, color: m.color, fontSize: 11, fontWeight: 600 }}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, background: m.bg, color: m.color, fontSize: 11, fontWeight: 600 }}>
      {m.label}
    </span>
  );
}

// ─── Manager Select ───────────────────────────────────────────────────────────
// Fetches only MANAGER-role users from the real /api/auth/employees endpoint.

function ManagerSelect({ value, onChange, managers, loading, error }) {
  if (loading) {
    return (
      <div style={{
        ...inputStyle, display: 'flex', alignItems: 'center', gap: 8,
        color: 'var(--text-muted)', cursor: 'not-allowed',
      }}>
        <span style={{
          width: 12, height: 12, border: '2px solid #6C63FF',
          borderTopColor: 'transparent', borderRadius: '50%',
          display: 'inline-block', animation: 'spin 0.7s linear infinite',
        }} />
        Loading managers…
      </div>
    );
  }

  return (
    <>
      <select
        style={inputStyle}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={e => e.target.style.borderColor = '#6C63FF'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      >
        <option value="">Select a manager…</option>
        {managers.map(m => (
          <option key={m._id || m.id} value={m._id || m.id}>
            {m.name}{m.department ? ` — ${m.department}` : ''}{m.designation ? ` (${m.designation})` : ''}
          </option>
        ))}
      </select>
      {error && (
        <div style={{ fontSize: 11, color: '#FFB547', marginTop: 4 }}>
          ⚠ Could not load managers from server — showing cached data
        </div>
      )}
      {!loading && !error && managers.length === 0 && (
        <div style={{ fontSize: 11, color: '#FFB547', marginTop: 4 }}>
          No managers found in the user table.
        </div>
      )}
    </>
  );
}

// ─── Assign Task Form ─────────────────────────────────────────────────────────

function AssignTaskForm({ managers, managersLoading, managersError, onSuccess }) {
  const empty = { title: '', description: '', assignedTo: '', priority: 'MEDIUM', dueDate: '' };
  const [form, setForm]       = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) { setError('Task title is required.');  return; }
    if (!form.assignedTo)   { setError('Please select a manager.'); return; }
    setError(''); setLoading(true);
    try {
      await assignTask(form);
      setSuccess(`Task "${form.title}" assigned successfully!`);
      setForm(empty);
      onSuccess?.();
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <SectionHeader
        title="Assign New Task"
        subtitle="Create and assign a task to a manager"
      />

      <ErrorBanner msg={error} />
      <SuccessBanner msg={success} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>

        {/* Title — full width */}
        <Field label="Task Title" required>
          <input
            style={inputStyle} value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Prepare Q2 performance report"
            onFocus={e => e.target.style.borderColor = '#6C63FF'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </Field>

        {/* Description — full width */}
        <Field label="Description">
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe the task in detail…"
            onFocus={e => e.target.style.borderColor = '#6C63FF'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </Field>

        {/* Manager dropdown — fetched from user table (role=MANAGER) */}
        <Field label="Assign To (Manager)" required half>
          <ManagerSelect
            value={form.assignedTo}
            onChange={v => set('assignedTo', v)}
            managers={managers}
            loading={managersLoading}
            error={managersError}
          />
        </Field>

        {/* Priority */}
        <Field label="Priority" half>
          <select
            style={inputStyle} value={form.priority}
            onChange={e => set('priority', e.target.value)}
            onFocus={e => e.target.style.borderColor = '#6C63FF'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </Field>

        {/* Due Date */}
        <Field label="Due Date" half>
          <input
            type="date" style={inputStyle} value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            onFocus={e => e.target.style.borderColor = '#6C63FF'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </Field>

      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 10 }}>
        <Button variant="secondary" size="sm" onClick={() => { setForm(empty); setError(''); }}>
          Reset
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={loading || managersLoading}>
          {loading ? 'Assigning…' : '➤ Assign Task'}
        </Button>
      </div>
    </Card>
  );
}

// ─── Tasks Table ──────────────────────────────────────────────────────────────

function TasksTable({ tasks, loading, error, onRefresh }) {
  const [filterStatus,   setFilterStatus]   = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = tasks.filter(t => {
    const matchStatus   = filterStatus   === 'ALL' || t.status   === filterStatus;
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    const matchSearch   = !search
      || t.title.toLowerCase().includes(search.toLowerCase())
      || (t.assignedTo?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const counts = {
    total:      tasks.length,
    pending:    tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed:  tasks.filter(t => t.status === 'COMPLETED').length,
  };

  return (
    <div>
      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Tasks',  value: counts.total,      color: '#6C63FF' },
          { label: 'Pending',      value: counts.pending,    color: '#FFB547' },
          { label: 'In Progress',  value: counts.inProgress, color: '#6C63FF' },
          { label: 'Completed',    value: counts.completed,  color: '#43E8AC' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', padding: '14px 16px',
            borderLeft: `3px solid ${s.color}`,
          }}>
            <div style={{ fontWeight: 500, fontSize: 22, color: 'var(--text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Assigned Tasks</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>All tasks assigned to managers</div>
          </div>
          <Button variant="secondary" size="sm" onClick={onRefresh}>↻ Refresh</Button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            placeholder="Search by task or manager…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#6C63FF'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          {/* Status chips */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {[['ALL','All'],['PENDING','⏳ Pending'],['IN_PROGRESS','🔄 In Progress'],['COMPLETED','✅ Done']].map(([val, label]) => (
              <button key={val} onClick={() => setFilterStatus(val)} style={{
                padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${filterStatus === val ? '#6C63FF' : 'var(--border)'}`,
                background: filterStatus === val ? 'rgba(108,99,255,0.15)' : 'var(--bg-elevated)',
                color: filterStatus === val ? '#6C63FF' : 'var(--text-secondary)',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>{label}</button>
            ))}
          </div>
          {/* Priority chips */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {[['ALL','All'],['LOW','🟢 Low'],['MEDIUM','🟡 Med'],['HIGH','🔴 High']].map(([val, label]) => {
              const colors = { LOW: '#43E8AC', MEDIUM: '#FFB547', HIGH: '#FF6584' };
              const c = colors[val] || '#6C63FF';
              return (
                <button key={val} onClick={() => setFilterPriority(val)} style={{
                  padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${filterPriority === val ? c : 'var(--border)'}`,
                  background: filterPriority === val ? `${c}22` : 'var(--bg-elevated)',
                  color: filterPriority === val ? c : 'var(--text-secondary)',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}>{label}</button>
              );
            })}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,101,132,0.12)', border: '1px solid rgba(255,101,132,0.3)',
            borderRadius: 8, padding: '12px 16px', color: '#FF6584', fontSize: 13, marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>⚠</span>
            <div>
              <strong>Failed to load tasks from task table.</strong>
              <div style={{ marginTop: 2, opacity: 0.85 }}>{error}</div>
            </div>
          </div>
        )}
        {loading ? <Loader /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Task', 'Assigned To', 'Priority', 'Status', 'Due Date', 'Created'].map(h => (
                    <th key={h} style={{
                      padding: '10px 12px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                      No tasks found. Assign your first task above!
                    </td>
                  </tr>
                ) : filtered.map(task => {
                  const managerName = task.assignedTo?.name || task.assignedTo || '—';
                  const managerDept = task.assignedTo?.department || '';
                  const initials    = managerName !== '—'
                    ? managerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : '?';
                  const dueDate  = task.dueDate  ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                  const created  = task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';
                  const isOverdue = task.dueDate && task.status !== 'COMPLETED' && new Date(task.dueDate) < new Date();

                  return (
                    <tr key={task._id || task.id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px', maxWidth: 280 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{task.title}</div>
                        {task.description && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                            background: 'rgba(67,232,172,0.15)', border: '1px solid rgba(67,232,172,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: '#43E8AC',
                          }}>{initials}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{managerName}</div>
                            {managerDept && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{managerDept}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}><PriorityBadge priority={task.priority} /></td>
                      <td style={{ padding: '12px' }}><StatusBadge status={task.status} /></td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: 12, color: isOverdue ? '#FF6584' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400 }}>
                          {isOverdue ? '⚠ ' : ''}{dueDate}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)' }}>{created}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {tasks.length} tasks
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AssignTasks() {
  const [tasks,           setTasks]           = useState([]);
  const [tasksLoading,    setTasksLoading]    = useState(true);
  const [tasksError,      setTasksError]      = useState('');

  // Manager list — fetched from real user table, filtered to role=MANAGER
  const [managers,        setManagers]        = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [managersError,   setManagersError]   = useState('');

  const [tab, setTab] = useState('assign');

  // Fetch managers once on mount from /api/auth/employees (role=MANAGER only)
  useEffect(() => {
    setManagersLoading(true);
    fetchManagers()
      .then(list => {
        setManagers(list);
        setManagersError('');
      })
      .catch(e => {
        setManagersError(e.message);
        // Fallback: empty list — ManagerSelect will show a warning
        setManagers([]);
      })
      .finally(() => setManagersLoading(false));
  }, []);

  const loadTasks = async () => {
    setTasksLoading(true);
    setTasksError('');
    try {
      const t = await getAssignedTasks();
      setTasks(t);
    } catch (e) {
      setTasksError(e.message || 'Failed to fetch tasks from the task table.');
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const tabStyle = (active) => ({
    padding: '8px 20px', borderRadius: 'var(--r-sm)',
    background: active ? 'linear-gradient(90deg, #6C63FF, #8B85FF)' : 'var(--bg-elevated)',
    color: active ? '#fff' : 'var(--text-secondary)',
    border: active ? 'none' : '1px solid var(--border)',
    fontWeight: active ? 700 : 500,
    fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
  });

  return (
    <Layout>
      <div style={{ maxWidth: 1100 }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Task Management
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
            Assign tasks to managers and track their progress
            {!managersLoading && managers.length > 0 && (
              <span style={{ marginLeft: 8, color: '#43E8AC', fontWeight: 600 }}>
                · {managers.length} manager{managers.length !== 1 ? 's' : ''} available
              </span>
            )}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button style={tabStyle(tab === 'assign')} onClick={() => setTab('assign')}>
            ➕ Assign Task
          </button>
          <button style={tabStyle(tab === 'list')} onClick={() => setTab('list')}>
            📋 View All Tasks {tasks.length > 0 && `(${tasks.length})`}
          </button>
        </div>

        {tab === 'assign' && (
          <AssignTaskForm
            managers={managers}
            managersLoading={managersLoading}
            managersError={managersError}
            onSuccess={() => { loadTasks(); setTab('list'); }}
          />
        )}

        {tab === 'list' && (
          <TasksTable tasks={tasks} loading={tasksLoading} error={tasksError} onRefresh={loadTasks} />
        )}

      </div>
    </Layout>
  );
}
