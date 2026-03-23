import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Card, Button } from '../../components/UI';
import Loader from '../../components/Loader';
import { fetchEmployees, addEmployee, updateEmployee, fetchDepartments, getAuthHeaders } from '../../services/api';

const ROLE_COLORS = { SUPER_ADMIN:'#6C63FF', HR:'#FF6584', MANAGER:'#38BDF8', EMPLOYEE:'#43E8AC' };
const ROLE_ICONS  = { SUPER_ADMIN:'🛡️', HR:'🧑‍💼', MANAGER:'👔', EMPLOYEE:'👤' };
const ROLES       = ['SUPER_ADMIN','HR','MANAGER','EMPLOYEE'];
const roleLabel   = r => (r||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());

const INP = { width:'100%', padding:'9px 12px', boxSizing:'border-box', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:13, outline:'none' };
const focus = e => e.target.style.borderColor='#6C63FF';
const blur  = e => e.target.style.borderColor='var(--border)';

const deleteEmployee = async id => {
  const res = await fetch(`/api/auth/employees/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : { message: await res.text() };
  if (!res.ok) throw new Error(data.message || 'Failed to delete employee');
};

/* ── shared Field ─────────────────────────────── */
function Field({ label, required, span, children }) {
  return (
    <div style={{ marginBottom:14, gridColumn:span?'1/-1':undefined }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>
        {label}{required&&<span style={{color:'#FF6584'}}> *</span>}
      </label>
      {children}
    </div>
  );
}

/* ── Modal Shell ──────────────────────────────── */
function Modal({ title, subtitle, onClose, onSubmit, loading, children }) {
  return (
    <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:16,padding:28,width:550,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22 }}>
          <div>
            <h3 style={{ margin:0,fontSize:17,fontWeight:800,color:'var(--text-primary)' }}>{title}</h3>
            {subtitle && <div style={{ fontSize:12,color:'var(--text-secondary)',marginTop:3 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,width:30,height:30,cursor:'pointer',color:'var(--text-secondary)',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
        </div>
        {children}
        <div style={{ display:'flex',gap:10,justifyContent:'flex-end',marginTop:22 }}>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={onSubmit} disabled={loading}>{loading?'Saving…':'Save'}</Button>
        </div>
      </div>
    </div>
  );
}

function Err({ msg }) {
  if (!msg) return null;
  return <div style={{ background:'rgba(255,101,132,0.1)',border:'1px solid rgba(255,101,132,0.3)',borderRadius:8,padding:'10px 14px',color:'#FF6584',fontSize:13,marginBottom:14 }}>{msg}</div>;
}

/* ── Add Modal ────────────────────────────────── */
function AddModal({ onClose, onSuccess, departments, defaultRole='EMPLOYEE' }) {
  const [form,setForm] = useState({ name:'',email:'',password:'',employeeId:'',department:'',designation:'',role:defaultRole,joiningDate:'' });
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if (!form.name||!form.email||!form.password) { setError('Name, email and password are required.'); return; }
    if (form.password.length<6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try { await addEmployee(form); onSuccess(); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={`Add New ${roleLabel(form.role)}`} subtitle="Fields marked * are required" onClose={onClose} onSubmit={submit} loading={loading}>
      <Err msg={error} />
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px' }}>
        <Field label="Full Name" required><input style={INP} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Jane Doe" onFocus={focus} onBlur={blur}/></Field>
        <Field label="Employee ID"><input style={INP} value={form.employeeId} onChange={e=>set('employeeId',e.target.value)} placeholder="EMP-001" onFocus={focus} onBlur={blur}/></Field>
        <Field label="Email" required><input style={INP} type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="jane@company.com" onFocus={focus} onBlur={blur}/></Field>
        <Field label="Password" required><input style={INP} type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Min 6 characters" onFocus={focus} onBlur={blur}/></Field>
        <Field label="Department">
          <select style={INP} value={form.department} onChange={e=>set('department',e.target.value)}>
            <option value="">Select department…</option>
            {departments.map(d=><option key={d._id||d.name} value={d.name}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Designation"><input style={INP} value={form.designation} onChange={e=>set('designation',e.target.value)} placeholder="e.g. Software Engineer" onFocus={focus} onBlur={blur}/></Field>
        <Field label="Role">
          <select style={INP} value={form.role} onChange={e=>set('role',e.target.value)}>
            {ROLES.map(r=><option key={r} value={r}>{ROLE_ICONS[r]} {roleLabel(r)}</option>)}
          </select>
        </Field>
        <Field label="Joining Date"><input style={INP} type="date" value={form.joiningDate} onChange={e=>set('joiningDate',e.target.value)}/></Field>
      </div>
    </Modal>
  );
}

/* ── Edit Modal ───────────────────────────────── */
function EditModal({ employee, onClose, onSuccess, departments }) {
  const [form,setForm] = useState({ name:employee.name||'', department:employee.department||'', designation:employee.designation||'', role:employee.role||'EMPLOYEE', isActive:employee.isActive!==false });
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if (!form.name) { setError('Name is required.'); return; }
    setError(''); setLoading(true);
    try { await updateEmployee(employee._id,form); onSuccess(); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={`Edit — ${employee.name}`} subtitle={`${ROLE_ICONS[employee.role]} ${roleLabel(employee.role)}`} onClose={onClose} onSubmit={submit} loading={loading}>
      <Err msg={error} />
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px' }}>
        <Field label="Full Name" required span>
          <input style={INP} value={form.name} onChange={e=>set('name',e.target.value)} onFocus={focus} onBlur={blur}/>
        </Field>
        <Field label="Department">
          <select style={INP} value={form.department} onChange={e=>set('department',e.target.value)}>
            <option value="">Select department…</option>
            {departments.map(d=><option key={d._id||d.name} value={d.name}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Designation"><input style={INP} value={form.designation} onChange={e=>set('designation',e.target.value)} onFocus={focus} onBlur={blur}/></Field>
        <Field label="Role">
          <select style={INP} value={form.role} onChange={e=>set('role',e.target.value)}>
            {ROLES.map(r=><option key={r} value={r}>{ROLE_ICONS[r]} {roleLabel(r)}</option>)}
          </select>
        </Field>
        <Field label="Account Status">
          <select style={INP} value={form.isActive?'active':'inactive'} onChange={e=>set('isActive',e.target.value==='active')}>
            <option value="active">✅ Active</option>
            <option value="inactive">❌ Inactive</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}

/* ── Confirm Delete ───────────────────────────── */
function ConfirmDelete({ employee, onClose, onSuccess }) {
  const [loading,setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await deleteEmployee(employee._id); onSuccess(); }
    catch(e) { alert(e.message); setLoading(false); }
  };
  return (
    <div style={{ position:'fixed',inset:0,zIndex:1001,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'var(--bg-surface)',borderRadius:16,padding:32,width:400,border:'1px solid rgba(255,101,132,0.3)',boxShadow:'0 20px 60px rgba(0,0,0,0.5)',textAlign:'center' }}>
        <div style={{ fontSize:42,marginBottom:12 }}>🗑️</div>
        <div style={{ fontSize:17,fontWeight:800,color:'var(--text-primary)',marginBottom:8 }}>Delete Account</div>
        <div style={{ fontSize:13,color:'var(--text-secondary)',marginBottom:22 }}>
          Permanently delete <strong style={{color:'var(--text-primary)'}}>{employee.name}</strong>?<br/>
          This action cannot be undone.
        </div>
        <div style={{ display:'flex',gap:10,justifyContent:'center' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <button onClick={handle} disabled={loading} style={{ padding:'8px 22px',borderRadius:8,border:'none',background:'#FF6584',color:'#fff',fontWeight:700,cursor:loading?'not-allowed':'pointer' }}>
            {loading?'Deleting…':'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────── */
export default function Users() {
  const [employees, setEmployees]   = useState([]);
  const [total,     setTotal]       = useState(0);
  const [totalPg,   setTotalPg]     = useState(1);
  const [page,      setPage]        = useState(1);
  const [search,    setSearch]      = useState('');
  const [debSearch, setDebSearch]   = useState('');
  const [filterRole,setFilterRole]  = useState('all');
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState('');
  const [showAdd,   setShowAdd]     = useState(false);
  const [addRole,   setAddRole]     = useState('EMPLOYEE');
  const [editEmp,   setEditEmp]     = useState(null);
  const [delEmp,    setDelEmp]      = useState(null);
  const [depts,     setDepts]       = useState([]);

  useEffect(() => {
    fetchDepartments()
      .then(d=>setDepts(Array.isArray(d)?d:d.departments||[]))
      .catch(()=>setDepts([{name:'Engineering'},{name:'HR'},{name:'Design'},{name:'Marketing'},{name:'Finance'}]));
  }, []);

  useEffect(() => {
    const t = setTimeout(()=>{ setDebSearch(search); setPage(1); }, 400);
    return ()=>clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetchEmployees({ page, limit:12, search:debSearch });
      setEmployees(res.employees||[]);
      setTotal(res.total||0);
      setTotalPg(res.totalPages||1);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page,debSearch]);

  useEffect(()=>{ load(); },[load]);

  const filtered   = filterRole==='all' ? employees : employees.filter(e=>e.role===filterRole);
  const roleCounts = ROLES.reduce((a,r)=>{ a[r]=employees.filter(e=>e.role===r).length; return a; }, {});

  return (
    <Layout>
      {showAdd   && <AddModal defaultRole={addRole} departments={depts} onClose={()=>setShowAdd(false)} onSuccess={()=>{ setShowAdd(false); load(); }} />}
      {editEmp   && <EditModal employee={editEmp} departments={depts} onClose={()=>setEditEmp(null)} onSuccess={()=>{ setEditEmp(null); load(); }} />}
      {delEmp    && <ConfirmDelete employee={delEmp} onClose={()=>setDelEmp(null)} onSuccess={()=>{ setDelEmp(null); load(); }} />}

      <div style={{ maxWidth:1200 }}>
        {/* Header */}
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:20 }}>
          {[{r:'MANAGER',l:'+ Manager'},{r:'HR',l:'+ HR'},{r:'EMPLOYEE',l:'+ Employee'},{r:'SUPER_ADMIN',l:'+ Admin'}].map(({r,l})=>(
            <button key={r} onClick={()=>{ setAddRole(r); setShowAdd(true); }} style={{ padding:'9px 16px',borderRadius:9,border:`1px solid ${ROLE_COLORS[r]}40`,background:`${ROLE_COLORS[r]}12`,color:ROLE_COLORS[r],fontWeight:700,fontSize:13,cursor:'pointer',transition:'all .15s' }}
              onMouseEnter={e=>e.currentTarget.style.background=`${ROLE_COLORS[r]}25`}
              onMouseLeave={e=>e.currentTarget.style.background=`${ROLE_COLORS[r]}12`}>{l}</button>
          ))}
        </div>

        {/* Role tiles — click to filter */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20 }}>
          {ROLES.map(role=>(
            <div key={role} onClick={()=>setFilterRole(r=>r===role?'all':role)} style={{ background:'var(--bg-surface)', border:filterRole===role?`2px solid ${ROLE_COLORS[role]}`:'1px solid var(--border)', borderRadius:12, padding:'14px 16px', borderLeft:`4px solid ${ROLE_COLORS[role]}`, cursor:'pointer', transition:'all .2s' }}>
              <div style={{ fontSize:24,fontWeight:800,color:ROLE_COLORS[role] }}>{roleCounts[role]??0}</div>
              <div style={{ fontSize:12,color:ROLE_COLORS[role],fontWeight:700,marginTop:2 }}>{ROLE_ICONS[role]} {roleLabel(role)}s</div>
              <div style={{ fontSize:10,color:'var(--text-muted)',marginTop:2 }}>Click to filter</div>
            </div>
          ))}
        </div>

        <Card>
          {/* Toolbar */}
          <div style={{ display:'flex',gap:10,marginBottom:18,alignItems:'center' }}>
            <input placeholder="🔍  Search by name or email…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ flex:1,padding:'9px 14px',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:9,color:'var(--text-primary)',fontSize:13,outline:'none' }}
              onFocus={focus} onBlur={blur}/>
            <select value={filterRole} onChange={e=>setFilterRole(e.target.value)}
              style={{ padding:'9px 14px',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:9,color:'var(--text-secondary)',fontSize:13,outline:'none',cursor:'pointer' }}>
              <option value="all">All Roles</option>
              {ROLES.map(r=><option key={r} value={r}>{ROLE_ICONS[r]} {roleLabel(r)}</option>)}
            </select>
          </div>

          {error && <Err msg={error}/>}

          {loading ? <Loader/> : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #4f46e5 0%, #6d64f0 100%)', borderRadius: 10 }}>
                    {['Staff Member','Email','Emp ID','Department','Designation','Role','Status','Actions'].map((h, i)=>(
                      <th key={h} style={{
                        padding:'13px 14px', textAlign:'left', fontSize:11, fontWeight:700,
                        color:'#fff', textTransform:'uppercase', letterSpacing:1.1, whiteSpace:'nowrap',
                        borderBottom: 'none',
                        borderRadius: i === 0 ? '10px 0 0 10px' : i === 7 ? '0 10px 10px 0' : 0,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0 ? (
                    <tr><td colSpan={8} style={{ padding:'50px 0',textAlign:'center',color:'var(--text-muted)' }}>
                      <div style={{fontSize:28,marginBottom:8}}>👤</div>No staff found.
                    </td></tr>
                  ) : filtered.map(emp=>{
                    const color = ROLE_COLORS[emp.role]||'#aaa';
                    const ini   = emp.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
                    return (
                      <tr key={emp._id} style={{ borderBottom:'1px solid var(--border)',transition:'background .1s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'12px' }}>
                          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                            <div style={{ width:32,height:32,borderRadius:9,background:`${color}20`,border:`1px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color }}>{ini}</div>
                            <div>
                              <div style={{ fontWeight:600,fontSize:13,color:'var(--text-primary)' }}>{emp.name}</div>
                              {emp.joiningDate && <div style={{ fontSize:10,color:'var(--text-muted)' }}>Joined {new Date(emp.joiningDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'12px',fontSize:12,color:'var(--text-secondary)' }}>{emp.email}</td>
                        <td style={{ padding:'12px',fontSize:12,color:'var(--text-muted)',fontFamily:'monospace' }}>{emp.employeeId||'—'}</td>
                        <td style={{ padding:'12px',fontSize:13,color:'var(--text-secondary)' }}>{emp.department||'—'}</td>
                        <td style={{ padding:'12px',fontSize:13,color:'var(--text-secondary)' }}>{emp.designation||'—'}</td>
                        <td style={{ padding:'12px' }}>
                          <span style={{ padding:'3px 10px',borderRadius:20,background:`${color}15`,color,fontSize:11,fontWeight:700 }}>{ROLE_ICONS[emp.role]} {roleLabel(emp.role)}</span>
                        </td>
                        <td style={{ padding:'12px' }}>
                          <span style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:emp.isActive?'rgba(67,232,172,0.12)':'rgba(255,101,132,0.12)',color:emp.isActive?'#43E8AC':'#FF6584' }}>
                            {emp.isActive?'✅ Active':'❌ Inactive'}
                          </span>
                        </td>
                        <td style={{ padding:'12px' }}>
                          <div style={{ display:'flex',gap:6 }}>
                            <button onClick={()=>setEditEmp(emp)} style={{ padding:'5px 12px',borderRadius:7,border:'1px solid rgba(108,99,255,0.4)',background:'rgba(108,99,255,0.1)',color:'#9c8fff',fontSize:11,cursor:'pointer',fontWeight:600 }}>✏️ Edit</button>
                            <button onClick={()=>setDelEmp(emp)} style={{ padding:'5px 12px',borderRadius:7,border:'1px solid rgba(255,101,132,0.4)',background:'rgba(255,101,132,0.1)',color:'#FF6584',fontSize:11,cursor:'pointer',fontWeight:600 }}>🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && totalPg>1 && (
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:16 }}>
              <span style={{ fontSize:12,color:'var(--text-muted)' }}>Page {page} of {totalPg} · {total} total</span>
              <div style={{ display:'flex',gap:6 }}>
                <Button variant="secondary" size="sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>← Prev</Button>
                <Button variant="secondary" size="sm" onClick={()=>setPage(p=>Math.min(totalPg,p+1))} disabled={page===totalPg}>Next →</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}