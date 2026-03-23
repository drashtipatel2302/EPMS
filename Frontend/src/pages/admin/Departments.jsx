import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Card, Button } from '../../components/UI';
import Loader from '../../components/Loader';
import { fetchEmployees, fetchDepartments, createDepartment, editDepartment, removeDepartment } from '../../services/api';

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = ['#6C63FF', '#43E8AC', '#FFB547', '#FF6584', '#8B85FF', '#38BDF8', '#F472B6', '#A78BFA'];

const inputStyle = {
  width: '100%', padding: '9px 12px', boxSizing: 'border-box',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)', color: 'var(--text-primary)',
  fontSize: 13, outline: 'none',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#FF6584' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background: 'rgba(255,101,132,0.12)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 8, padding: '10px 14px', color: '#FF6584', fontSize: 13, marginBottom: 16 }}>
      {msg}
    </div>
  );
}

function Modal({ title, onClose, onSubmit, loading, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 28, width: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        {children}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={onSubmit} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ name, onClose, onConfirm, loading }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 28, width: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Delete Department</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 24px' }}>
          Are you sure you want to delete <strong>"{name}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '7px 16px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, background: '#FF6584', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeptModal({ dept, managers, onClose, onSuccess }) {
  const isEdit = !!dept;
  const [form, setForm] = useState({
    name: dept?.name || '',
    description: dept?.description || '',
    manager: dept?.manager?._id || dept?.manager || '',
    isActive: dept?.isActive !== false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Department name is required.'); return; }
    setError(''); setLoading(true);
    try {
      const payload = { name: form.name.trim(), description: form.description, manager: form.manager || undefined, isActive: form.isActive };
      if (isEdit) await editDepartment(dept._id, payload);
      else await createDepartment(payload);
      onSuccess();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? `Edit — ${dept.name}` : 'Add New Department'} onClose={onClose} onSubmit={handleSubmit} loading={loading}>
      <ErrorBanner msg={error} />
      <Field label="Department Name" required>
        <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Engineering" />
      </Field>
      <Field label="Description">
        <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of this department…" />
      </Field>
      <Field label="Department Manager">
        <select style={inputStyle} value={form.manager} onChange={e => set('manager', e.target.value)}>
          <option value="">— No manager assigned —</option>
          {managers.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
        </select>
      </Field>
      {isEdit && (
        <Field label="Status">
          <select style={inputStyle} value={form.isActive ? 'active' : 'inactive'} onChange={e => set('isActive', e.target.value === 'active')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
      )}
    </Modal>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Departments() {
  const [depts, setDepts]             = useState([]);
  const [managers, setManagers]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showAdd, setShowAdd]         = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [deptsData, empData] = await Promise.all([
        fetchDepartments(),
        fetchEmployees({ limit: 200 }),
      ]);
      setDepts(deptsData);
      setManagers(empData.employees.filter(e => ['SUPER_ADMIN', 'HR', 'MANAGER'].includes(e.role)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeDepartment(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const activeDepts   = depts.filter(d => d.isActive !== false);
  const inactiveDepts = depts.filter(d => d.isActive === false);

  return (
    <Layout>
      {showAdd && <DeptModal managers={managers} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); load(); }} />}
      {editTarget && <DeptModal dept={editTarget} managers={managers} onClose={() => setEditTarget(null)} onSuccess={() => { setEditTarget(null); load(); }} />}
      {deleteTarget && <ConfirmModal name={deleteTarget.name} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} />}

      <div style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 24, color: 'var(--role-color)', margin: 0, letterSpacing: '-0.3px' }}>Departments</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {depts.length} total · {activeDepts.length} active · {inactiveDepts.length} inactive
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowAdd(true)}>+ Add Department</Button>
        </div>

        <ErrorBanner msg={error} />

        {loading ? <Loader /> : depts.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              No departments yet. Click <strong>+ Add Department</strong> to create one.
            </div>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {depts.map((d, i) => {
              const color = COLORS[i % COLORS.length];
              const isInactive = d.isActive === false;
              return (
                <Card key={d._id} style={{ position: 'relative', overflow: 'hidden', opacity: isInactive ? 0.65 : 1 }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${color}20, transparent 70%)`, pointerEvents: 'none' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `${color}20`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color }}>
                        {d.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{d.name}</span>
                          {isInactive && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,101,132,0.12)', color: '#FF6584' }}>INACTIVE</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          Manager: <span style={{ color: 'var(--text-secondary)' }}>{d.manager?.name || '—'}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <Button variant="secondary" size="sm" onClick={() => setEditTarget(d)}>Edit</Button>
                      <button onClick={() => setDeleteTarget(d)} style={{ padding: '5px 10px', borderRadius: 'var(--r-sm)', fontSize: 12, background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.25)', color: '#FF6584', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                    </div>
                  </div>

                  {d.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.6 }}>{d.description}</p>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${color}12`, color, fontWeight: 600 }}>
                      {isInactive ? '✗ Inactive' : '✓ Active'}
                    </span>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Created {new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {d.manager && (
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        👤 {d.manager.name}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
