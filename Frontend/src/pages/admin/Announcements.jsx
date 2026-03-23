import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, Button } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { getAuthHeaders } from '../../services/api';

const apiFetch = async (path, method = 'GET', body = null) => {
  const opts = { method, headers: getAuthHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const CAT_COLORS = { Event:'#6C63FF', Policy:'#FFB547', System:'#43E8AC', HR:'#FF6584', General:'#8B85FF' };
const PRI_COLORS = { high:'#FF6584', medium:'#FFB547', low:'#43E8AC' };
const PRI_BG     = { high:'rgba(255,101,132,0.12)', medium:'rgba(255,181,71,0.12)', low:'rgba(67,232,172,0.12)' };
const INP        = { width:'100%', padding:'9px 12px', boxSizing:'border-box', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:13, outline:'none' };

const EMPTY = { title:'', body:'', category:'Event', priority:'medium' };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:0.8,marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children, onSave, saving }) {
  return (
    <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:16,padding:28,width:540,boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22 }}>
          <h3 style={{ margin:0,fontSize:17,fontWeight:800,color:'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,width:30,height:30,cursor:'pointer',color:'var(--text-secondary)',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
        </div>
        {children}
        <div style={{ display:'flex',gap:10,justifyContent:'flex-end',marginTop:22 }}>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={onSave} disabled={saving}>{saving?'Saving…':'Publish'}</Button>
        </div>
      </div>
    </div>
  );
}

