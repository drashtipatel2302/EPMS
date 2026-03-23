import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, SectionHeader, Button } from '../../components/UI';
import { fetchEmployees } from '../../services/api';

const STATUS_META = {
  pending:     { color:'#FFB547', bg:'rgba(255,181,71,0.12)',   label:'Pending',     icon:'⏳' },
  in_review:   { color:'#6C63FF', bg:'rgba(108,99,255,0.12)',  label:'In Review',   icon:'📋' },
  approved:    { color:'#43E8AC', bg:'rgba(67,232,172,0.12)',  label:'Approved',    icon:'✅' },
  rejected:    { color:'#FF6584', bg:'rgba(255,101,132,0.12)', label:'Rejected',    icon:'❌' },
};

const CRITERIA_DEFAULT = [
  { id:1, name:'Goal Achievement', weight:40 },
  { id:2, name:'Work Quality',     weight:25 },
  { id:3, name:'Collaboration',    weight:20 },
  { id:4, name:'Learning & Growth',weight:15 },
];

const EMPTY_APPRAISER = { employeeId:'', type:'Annual', period:'Q1 2025', raise:'', bonus:'', notes:'' };

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:0.8,marginBottom:5 }}>{label}{required&&<span style={{color:'#FF6584'}}> *</span>}</label>
      {children}
    </div>
  );
}

