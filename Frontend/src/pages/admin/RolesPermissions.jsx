import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Card, SectionHeader, Button } from '../../components/UI';

const ROLE_COLORS = { admin: '#6C63FF', manager: '#38BDF8', employee: '#43E8AC', hr: '#FF6584' };
const ROLE_ICONS  = { admin: '🛡️', manager: '👔', employee: '👤', hr: '🧑' };

const DEFAULT_PERMS = {
  admin: {
    'User Management':    { create: true,  read: true,  update: true,  delete: true  },
    'Departments':        { create: true,  read: true,  update: true,  delete: true  },
    'KPI & Reports':      { create: true,  read: true,  update: true,  delete: true  },
    'Announcements':      { create: true,  read: true,  update: true,  delete: true  },
    'System Settings':    { create: true,  read: true,  update: true,  delete: true  },
    'Performance Reviews':{ create: true,  read: true,  update: true,  delete: true  },
    'Leave Management':   { create: false, read: true,  update: true,  delete: false },
    'Salary Management':  { create: false, read: true,  update: false, delete: false },
  },
  manager: {
    'User Management':    { create: false, read: true,  update: false, delete: false },
    'Departments':        { create: false, read: true,  update: false, delete: false },
    'KPI & Reports':      { create: false, read: true,  update: false, delete: false },
    'Announcements':      { create: false, read: true,  update: false, delete: false },
    'System Settings':    { create: false, read: false, update: false, delete: false },
    'Performance Reviews':{ create: true,  read: true,  update: true,  delete: false },
    'Leave Management':   { create: false, read: true,  update: true,  delete: false },
    'Salary Management':  { create: false, read: false, update: false, delete: false },
  },
  employee: {
    'User Management':    { create: false, read: false, update: false, delete: false },
    'Departments':        { create: false, read: true,  update: false, delete: false },
    'KPI & Reports':      { create: false, read: false, update: false, delete: false },
    'Announcements':      { create: false, read: true,  update: false, delete: false },
    'System Settings':    { create: false, read: false, update: false, delete: false },
    'Performance Reviews':{ create: true,  read: true,  update: true,  delete: false },
    'Leave Management':   { create: true,  read: true,  update: false, delete: false },
    'Salary Management':  { create: false, read: true,  update: false, delete: false },
  },
  hr: {
    'User Management':    { create: true,  read: true,  update: true,  delete: false },
    'Departments':        { create: false, read: true,  update: false, delete: false },
    'KPI & Reports':      { create: false, read: true,  update: false, delete: false },
    'Announcements':      { create: true,  read: true,  update: true,  delete: false },
    'System Settings':    { create: false, read: true,  update: false, delete: false },
    'Performance Reviews':{ create: true,  read: true,  update: true,  delete: false },
    'Leave Management':   { create: true,  read: true,  update: true,  delete: true  },
    'Salary Management':  { create: true,  read: true,  update: true,  delete: false },
  },
};

export default function RolesPermissions() {
  const [perms, setPerms] = useState(DEFAULT_PERMS);
  const [activeRole, setActiveRole] = useState('admin');
  const [saved, setSaved] = useState(false);

  const toggle = (module, perm) => {
    setPerms(p => ({
      ...p,
      [activeRole]: {
        ...p[activeRole],
        [module]: { ...p[activeRole][module], [perm]: !p[activeRole][module][perm] }
      }
    }));
  };

  const color = ROLE_COLORS[activeRole];

  return (
    <Layout>
      <div style={{ maxWidth: 900 }}>

        {/* Page heading */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--role-color, #4f46e5)', margin: 0 }}>Roles & Permissions</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Manage what each role can access and modify</p>
        </div>

        {/* Role selector tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {Object.keys(ROLE_COLORS).map(role => (
            <button key={role} onClick={() => setActiveRole(role)} style={{
              padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: activeRole === role ? ROLE_COLORS[role] : 'var(--bg-surface)',
              color: activeRole === role ? '#fff' : 'var(--text-secondary)',
              border: '1px solid ' + (activeRole === role ? ROLE_COLORS[role] : 'var(--border)'),
              textTransform: 'capitalize', transition: 'all 0.15s',
              boxShadow: activeRole === role ? '0 4px 14px ' + ROLE_COLORS[role] + '40' : 'none',
            }}>{ROLE_ICONS[role]} {role.charAt(0).toUpperCase() + role.slice(1)}</button>
          ))}
        </div>

        {/* Title card — separate from the table */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 22px', borderRadius: 14,
          background: 'linear-gradient(120deg,' + color + '14 0%,' + color + '05 100%)',
          border: '1.5px solid ' + color + '30',
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, fontSize: 20,
              background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px ' + color + '40',
            }}>{ROLE_ICONS[activeRole]}</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color }}>
                {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Toggle CRUD permissions per module</div>
            </div>
          </div>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2200); }}
            style={{
              padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', border: 'none',
              background: saved ? '#43E8AC' : color, color: '#fff',
              transition: 'all 0.2s', boxShadow: '0 4px 12px ' + color + '35',
            }}
          >
            {saved ? '✓ Saved!' : 'Save Permissions'}
          </button>
        </div>

        {/* Table card — separate below */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)` }}>
                  <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1.1, borderBottom: 'none', borderRadius: '10px 0 0 10px' }}>Module</th>
                  {['Create', 'Read', 'Update', 'Delete'].map((p, i) => (
                    <th key={p} style={{ padding: '13px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1.1, width: 90, borderBottom: 'none', borderRadius: i === 3 ? '0 10px 10px 0' : 0 }}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(perms[activeRole]).map(([module, ps]) => (
                  <tr key={module}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = color + '07'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{module}</td>
                    {['create', 'read', 'update', 'delete'].map(perm => (
                      <td key={perm} style={{ padding: '13px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => toggle(module, perm)}
                          style={{
                            width: 34, height: 34, borderRadius: 9, cursor: 'pointer',
                            background: ps[perm] ? color + '18' : 'var(--bg-elevated)',
                            border: '1.5px solid ' + (ps[perm] ? color + '55' : 'var(--border)'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto', transition: 'all 0.15s',
                            boxShadow: ps[perm] ? '0 2px 8px ' + color + '22' : 'none',
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.18)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <span style={{ fontSize: 14, fontWeight: 800, color: ps[perm] ? '#43E8AC' : '#FF6584' }}>
                            {ps[perm] ? '✓' : '✕'}
                          </span>
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </Layout>
  );
}
