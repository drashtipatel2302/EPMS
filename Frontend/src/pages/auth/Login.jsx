import React, { useState } from 'react';
import teamPhoto from '../../assets/teamPhoto.js';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@epms.com',   password: '123456', color: '#4f46e5' },
  { label: 'HR',          email: 'drashti@epms.com', password: '123456', color: '#f43f5e' },
  { label: 'Manager',     email: 'rahul@epms.com',   password: '123456', color: '#0ea5e9' },
  { label: 'Employee',    email: 'neha@epms.com',    password: '123456', color: '#10b981' },
];

const ROLE_TO_ROUTE = {
  SUPER_ADMIN:'admin', ADMIN:'admin', superadmin:'admin', admin:'admin',
  MANAGER:'manager', manager:'manager',
  EMPLOYEE:'employee', employee:'employee',
  HR:'hr', hr:'hr',
};

async function loginAPI(email, password) {
  let res;
  try {
    res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error('Cannot reach server — make sure the backend is running on port 3000.');
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(res.status === 500 || !text
      ? 'Backend crashed. Check MongoDB password and Atlas IP whitelist.'
      : `Unexpected server response (${res.status}).`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Invalid credentials');
  return data;
}

/* ── Floating stat chip ─────────────────────────────────────────────────── */
function StatChip({ icon, label, value, color, animClass, style }) {
  return (
    <div className={animClass} style={{
      position: 'absolute',
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16,
      padding: '10px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      border: `1px solid rgba(255,255,255,0.8)`,
      zIndex: 10,
      ...style,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#1e1b4b', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError(''); setLoading(true);
    try {
      const data = await loginAPI(email, password);
      login(data);
      navigate(`/${ROLE_TO_ROUTE[data.user?.role] || 'employee'}/dashboard`, { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function quickLogin(acc) {
    setError(''); setLoading(true);
    try {
      const data = await loginAPI(acc.email, acc.password);
      login(data);
      navigate(`/${ROLE_TO_ROUTE[data.user?.role] || 'employee'}/dashboard`, { replace: true });
    } catch (err) {
      setEmail(acc.email); setPassword(acc.password);
      setError(err.message); setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes floatA {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-3px) rotate(0.05deg); }
          66%      { transform: translateY(2px) rotate(-0.05deg); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-3px) rotate(-0.05deg); }
        }
        @keyframes floatC {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(2px); }
        }
        @keyframes shimmer {
          0%   { opacity: 0.85; }
          50%  { opacity: 1; }
          100% { opacity: 0.85; }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes formIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(80px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .chip-a { animation: floatA 60s ease-in-out infinite; }
        .chip-b { animation: floatB 75s ease-in-out infinite 10s; }
        .chip-c { animation: floatC 55s ease-in-out infinite 20s; }
        .left-panel { animation: panelIn 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .right-panel { animation: formIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }

        .slide-up-0 { animation: slideUpFade 1.2s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .slide-up-1 { animation: slideUpFade 1.2s cubic-bezier(0.16,1,0.3,1) 0.6s both; }
        .slide-up-2 { animation: slideUpFade 1.2s cubic-bezier(0.16,1,0.3,1) 1.0s both; }
        .slide-up-3 { animation: slideUpFade 1.2s cubic-bezier(0.16,1,0.3,1) 1.4s both; }
        .slide-up-4 { animation: slideUpFade 1.2s cubic-bezier(0.16,1,0.3,1) 1.8s both; }
        .slide-up-5 { animation: slideUpFade 1.2s cubic-bezier(0.16,1,0.3,1) 2.2s both; }
        .slide-up-6 { animation: slideUpFade 1.2s cubic-bezier(0.16,1,0.3,1) 2.6s both; }

        .quick-btn { transition: all 0.18s ease !important; }
        .quick-btn:hover { background: #f1f5f9 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
        .submit-btn { transition: all 0.18s ease; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(79,70,229,0.4) !important; }
        .badge-pulse { animation: shimmer 20s ease-in-out infinite; }

        @media (max-width: 768px) {
          .login-grid { grid-template-columns: 1fr !important; }
          .left-panel { display: none !important; }
          .right-panel { padding: 40px 24px !important; min-height: 100vh; }
          .login-form-inner { max-width: 100% !important; }
        }
      `}</style>

      <div className="login-grid" style={{
        minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
        fontFamily: 'var(--font-body)', background: '#f5f6fa',
      }}>

        {/* ══ LEFT PANEL — Photo + animations ══════════════════════════════ */}
        <div className="left-panel" style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        }}>

          {/* Team photo filling entire panel */}
          <img
            src={teamPhoto}
            alt="Team collaboration"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
            }}
          />

          {/* Gradient overlay — dark top for logo, lighter bottom for chips */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(15,12,60,0.82) 0%, rgba(15,12,60,0.35) 40%, rgba(15,12,60,0.55) 100%)',
          }}/>

          {/* Subtle color tint */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(79,70,229,0.25) 0%, transparent 60%)',
            mixBlendMode: 'overlay',
          }}/>

          {/* ── Logo top-left ── */}
          <div className="slide-up-0" style={{ position: 'absolute', top: 36, left: 44, zIndex: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 800, color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}>IQ</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#fff', lineHeight: 1, letterSpacing: -0.3 }}>PerformIQ</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3, letterSpacing: 0.5 }}>Employee Performance Management</div>
            </div>
          </div>

          {/* ── Bottom text overlay ── */}
          <div style={{ position: 'absolute', bottom: 44, left: 44, right: 44, zIndex: 20 }}>
            <div className="slide-up-2" style={{
              fontWeight: 700, fontSize: 28, color: '#fff',
              lineHeight: 1.2, marginBottom: 10, textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}>
              Manage your<br/>
              <span style={{ color: '#a5b4fc' }}>team better.</span>
            </div>
            <p className="slide-up-3" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0, maxWidth: 300, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
              Track performance, attendance, appraisals, and team goals — all in one unified platform.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
              {[{ v:'50+', l:'Employees' }, { v:'5+', l:'Departments' }, { v:'99.9%', l:'Uptime' }].map((s, i) => (
                <div key={s.l} className={`slide-up-${4 + i}`} style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  flex: 1,
                }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color: '#fff', lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Floating stat chips ── */}
          <StatChip
            icon="📈" label="Productivity Up" value="+24% this month"
            color="#4f46e5" animClass="chip-a slide-up-1"
            style={{ top: '28%', right: 28 }}
          />
          <StatChip
            icon="✅" label="Tasks Completed" value="1,247 tasks"
            color="#10b981" animClass="chip-b slide-up-2"
            style={{ top: '46%', left: 24 }}
          />
          <StatChip
            icon="⭐" label="Avg Performance" value="4.8 / 5.0"
            color="#f59e0b" animClass="chip-c slide-up-3"
            style={{ top: '63%', right: 20 }}
          />

          {/* ── Live badge ── */}
          <div className="badge-pulse slide-up-0" style={{
            position: 'absolute', top: 44, right: 44, zIndex: 20,
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 20, padding: '6px 14px',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399' }}/>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>System Live</span>
          </div>
        </div>

        {/* ══ RIGHT PANEL — Login form ══════════════════════════════════════ */}
        <div className="right-panel" style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start',
          padding: '48px 64px',
          background: 'linear-gradient(160deg, #f8faff 0%, #ffffff 50%, #f3f0ff 100%)',
          boxShadow: '-4px 0 40px rgba(79,70,229,0.08)',
          position: 'relative', overflow: 'hidden',
        }}>

          {/* Decorative blobs */}
          <div style={{ position:'absolute', top:-80, right:-80, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-60, left:-60, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', pointerEvents:'none' }}/>

          <div className="login-form-inner" style={{ maxWidth: 400, width: '100%', position:'relative', zIndex:1 }}>

            {/* ── Brand mark ── */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
              <div style={{
                width:40, height:40, borderRadius:12,
                background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14, fontWeight:900, color:'#fff',
                boxShadow:'0 4px 14px rgba(79,70,229,0.4)',
              }}>IQ</div>
              <div style={{ fontSize:17, fontWeight:800, color:'#1e1b4b', letterSpacing:-0.3 }}>PerformIQ</div>
            </div>

            {/* ── Heading ── */}
            <div style={{ marginBottom:28 }}>
              <h2 style={{
                fontWeight:900, fontSize:38, margin:'0 0 8px',
                lineHeight:1.05, letterSpacing:-1.5,
                background:'linear-gradient(135deg, #0f172a 30%, #4f46e5 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>Welcome back</h2>
              <p style={{ margin:0, fontSize:14, color:'#64748b', fontWeight:500 }}>
                Sign in to your account to continue
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background:'#fff1f2', border:'1.5px solid #fecdd3', borderRadius:12, padding:'12px 16px', color:'#be123c', fontSize:12.5, marginBottom:20, lineHeight:1.6, display:'flex', gap:10, alignItems:'flex-start' }}>
                <svg style={{ flexShrink:0, marginTop:2 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div>
                  <span>{error}</span>
                  {(error.includes('MongoDB') || error.includes('crashed') || error.includes('Database')) && (
                    <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid #fecdd3', fontSize:11, color:'#9f1239' }}>
                      <strong>How to fix:</strong>
                      <ol style={{ margin:'4px 0 0 14px', padding:0, lineHeight:2 }}>
                        <li>Fix <code style={{ background:'#ffe4e6', padding:'1px 4px', borderRadius:3 }}>MONGO_URI</code> in Backend/.env</li>
                        <li>Whitelist your IP in MongoDB Atlas → Network Access</li>
                        <li>Restart the backend server</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>

              {/* Email field */}
              <div>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:11.5, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Email Address
                </label>
                <div style={{ position:'relative' }}>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                    style={{ width:'100%', background:'#fff', border:'2px solid #e2e8f0', borderRadius:12, padding:'13px 16px', fontSize:14, color:'#0f172a', outline:'none', boxSizing:'border-box', transition:'all 0.2s', fontWeight:500 }}
                    onFocus={e => { e.target.style.borderColor='#4f46e5'; e.target.style.boxShadow='0 0 0 4px rgba(79,70,229,0.10)'; e.target.style.background='#fafbff'; }}
                    onBlur={e  => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#fff'; }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:11.5, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:1 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Password
                  </label>
                  <Link to="/forgot-password" style={{ fontSize:12, color:'#4f46e5', fontWeight:700, textDecoration:'none', letterSpacing:0.2 }}>Forgot password?</Link>
                </div>
                <div style={{ position:'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    style={{ width:'100%', background:'#fff', border:'2px solid #e2e8f0', borderRadius:12, padding:'13px 46px 13px 16px', fontSize:14, color:'#0f172a', outline:'none', boxSizing:'border-box', transition:'all 0.2s', fontWeight:500 }}
                    onFocus={e => { e.target.style.borderColor='#4f46e5'; e.target.style.boxShadow='0 0 0 4px rgba(79,70,229,0.10)'; e.target.style.background='#fafbff'; }}
                    onBlur={e  => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#fff'; }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:6, display:'flex' }}>
                    {showPass
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Sign In button */}
              <button type="submit" className="submit-btn" disabled={loading} style={{
                marginTop:4, padding:'14px',
                background: loading ? '#c7d2fe' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color:'#fff', border:'none', borderRadius:12,
                fontSize:15, fontWeight:800,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(79,70,229,0.45)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                letterSpacing:0.3,
              }}>
                {loading
                  ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }}/> Signing in...</>
                  : <><span>Sign In</span>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                }
              </button>
            </form>

          </div>
        </div>

      </div>
    </>
  );
}