export default function Appraisals() {
  const [tab,       setTab]       = useState('pending');
  const [appraisals,setAppraisals]= useState([
    { id:1, employee:'Sam Rivera',   dept:'Engineering', type:'Annual',   period:'Q4 2024', status:'in_review', raise:'',    bonus:'',    notes:'Strong technical output throughout the year.',  submitted:'2025-01-10' },
    { id:2, employee:'Morgan Lee',   dept:'Design',      type:'Annual',   period:'Q4 2024', status:'pending',   raise:'',    bonus:'',    notes:'',                                              submitted:'2025-01-12' },
    { id:3, employee:'Jordan Blake', dept:'Marketing',   type:'Annual',   period:'Q4 2024', status:'approved',  raise:'12%', bonus:'5%',  notes:'Exceptional marketing campaign results.',       submitted:'2024-12-20' },
    { id:4, employee:'Priya Shah',   dept:'HR',          type:'Mid-Year', period:'H2 2024', status:'approved',  raise:'8%',  bonus:'3%',  notes:'Excellent employee relations and compliance.',   submitted:'2024-12-15' },
    { id:5, employee:'Arjun Mehta',  dept:'Finance',     type:'Annual',   period:'Q4 2024', status:'rejected',  raise:'',    bonus:'',    notes:'Targets not met. Re-submit after Q1 review.',   submitted:'2025-01-05' },
  ]);
  const [criteria,  setCriteria]  = useState(CRITERIA_DEFAULT);
  const [employees, setEmployees] = useState([]);
  const [showNew,   setShowNew]   = useState(false);
  const [viewItem,  setViewItem]  = useState(null);
  const [newForm,   setNewForm]   = useState(EMPTY_APPRAISER);
  const INP = { width:'100%',padding:'9px 12px',boxSizing:'border-box',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text-primary)',fontSize:13,outline:'none' };

  useEffect(() => {
    fetchEmployees({limit:200}).then(r=>setEmployees(r.employees||[])).catch(()=>{});
  }, []);

  const counts = {
    pending:  appraisals.filter(a=>a.status==='pending').length,
    in_review:appraisals.filter(a=>a.status==='in_review').length,
    approved: appraisals.filter(a=>a.status==='approved').length,
    rejected: appraisals.filter(a=>a.status==='rejected').length,
  };

  const changeStatus = (id, status, extra={}) => {
    setAppraisals(prev=>prev.map(a=>a.id===id?{...a,status,...extra}:a));
  };

  const addAppraisal = () => {
    if (!newForm.employeeId) { alert('Select an employee.'); return; }
    const emp = employees.find(e=>e._id===newForm.employeeId);
    setAppraisals(prev=>[...prev, {
      id: Date.now(),
      employee: emp?.name||'Unknown',
      dept: emp?.department||'—',
      type: newForm.type,
      period: newForm.period,
      status: 'pending',
      raise: newForm.raise,
      bonus: newForm.bonus,
      notes: newForm.notes,
      submitted: new Date().toISOString().slice(0,10),
    }]);
    setShowNew(false);
    setNewForm(EMPTY_APPRAISER);
  };

  const filtered = tab==='all' ? appraisals : appraisals.filter(a=>a.status===tab);

  const Tab = ({label,k,count}) => (
    <button onClick={()=>setTab(k)} style={{ padding:'8px 18px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',background:tab===k?'#6C63FF':'var(--bg-elevated)',color:tab===k?'#fff':'var(--text-secondary)',border:tab===k?'none':'1px solid var(--border)',transition:'all .15s' }}>
      {label} {count!==undefined&&<span style={{ marginLeft:4,padding:'1px 7px',borderRadius:20,background:tab===k?'rgba(255,255,255,0.2)':'var(--bg-surface)',fontSize:11 }}>{count}</span>}
    </button>
  );

  return (
    <Layout>
      {/* New appraisal modal */}
      {showNew && (
        <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center' }} onClick={()=>setShowNew(false)}>
          <div style={{ background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:16,padding:28,width:520,boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:22 }}>
              <h3 style={{ margin:0,fontSize:17,fontWeight:800,color:'var(--text-primary)' }}>Create Appraisal</h3>
              <button onClick={()=>setShowNew(false)} style={{ background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,width:30,height:30,cursor:'pointer',color:'var(--text-secondary)',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px' }}>
              <div style={{ gridColumn:'1/-1' }}>
                <Field label="Employee" required>
                  <select style={INP} value={newForm.employeeId} onChange={e=>setNewForm(f=>({...f,employeeId:e.target.value}))}>
                    <option value="">Select employee…</option>
                    {employees.filter(e=>e.role==='EMPLOYEE'||e.role==='MANAGER').map(e=>(
                      <option key={e._id} value={e._id}>{e.name} — {e.department}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Appraisal Type">
                <select style={INP} value={newForm.type} onChange={e=>setNewForm(f=>({...f,type:e.target.value}))}>
                  {['Annual','Mid-Year','Probation','Promotion'].map(t=><option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Period">
                <input style={INP} value={newForm.period} onChange={e=>setNewForm(f=>({...f,period:e.target.value}))} placeholder="e.g. Q1 2025"/>
              </Field>
              <Field label="Recommended Raise (%)">
                <input style={INP} value={newForm.raise} onChange={e=>setNewForm(f=>({...f,raise:e.target.value}))} placeholder="e.g. 10%"/>
              </Field>
              <Field label="Bonus (%)">
                <input style={INP} value={newForm.bonus} onChange={e=>setNewForm(f=>({...f,bonus:e.target.value}))} placeholder="e.g. 5%"/>
              </Field>
              <div style={{ gridColumn:'1/-1' }}>
                <Field label="Notes">
                  <textarea style={{ ...INP,minHeight:80,resize:'vertical' }} value={newForm.notes} onChange={e=>setNewForm(f=>({...f,notes:e.target.value}))} placeholder="Appraisal summary…"/>
                </Field>
              </div>
            </div>
            <div style={{ display:'flex',gap:10,justifyContent:'flex-end',marginTop:18 }}>
              <Button variant="secondary" size="sm" onClick={()=>setShowNew(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={addAppraisal}>Create Appraisal</Button>
            </div>
          </div>
        </div>
      )}

      {/* View/approve modal */}
      {viewItem && (
        <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center' }} onClick={()=>setViewItem(null)}>
          <div style={{ background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:16,padding:28,width:500,boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:20 }}>
              <div>
                <h3 style={{ margin:0,fontSize:17,fontWeight:800,color:'var(--text-primary)' }}>Review Appraisal</h3>
                <div style={{ fontSize:12,color:'var(--text-secondary)',marginTop:3 }}>{viewItem.type} · {viewItem.period}</div>
              </div>
              <button onClick={()=>setViewItem(null)} style={{ background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,width:30,height:30,cursor:'pointer',color:'var(--text-secondary)',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
            </div>
            {[
              { label:'Employee', val:viewItem.employee },
              { label:'Department', val:viewItem.dept },
              { label:'Submitted', val:viewItem.submitted },
              { label:'Raise Recommended', val:viewItem.raise||'Not specified' },
              { label:'Bonus', val:viewItem.bonus||'Not specified' },
            ].map(f=>(
              <div key={f.label} style={{ display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:12,color:'var(--text-muted)' }}>{f.label}</span>
                <span style={{ fontSize:13,fontWeight:600,color:'var(--text-primary)' }}>{f.val}</span>
              </div>
            ))}
            {viewItem.notes && (
              <div style={{ marginTop:14,padding:12,background:'var(--bg-elevated)',borderRadius:8,fontSize:13,color:'var(--text-secondary)',lineHeight:1.6 }}>{viewItem.notes}</div>
            )}
            {(viewItem.status==='pending'||viewItem.status==='in_review') && (
              <div style={{ display:'flex',gap:10,marginTop:20 }}>
                <button onClick={()=>{ changeStatus(viewItem.id,'rejected'); setViewItem(null); }} style={{ flex:1,padding:'10px',borderRadius:9,border:'1px solid rgba(255,101,132,0.4)',background:'rgba(255,101,132,0.1)',color:'#FF6584',fontWeight:700,cursor:'pointer' }}>❌ Reject</button>
                <button onClick={()=>{ changeStatus(viewItem.id,'approved'); setViewItem(null); }} style={{ flex:1,padding:'10px',borderRadius:9,border:'none',background:'linear-gradient(90deg,#43E8AC,#38BDF8)',color:'#fff',fontWeight:700,cursor:'pointer' }}>✅ Approve</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth:1100 }}>
        {/* Header */}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
          <div>
            <div style={{ fontSize:24,fontWeight:800,color:'var(--role-color, #4f46e5)',marginBottom:4 }}>Appraisal Management</div>
            <div style={{ fontSize:13,color:'var(--text-secondary)' }}>Review, approve, and manage employee appraisal structures</div>
          </div>
          <Button variant="primary" onClick={()=>setShowNew(true)}>+ Create Appraisal</Button>
        </div>

        {/* Summary Tiles */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20 }}>
          {Object.entries(counts).map(([key,val])=>{
            const m = STATUS_META[key];
            return (
              <div key={key} onClick={()=>setTab(key)} style={{ background:'var(--bg-surface)',border:tab===key?`2px solid ${m.color}`:'1px solid var(--border)',borderRadius:12,padding:'14px 16px',borderLeft:`4px solid ${m.color}`,cursor:'pointer',transition:'all .2s' }}>
                <div style={{ fontSize:22,fontWeight:800,color:m.color }}>{val}</div>
                <div style={{ fontSize:12,color:m.color,fontWeight:700,marginTop:2 }}>{m.icon} {m.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex',gap:8,marginBottom:18 }}>
          <Tab label="All" k="all" count={appraisals.length}/>
          <Tab label="⏳ Pending"   k="pending"   count={counts.pending}/>
          <Tab label="📋 In Review" k="in_review" count={counts.in_review}/>
          <Tab label="✅ Approved"  k="approved"  count={counts.approved}/>
          <Tab label="❌ Rejected"  k="rejected"  count={counts.rejected}/>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:18 }}>
          {/* Appraisal Table */}
          <Card>
            <SectionHeader title="Appraisal Records" subtitle={`${filtered.length} records`}/>
            {filtered.length===0 ? (
              <div style={{ textAlign:'center',padding:'40px 0',color:'var(--text-muted)' }}><div style={{fontSize:28,marginBottom:8}}>⭐</div>No appraisals in this category.</div>
            ) : filtered.map(a=>{
              const m = STATUS_META[a.status];
              const ini = a.employee.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
              return (
                <div key={a.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:'rgba(108,99,255,0.15)',border:'1px solid rgba(108,99,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#6C63FF',flexShrink:0 }}>{ini}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{a.employee}</div>
                    <div style={{ fontSize:11,color:'var(--text-muted)' }}>{a.dept} · {a.type} · {a.period}</div>
                  </div>
                  <div style={{ textAlign:'right',flexShrink:0 }}>
                    <span style={{ display:'block',padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:700,background:m.bg,color:m.color,marginBottom:4 }}>{m.icon} {m.label}</span>
                    {a.raise && <span style={{ fontSize:10,color:'#43E8AC',fontWeight:600 }}>+{a.raise} raise</span>}
                  </div>
                  {(a.status==='pending'||a.status==='in_review') && (
                    <button onClick={()=>setViewItem(a)} style={{ padding:'5px 12px',borderRadius:7,border:'1px solid rgba(108,99,255,0.4)',background:'rgba(108,99,255,0.1)',color:'#9c8fff',fontSize:11,cursor:'pointer',fontWeight:600,flexShrink:0 }}>Review</button>
                  )}
                </div>
              );
            })}
          </Card>

          {/* Appraisal Criteria */}
          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <Card>
              <SectionHeader title="Appraisal Criteria" subtitle="Evaluation weightage (must = 100%)"/>
              {criteria.map((c,i)=>(
                <div key={c.id} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
                    <input value={c.name} onChange={e=>{ const nc=[...criteria]; nc[i]={...c,name:e.target.value}; setCriteria(nc); }} style={{ background:'transparent',border:'none',color:'var(--text-primary)',fontSize:13,fontWeight:600,outline:'none',flex:1 }}/>
                    <div style={{ display:'flex',alignItems:'center',gap:4 }}>
                      <input type="number" min={0} max={100} value={c.weight} onChange={e=>{ const nc=[...criteria]; nc[i]={...c,weight:Number(e.target.value)}; setCriteria(nc); }} style={{ width:48,padding:'3px 6px',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text-primary)',fontSize:12,outline:'none',textAlign:'center' }}/>
                      <span style={{ fontSize:12,color:'var(--text-muted)' }}>%</span>
                    </div>
                  </div>
                  <div style={{ height:6,background:'var(--bg-elevated)',borderRadius:6,overflow:'hidden' }}>
                    <div style={{ height:'100%',width:`${c.weight}%`,background:'linear-gradient(90deg,#6C63FF,#8B85FF)',borderRadius:6,transition:'width .3s' }}/>
                  </div>
                </div>
              ))}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6 }}>
                <span style={{ fontSize:12,fontWeight:700,color:criteria.reduce((s,c)=>s+c.weight,0)===100?'#43E8AC':'#FF6584' }}>
                  Total: {criteria.reduce((s,c)=>s+c.weight,0)}%
                </span>
                <Button variant="primary" size="sm">✓ Save Criteria</Button>
              </div>
            </Card>

            <Card>
              <SectionHeader title="Rating Scale" subtitle="5-point evaluation scale"/>
              {['Needs Improvement','Below Expectations','Meets Expectations','Exceeds Expectations','Outstanding'].map((label,i)=>(
                <div key={i} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                  <div style={{ width:28,height:28,borderRadius:7,background:'rgba(255,181,71,0.15)',border:'1px solid rgba(255,181,71,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,color:'#FFB547',flexShrink:0 }}>{i+1}</div>
                  <div style={{ fontSize:13,color:'var(--text-secondary)',fontWeight:500 }}>{label}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
