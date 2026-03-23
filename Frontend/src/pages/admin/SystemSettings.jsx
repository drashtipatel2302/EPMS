import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

const STORAGE_KEY = 'performiq_system_settings';
const ACCENT = '#4f46e5';

const DEFAULT_SETTINGS = {
  workingHours: { start: '09:00', end: '18:00', workDays: ['Mon','Tue','Wed','Thu','Fri'], lateThresholdMins: 15 },
  performance:  [
    { id: 1, name: 'Goal Achievement',  weight: 40 },
    { id: 2, name: 'Work Quality',      weight: 25 },
    { id: 3, name: 'Collaboration',     weight: 20 },
    { id: 4, name: 'Learning & Growth', weight: 15 },
  ],
  rating: {
    min: 1, max: 5,
    labels: ['Needs Improvement','Below Expectations','Meets Expectations','Exceeds Expectations','Outstanding'],
  },
  reviewCycle: 'Quarterly',
  security: {
    sessionTimeout: 30, maxLoginAttempts: 5,
    passwordMinLength: 6, tokenExpiry: 24,
    force2FA: true, ipWhitelist: false, auditLogging: true,
  },
};

const INP = (extra = {}) => ({
  padding: '10px 14px', background: '#f8fafc', border: '1.5px solid #e2e8f0',
  borderRadius: 10, color: '#0f172a', fontSize: 13, fontWeight: 500,
  outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', ...extra,
});

const labelStyle = { fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 8 };
const cardStyle  = { background: '#fff', borderRadius: 16, padding: '28px 32px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' };

function SaveBtn({ loading, saved, onClick }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      padding: '10px 24px', borderRadius: 10, border: 'none',
      background: saved ? '#10b981' : `linear-gradient(135deg, ${ACCENT}, #7c3aed)`,
      color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: loading ? 'wait' : 'pointer',
      display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
      boxShadow: saved ? '0 4px 14px rgba(16,185,129,0.35)' : `0 4px 14px ${ACCENT}44`,
    }}>
      {loading
        ? <><span style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }}/> Saving…</>
        : saved ? '✓ Saved Successfully!' : 'Save Changes'}
    </button>
  );
}