function AnnouncementForm({ form, setForm }) {
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div>
      <Field label="Title *"><input style={INP} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Announcement title…" onFocus={e=>e.target.style.borderColor='#6C63FF'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></Field>
      <Field label="Message *"><textarea style={{ ...INP,minHeight:100,resize:'vertical' }} value={form.body} onChange={e=>set('body',e.target.value)} placeholder="Write your announcement here…" onFocus={e=>e.target.style.borderColor='#6C63FF'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></Field>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
        <Field label="Category">
          <select style={INP} value={form.category} onChange={e=>set('category',e.target.value)}>
            {Object.keys(CAT_COLORS).map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select style={INP} value={form.priority} onChange={e=>set('priority',e.target.value)}>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

export default function Announcements() {
  const { user } = useAuth();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editItem,setEditItem]= useState(null);
  const [delItem, setDelItem] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    apiFetch('/api/announcements').then(d=>{ setItems(Array.isArray(d) ? d : d.announcements || []); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const openNew = () => { setForm(EMPTY); setShowNew(true); };
  const openEdit = a => { setForm({ title:a.title, body:a.body, category:a.category, priority:a.priority }); setEditItem(a); };

  const reload = () => apiFetch('/api/announcements').then(d=>setItems(Array.isArray(d)?d:d.announcements||[])).catch(()=>{});

  const handleSave = async () => {
    if (!form.title.trim()||!form.body.trim()) { alert('Title and message are required.'); return; }
    setSaving(true);
    try {
      const payload = { title:form.title, content:form.body, category:form.category?.toUpperCase()||'GENERAL', priority:form.priority?.toUpperCase()||'MEDIUM' };
      if (editItem) {
        await apiFetch(`/api/announcements/${editItem._id||editItem.id}`, 'PUT', payload);
        setEditItem(null);
      } else {
        await apiFetch('/api/announcements', 'POST', payload);
        setShowNew(false);
      }
      reload();
    } catch(e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    try { await apiFetch(`/api/announcements/${id}`, 'DELETE'); reload(); setDelItem(null); }
    catch(e) { alert(e.message); }
  };

  const filtered = filter==='all' ? items : items.filter(a=>a.priority===filter||a.category===filter);

  return (
    <Layout>
      {(showNew || editItem) && (
        <Modal title={editItem?'Edit Announcement':'New Announcement'} onClose={()=>{ setShowNew(false); setEditItem(null); }} onSave={handleSave} saving={saving}>
          <AnnouncementForm form={form} setForm={setForm}/>
        </Modal>
      )}
      {delItem && (
        <div style={{ position:'fixed',inset:0,zIndex:1001,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ background:'var(--bg-surface)',borderRadius:16,padding:28,width:380,textAlign:'center',border:'1px solid rgba(255,101,132,0.3)' }}>
            <div style={{ fontSize:36,marginBottom:12 }}>🗑️</div>
            <div style={{ fontSize:16,fontWeight:800,color:'var(--text-primary)',marginBottom:8 }}>Delete Announcement?</div>
            <div style={{ fontSize:13,color:'var(--text-secondary)',marginBottom:22 }}>
              "<strong>{delItem.title}</strong>" will be permanently removed.
            </div>
            <div style={{ display:'flex',gap:10,justifyContent:'center' }}>
              <Button variant="secondary" size="sm" onClick={()=>setDelItem(null)}>Cancel</Button>
              <button onClick={()=>handleDelete(delItem._id||delItem.id)} style={{ padding:'8px 20px',borderRadius:8,border:'none',background:'#FF6584',color:'#fff',fontWeight:700,cursor:'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:960 }}>
        {/* Header */}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
          <div>
            <div style={{ fontSize:24,fontWeight:800,color:'var(--role-color, #4f46e5)',marginBottom:4 }}>Announcements</div>
            <div style={{ fontSize:13,color:'var(--text-secondary)' }}>Company-wide notices visible to all roles</div>
          </div>
          <Button variant="primary" onClick={openNew}>+ New Announcement</Button>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20 }}>
          {[
            { label:'Total',  value:items.length,                      color:'#6C63FF' },
            { label:'High Priority', value:items.filter(a=>a.priority==='high').length,   color:'#FF6584' },
            { label:'Medium', value:items.filter(a=>a.priority==='medium').length, color:'#FFB547' },
            { label:'Low',    value:items.filter(a=>a.priority==='low').length,    color:'#43E8AC' },
          ].map(s=>(
            <div key={s.label} style={{ background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px',borderLeft:`3px solid ${s.color}` }}>
              <div style={{ fontSize:22,fontWeight:800,color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12,color:'var(--text-secondary)',marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ display:'flex',gap:8,marginBottom:18,flexWrap:'wrap' }}>
          {['all','high','medium','low','Event','Policy','System','HR'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',background:filter===f?'#6C63FF':'var(--bg-elevated)',color:filter===f?'#fff':'var(--text-secondary)',border:filter===f?'none':'1px solid var(--border)',transition:'all .15s',textTransform:'capitalize' }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center',padding:40,color:'var(--text-muted)' }}>Loading…</div>
        ) : filtered.length===0 ? (
          <Card><div style={{ textAlign:'center',padding:40,color:'var(--text-muted)' }}><div style={{fontSize:32,marginBottom:8}}>📢</div>No announcements found.</div></Card>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {filtered.map(a=>(
              <Card key={a.id} style={{ borderLeft:`4px solid ${PRI_COLORS[a.priority]||'#6C63FF'}` }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
                  <div style={{ display:'flex',gap:8,alignItems:'center',flexWrap:'wrap' }}>
                    <span style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:`${CAT_COLORS[a.category]||'#6C63FF'}18`,color:CAT_COLORS[a.category]||'#6C63FF' }}>{a.category}</span>
                    <span style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:PRI_BG[a.priority],color:PRI_COLORS[a.priority],textTransform:'capitalize' }}>{a.priority} priority</span>
                  </div>
                  <span style={{ fontSize:11,color:'var(--text-muted)',flexShrink:0 }}>{a.date}</span>
                </div>
                <div style={{ fontWeight:700,fontSize:16,color:'var(--text-primary)',marginBottom:8 }}>{a.title}</div>
                <div style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.65,marginBottom:12 }}>{a.body}</div>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:10,borderTop:'1px solid var(--border)' }}>
                  <span style={{ fontSize:11,color:'var(--text-muted)' }}>Posted by <strong style={{color:'var(--text-secondary)'}}>{a.author}</strong></span>
                  <div style={{ display:'flex',gap:8 }}>
                    <button onClick={()=>openEdit(a)} style={{ padding:'5px 14px',borderRadius:7,border:'1px solid rgba(108,99,255,0.4)',background:'rgba(108,99,255,0.1)',color:'#9c8fff',fontSize:12,cursor:'pointer',fontWeight:600 }}>✏️ Edit</button>
                    <button onClick={()=>setDelItem(a)} style={{ padding:'5px 14px',borderRadius:7,border:'1px solid rgba(255,101,132,0.4)',background:'rgba(255,101,132,0.1)',color:'#FF6584',fontSize:12,cursor:'pointer',fontWeight:600 }}>🗑️ Delete</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
