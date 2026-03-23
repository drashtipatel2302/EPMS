import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

const apiFetch = async (path, method = 'GET', body = null) => {
  const token = localStorage.getItem('epms_token');
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const ROLE_COLORS = { admin:'#4f46e5', manager:'#0ea5e9', employee:'#10b981', hr:'#f43f5e' };
const ROLE_TO_KEY = {
  'SUPER_ADMIN':'admin','ADMIN':'admin','admin':'admin',
  'MANAGER':'manager','manager':'manager',
  'EMPLOYEE':'employee','employee':'employee',
  'HR':'hr','hr':'hr',
};
const ROLE_LABELS = { admin:'Super Admin', manager:'Manager', employee:'Employee', hr:'HR Specialist' };

function InfoField({ label, value, editing, onChange, placeholder='' }) {
  const baseInput = { width:'100%', padding:'10px 13px', background:'var(--bg-elevated)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:13, outline:'none', transition:'all 0.15s', boxSizing:'border-box' };
  return (
    <div>
      <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>{label}</label>
      {editing
        ? <input value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={baseInput}
            onFocus={e=>{e.target.style.borderColor='#4f46e5';e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.1)';}}
            onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}}
          />
        : <div style={{ padding:'10px 13px', background:'var(--bg-elevated)', borderRadius:8, fontSize:13, color:value?'var(--text-primary)':'var(--text-muted)', border:'1px solid var(--border)' }}>
            {value||'—'}
          </div>
      }
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile,    setProfile]    = useState(null);
  const [form,       setForm]       = useState({});
  const [editing,    setEditing]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [promoNotif, setPromoNotif] = useState(null); // recent approved promotion for this user

  const roleKey   = ROLE_TO_KEY[user?.role] || 'employee';
  const roleColor = ROLE_COLORS[roleKey] || '#4f46e5';
  const roleLabel = ROLE_LABELS[roleKey] || user?.role;

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  useEffect(() => {
    // Load profile from API (always fresh — may have been updated by promotion approval)
    apiFetch('/api/employee/profile')
      .then(u => {
        setProfile(u);
        setForm({ name:u.name||'', phone:u.phone||'', address:u.address||'', emergencyContact:u.emergencyContact||'', bio:u.bio||'' });
        // Sync auth context so Navbar/greeting shows updated designation immediately
        updateUser({ name:u.name, designation:u.designation, department:u.department });
      })
      .catch(e => showToast(e.message,'error'))
      .finally(() => setLoading(false));

    // Check if there's a recent approved promotion notification for this user
    const token = localStorage.getItem('epms_token');
    if (token) {
      fetch('/api/notifications?limit=10', { headers:{ Authorization:`Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          const recent = (data.notifications||[]).find(n =>
            n.type === 'PROMOTION_APPROVED' &&
            !n.isRead &&
            (Date.now() - new Date(n.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 // within 7 days
          );
          if (recent) setPromoNotif(recent);
        })
        .catch(()=>{});
    }
  }, []);

  const dismissPromoNotif = async () => {
    if (!promoNotif) return;
    const token = localStorage.getItem('epms_token');
    try {
      await fetch(`/api/notifications/${promoNotif._id}/read`, { method:'PUT', headers:{ Authorization:`Bearer ${token}` } });
    } catch {}
    setPromoNotif(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/employee/profile','PUT',form);
      const updated = res.user || res;
      setProfile(updated);
      setEditing(false);
      // Sync auth context with new name (designation is read-only for employee self-edit)
      updateUser({ name: updated.name });
      showToast('Profile updated successfully!');
    } catch(e) { showToast(e.message,'error'); }
    setSaving(false);
  };

  if (loading) return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, color:'var(--text-muted)', fontSize:14 }}>
        Loading profile…
      </div>
    </Layout>
  );

  const u = profile;
  const initials = u?.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'U';

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:24, zIndex:9999, padding:'11px 18px', borderRadius:10, fontSize:13, fontWeight:600, background:toast.type==='error'?'#fff1f2':'#f0fdf4', color:toast.type==='error'?'#f43f5e':'#16a34a', border:`1px solid ${toast.type==='error'?'#fecdd3':'#bbf7d0'}`, boxShadow:'0 4px 20px rgba(0,0,0,0.1)', animation:'fadeUp 0.25s ease both' }}>
          {toast.type==='error'?'⚠️':'✅'} {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:720, margin:'0 auto' }}>

        {/* 🎉 Promotion banner — shown when there's an unread promotion approval */}
        {promoNotif && (
          <div style={{
            background:'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border:'1.5px solid #86efac',
            borderRadius:16, padding:'18px 22px', marginBottom:20,
            display:'flex', alignItems:'flex-start', gap:16,
            boxShadow:'0 4px 20px rgba(16,185,129,0.12)',
            position:'relative', overflow:'hidden',
          }}>
            {/* decorative shimmer */}
            <div style={{ position:'absolute', top:-30, right:-30, width:100, height:100, borderRadius:'50%', background:'rgba(16,185,129,0.12)', pointerEvents:'none' }}/>
            <div style={{ fontSize:36, flexShrink:0 }}>🎉</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:15, color:'#065f46', marginBottom:4 }}>{promoNotif.title}</div>
              <div style={{ fontSize:13, color:'#047857', lineHeight:1.6 }}>{promoNotif.message}</div>
              <div style={{ fontSize:11, color:'#6ee7b7', marginTop:6, fontWeight:600 }}>
                Your profile has been updated automatically ✓
              </div>
            </div>
            <button onClick={dismissPromoNotif} style={{ background:'transparent', border:'none', color:'#6ee7b7', fontSize:18, cursor:'pointer', flexShrink:0, padding:4, lineHeight:1 }}>✕</button>
          </div>
        )}

        {/* Hero card */}
        <div style={{ background:`linear-gradient(135deg,${roleColor}18,${roleColor}08)`, border:`1px solid ${roleColor}22`, borderRadius:18, padding:'28px 32px', marginBottom:24, display:'flex', alignItems:'center', gap:24, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:`${roleColor}10`, pointerEvents:'none' }}/>
          <div style={{ width:72, height:72, borderRadius:18, flexShrink:0, background:`linear-gradient(135deg,${roleColor},${roleColor}bb)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, color:'#fff', boxShadow:`0 6px 20px ${roleColor}40` }}>{initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <h2 style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:22, color:'var(--text-primary)', marginBottom:4 }}>{u?.name}</h2>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <span style={{ fontSize:12, fontWeight:600, color:roleColor, background:`${roleColor}15`, padding:'3px 10px', borderRadius:20 }}>{roleLabel}</span>
              {u?.department  && <span style={{ fontSize:12, color:'var(--text-muted)' }}>• {u.department}</span>}
              {u?.designation && (
                <span style={{
                  fontSize:12, fontWeight:600,
                  color: promoNotif ? '#10b981' : 'var(--text-muted)',
                  background: promoNotif ? '#f0fdf4' : 'transparent',
                  border: promoNotif ? '1px solid #bbf7d0' : 'none',
                  padding: promoNotif ? '2px 8px' : '0',
                  borderRadius: 20,
                }}>
                  {promoNotif ? '🆕 ' : '• '}{u.designation}
                </span>
              )}
            </div>
            {u?.email && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6, display:'flex', alignItems:'center', gap:5 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{u.email}</div>}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
            {!editing
              ? <button onClick={()=>setEditing(true)} style={{ padding:'9px 18px', borderRadius:9, border:'none', background:roleColor, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:`0 3px 10px ${roleColor}40`, display:'flex', alignItems:'center', gap:6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Profile
                </button>
              : <>
                  <button onClick={save} disabled={saving} style={{ padding:'9px 18px', borderRadius:9, border:'none', background:saving?'#c7d2fe':roleColor, color:'#fff', fontSize:12, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>{saving?'Saving…':'✓ Save'}</button>
                  <button onClick={()=>setEditing(false)} style={{ padding:'9px 18px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-surface)', color:'var(--text-secondary)', fontSize:12, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                </>
            }
            <button onClick={()=>navigate('/change-password')} style={{ padding:'9px 18px', borderRadius:9, border:`1px solid ${roleColor}30`, background:`${roleColor}0d`, color:roleColor, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Change Password
            </button>
          </div>
        </div>

        {/* Personal Info Grid */}
        <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:14, padding:22, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:1.2, marginBottom:18, display:'flex', alignItems:'center', gap:7 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Personal Information
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <InfoField label="Full Name"   value={editing?form.name:u?.name} editing={editing} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Your full name" />
            <InfoField label="Email"       value={u?.email} editing={false} />
            <InfoField label="Phone"       value={editing?form.phone:u?.phone} editing={editing} onChange={v=>setForm(f=>({...f,phone:v}))} placeholder="+91 00000 00000" />
            <InfoField label="Employee ID" value={u?.employeeId} editing={false} />
            <InfoField label="Department"  value={u?.department} editing={false} />
            {/* Designation: read-only, highlighted green if recently promoted */}
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>Designation</label>
              <div style={{
                padding:'10px 13px', borderRadius:8, fontSize:13, border:'1px solid var(--border)',
                background: promoNotif ? '#f0fdf4' : 'var(--bg-elevated)',
                color: promoNotif ? '#047857' : 'var(--text-primary)',
                fontWeight: promoNotif ? 700 : 400,
                display:'flex', alignItems:'center', gap:6,
              }}>
                {u?.designation || '—'}
                {promoNotif && <span style={{ fontSize:10, background:'#bbf7d0', color:'#065f46', borderRadius:20, padding:'1px 7px', fontWeight:700 }}>UPDATED</span>}
              </div>
            </div>
            {u?.joiningDate && <InfoField label="Joining Date" value={new Date(u.joiningDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})} editing={false} />}
            <InfoField label="Status" value={u?.isActive?'Active':'Inactive'} editing={false} />
          </div>
        </div>

        {/* Address & Bio */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:14, padding:22 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:1.2, marginBottom:18 }}>Address & Emergency</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <InfoField label="Address" value={editing?form.address:u?.address} editing={editing} onChange={v=>setForm(f=>({...f,address:v}))} placeholder="Your address" />
              <InfoField label="Emergency Contact" value={editing?form.emergencyContact:u?.emergencyContact} editing={editing} onChange={v=>setForm(f=>({...f,emergencyContact:v}))} placeholder="+91 00000 00000" />
            </div>
          </div>
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:14, padding:22 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:1.2, marginBottom:18 }}>About Me</div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>Bio</label>
            {editing
              ? <textarea value={form.bio||''} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} placeholder="Write a short bio…" rows={5} style={{ width:'100%', padding:'10px 13px', background:'var(--bg-elevated)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }} onFocus={e=>{e.target.style.borderColor='#4f46e5';}} onBlur={e=>{e.target.style.borderColor='var(--border)';}}/>
              : <div style={{ padding:'10px 13px', background:'var(--bg-elevated)', borderRadius:8, fontSize:13, color:u?.bio?'var(--text-primary)':'var(--text-muted)', border:'1px solid var(--border)', minHeight:80, lineHeight:1.6 }}>{u?.bio||'No bio added yet.'}</div>
            }
          </div>
        </div>

      </div>
    </Layout>
  );
}