function FocusInput({ style, ...props }) {
  return (
    <input {...props} style={style}
      onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px ${ACCENT}18`; e.target.style.background = '#fafbff'; }}
      onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
    />
  );
}

export default function SystemSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SETTINGS;
  });
  const [tab,     setTab]     = useState('hours');
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
      setLoading(false); setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 800);
  };

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const TABS = [
    { k:'hours',    label:'Working Hours',     icon:'⏰' },
    { k:'perf',     label:'Performance',       icon:'📊' },
    { k:'rating',   label:'Rating Scale',      icon:'⭐' },
    { k:'cycle',    label:'Review Cycle',      icon:'🔄' },
    { k:'security', label:'Backup & Security', icon:'🛡️' },
  ];

  const sectionTitle = (title, subtitle) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--role-color, #4f46e5)', marginBottom: 4 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12.5, color: '#64748b' }}>{subtitle}</div>}
    </div>
  );

  return (
    <Layout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 900 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          <div style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${ACCENT},#7c3aed)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 14px ${ACCENT}44` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <div>
            <div style={{ fontSize:22, fontWeight:900, color:'var(--role-color, #4f46e5)', letterSpacing:-0.5 }}>System Settings</div>
            <div style={{ fontSize:12.5, color:'#64748b', marginTop:2 }}>Configure company-wide performance rules, working hours, and security policies</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:24, background:'#fff', borderRadius:14, padding:6, border:'1.5px solid #f1f5f9', flexWrap:'wrap', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          {TABS.map(t => {
            const isActive = tab === t.k;
            return (
              <button key={t.k} onClick={() => { setTab(t.k); setSaved(false); }} style={{
                padding:'9px 18px', borderRadius:10, fontSize:13, fontWeight:600,
                cursor:'pointer', border:'none',
                background: isActive ? `linear-gradient(135deg,${ACCENT},#7c3aed)` : 'transparent',
                color: isActive ? '#fff' : '#64748b',
                display:'flex', alignItems:'center', gap:7, transition:'all 0.15s', whiteSpace:'nowrap',
                boxShadow: isActive ? `0 4px 12px ${ACCENT}44` : 'none',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='#f8fafc'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='transparent'; }}
              >{t.icon} {t.label}</button>
            );
          })}
        </div>

        {/* ── WORKING HOURS ── */}
        {tab==='hours' && (
          <div style={cardStyle}>
            {sectionTitle('⏰ Working Hours', 'Define office working schedule and attendance thresholds')}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18, marginBottom:24 }}>
              {[
                { label:'Office Start Time', type:'time', val:settings.workingHours.start, onChange:e=>setSettings(s=>({...s,workingHours:{...s.workingHours,start:e.target.value}})) },
                { label:'Office End Time',   type:'time', val:settings.workingHours.end,   onChange:e=>setSettings(s=>({...s,workingHours:{...s.workingHours,end:e.target.value}})) },
                { label:'Late Threshold (mins)', type:'number', val:settings.workingHours.lateThresholdMins, onChange:e=>setSettings(s=>({...s,workingHours:{...s.workingHours,lateThresholdMins:Number(e.target.value)}})) },
              ].map(f => (
                <div key={f.label}>
                  <label style={labelStyle}>{f.label}</label>
                  <FocusInput type={f.type} value={f.val} onChange={f.onChange} style={{...INP(),width:'100%'}} min={f.type==='number'?0:undefined} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={labelStyle}>Working Days</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {days.map(d => {
                  const active = settings.workingHours.workDays.includes(d);
                  return (
                    <button key={d} onClick={() => setSettings(s=>({...s,workingHours:{...s.workingHours,workDays:active?s.workingHours.workDays.filter(x=>x!==d):[...s.workingHours.workDays,d]}}))}
                      style={{ padding:'9px 18px', borderRadius:20, fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s', background:active?`linear-gradient(135deg,${ACCENT},#7c3aed)`:'#f8fafc', color:active?'#fff':'#64748b', border:`1.5px solid ${active?ACCENT:'#e2e8f0'}`, boxShadow:active?`0 3px 10px ${ACCENT}35`:'none' }}>{d}</button>
                  );
                })}
              </div>
            </div>
            <div style={{ padding:'14px 18px', background:`${ACCENT}08`, borderRadius:12, border:`1px solid ${ACCENT}20`, marginBottom:24, fontSize:13, color:'#475569', display:'flex', gap:10 }}>
              <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
              <span><strong style={{color:ACCENT}}>Attendance auto-capture:</strong> Employees are marked LATE if they log in more than <strong>{settings.workingHours.lateThresholdMins}</strong> minutes after <strong>{settings.workingHours.start}</strong>. Login and logout times are automatically recorded.</span>
            </div>
            <SaveBtn loading={loading} saved={saved} onClick={handleSave}/>
          </div>
        )}

        {/* ── PERFORMANCE ── */}
        {tab==='perf' && (
          <div style={cardStyle}>
            {sectionTitle('📊 Performance Criteria', 'Set evaluation categories and their weightage (must total 100%)')}
            <div style={{ marginBottom:24 }}>
              {settings.performance.map((c,i) => (
                <div key={c.id} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12, padding:'12px 16px', background:'#f8fafc', borderRadius:12, border:'1.5px solid #f1f5f9' }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:`${ACCENT}15`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:ACCENT, flexShrink:0 }}>{i+1}</div>
                  <FocusInput value={c.name} onChange={e=>{ const u=[...settings.performance]; u[i]={...c,name:e.target.value}; setSettings(s=>({...s,performance:u})); }} style={{...INP(),flex:1,background:'#fff'}}/>
                  <FocusInput type="number" value={c.weight} min={0} max={100} onChange={e=>{ const u=[...settings.performance]; u[i]={...c,weight:Number(e.target.value)}; setSettings(s=>({...s,performance:u})); }} style={{...INP({width:72,textAlign:'center',background:'#fff'})}}/>
                  <span style={{ fontSize:13, color:'#94a3b8', fontWeight:600 }}>%</span>
                  <div style={{ width:120, height:8, background:'#e2e8f0', borderRadius:6, overflow:'hidden', flexShrink:0 }}>
                    <div style={{ height:'100%', width:`${Math.min(c.weight,100)}%`, background:`linear-gradient(90deg,${ACCENT},#7c3aed)`, borderRadius:6, transition:'width 0.3s' }}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ padding:'8px 16px', borderRadius:10, background:settings.performance.reduce((s,c)=>s+c.weight,0)===100?'rgba(16,185,129,0.1)':'rgba(244,63,94,0.1)', border:`1.5px solid ${settings.performance.reduce((s,c)=>s+c.weight,0)===100?'#10b981':'#f43f5e'}44` }}>
                <span style={{ fontSize:13, fontWeight:700, color:settings.performance.reduce((s,c)=>s+c.weight,0)===100?'#10b981':'#f43f5e' }}>
                  Total: {settings.performance.reduce((s,c)=>s+c.weight,0)}%
                  {settings.performance.reduce((s,c)=>s+c.weight,0)!==100 && <span style={{ fontWeight:400, fontSize:11, marginLeft:8 }}>⚠ Must equal 100%</span>}
                </span>
              </div>
              <SaveBtn loading={loading} saved={saved} onClick={handleSave}/>
            </div>
          </div>
        )}

        {/* ── RATING SCALE ── */}
        {tab==='rating' && (
          <div style={cardStyle}>
            {sectionTitle('⭐ Rating Scale', 'Define what each rating score means for employees')}
            <div style={{ marginBottom:24 }}>
              {settings.rating.labels.map((label,i) => {
                const starColors = ['#f43f5e','#f97316','#f59e0b','#84cc16','#10b981'];
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12, padding:'12px 16px', background:'#f8fafc', borderRadius:12, border:'1.5px solid #f1f5f9' }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:`${starColors[i]}15`, border:`1.5px solid ${starColors[i]}30`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, color:starColors[i], flexShrink:0 }}>{i+1}</div>
                    <FocusInput value={label} onChange={e=>{ const ls=[...settings.rating.labels]; ls[i]=e.target.value; setSettings(s=>({...s,rating:{...s.rating,labels:ls}})); }} style={{...INP(),flex:1,background:'#fff'}}/>
                    <div style={{ display:'flex', gap:2, flexShrink:0 }}>
                      {Array.from({length:5},(_,j)=>(
                        <span key={j} style={{ fontSize:15, color:j<=i?'#f59e0b':'#e2e8f0' }}>★</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <SaveBtn loading={loading} saved={saved} onClick={handleSave}/>
          </div>
        )}

        {/* ── REVIEW CYCLE ── */}
        {tab==='cycle' && (
          <div style={cardStyle}>
            {sectionTitle('🔄 Review Cycle', 'How frequently performance reviews are conducted across the organisation')}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginBottom:28 }}>
              {[
                { value:'Monthly',     desc:'Review every month',    icon:'📅', detail:'12 reviews/year' },
                { value:'Quarterly',   desc:'Review every 3 months', icon:'📆', detail:'4 reviews/year'  },
                { value:'Half-yearly', desc:'Review every 6 months', icon:'🗓️', detail:'2 reviews/year'  },
                { value:'Annually',    desc:'Review once per year',  icon:'📋', detail:'1 review/year'   },
              ].map(opt => {
                const active = settings.reviewCycle===opt.value;
                return (
                  <button key={opt.value} onClick={()=>setSettings(s=>({...s,reviewCycle:opt.value}))} style={{ padding:'18px 20px', borderRadius:14, cursor:'pointer', textAlign:'left', transition:'all 0.15s', background:active?`${ACCENT}0f`:'#f8fafc', border:`2px solid ${active?ACCENT:'#e2e8f0'}`, boxShadow:active?`0 4px 16px ${ACCENT}22`:'none' }}>
                    <div style={{ fontSize:26, marginBottom:8 }}>{opt.icon}</div>
                    <div style={{ fontSize:15, fontWeight:800, color:active?ACCENT:'#0f172a', marginBottom:3 }}>{opt.value}</div>
                    <div style={{ fontSize:12, color:'#64748b', marginBottom:6 }}>{opt.desc}</div>
                    <div style={{ display:'inline-block', padding:'2px 10px', borderRadius:20, background:active?`${ACCENT}18`:'#e2e8f0', fontSize:11, fontWeight:700, color:active?ACCENT:'#94a3b8' }}>{opt.detail}</div>
                    {active && <div style={{ marginTop:10, fontSize:11, color:ACCENT, fontWeight:700 }}>✓ Currently selected</div>}
                  </button>
                );
              })}
            </div>
            <SaveBtn loading={loading} saved={saved} onClick={handleSave}/>
          </div>
        )}

        {/* ── BACKUP & SECURITY ── */}
        {tab==='security' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={cardStyle}>
              {sectionTitle('🛡️ Security Settings', 'Authentication and access control configuration')}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                {[
                  { label:'Session Timeout (minutes)', key:'sessionTimeout' },
                  { label:'Max Login Attempts',        key:'maxLoginAttempts' },
                  { label:'Password Min Length',       key:'passwordMinLength' },
                  { label:'Token Expiry (hours)',      key:'tokenExpiry' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <FocusInput type="number" min={1} value={settings.security[f.key]} onChange={e=>setSettings(s=>({...s,security:{...s.security,[f.key]:Number(e.target.value)}}))} style={{...INP(),width:'100%'}}/>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
                {[
                  { label:'Force 2FA for Admins', key:'force2FA' },
                  { label:'IP Whitelist Enabled',  key:'ipWhitelist' },
                  { label:'Audit Logging Active',  key:'auditLogging' },
                ].map(f => {
                  const active = settings.security[f.key];
                  return (
                    <button key={f.key} onClick={()=>setSettings(s=>({...s,security:{...s.security,[f.key]:!s.security[f.key]}}))} style={{ padding:'9px 16px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8, transition:'all 0.15s', background:active?`${ACCENT}10`:'#f8fafc', border:`1.5px solid ${active?ACCENT:'#e2e8f0'}`, color:active?ACCENT:'#64748b' }}>
                      <div style={{ width:18, height:18, borderRadius:5, background:active?ACCENT:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                        {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      {f.label}
                    </button>
                  );
                })}
              </div>
              <SaveBtn loading={loading} saved={saved} onClick={handleSave}/>
            </div>

            <div style={cardStyle}>
              {sectionTitle('💾 Backup Management', 'System data backup and restore')}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
                {[
                  { label:'Last Backup',  val:'Today · 02:00 AM',  color:'#10b981', icon:'✅' },
                  { label:'Backup Size',  val:'142 MB',             color:ACCENT,    icon:'💾' },
                  { label:'Auto Backup',  val:'Daily at 2:00 AM',   color:'#f59e0b', icon:'🔄' },
                  { label:'Retention',    val:'30 days',            color:'#f43f5e', icon:'📅' },
                ].map(s => (
                  <div key={s.label} style={{ padding:'14px 16px', background:'#f8fafc', borderRadius:12, border:`1.5px solid ${s.color}20` }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                    <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{s.label}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:s.color, marginTop:3 }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {[
                  { label:'💾 Backup Now',      color:ACCENT },
                  { label:'↩️ Restore Backup',  color:'#f59e0b' },
                  { label:'📥 Download Backup', color:'#10b981' },
                ].map(btn => (
                  <button key={btn.label} onClick={()=>alert(`${btn.label} — available in production`)} style={{ padding:'10px 20px', borderRadius:10, border:`1.5px solid ${btn.color}44`, background:`${btn.color}10`, color:btn.color, fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${btn.color}20`;e.currentTarget.style.transform='translateY(-1px)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${btn.color}10`;e.currentTarget.style.transform='none';}}
                  >{btn.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
