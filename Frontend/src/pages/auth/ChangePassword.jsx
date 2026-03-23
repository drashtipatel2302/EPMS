import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const apiFetch = async (url, method = 'GET', body = null) => {
  const token = localStorage.getItem('epms_token');
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'var(--bg-elevated)', border: '1.5px solid var(--border)',
  borderRadius: 9, color: 'var(--text-primary)', fontSize: 13,
  outline: 'none', transition: 'all 0.15s', boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
};

function OtpBoxes({ value, onChange, disabled }) {
  const refs = useRef([]);
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '20px 0' }}>
      {[0,1,2,3,4,5].map(i => (
        <input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1} disabled={disabled}
          value={(value[i] || '').trim()}
          onChange={e => {
            const ch = e.target.value.replace(/\D/g,'').slice(-1);
            const arr = (value + '      ').slice(0,6).split('');
            arr[i] = ch;
            onChange(arr.join(''));
            if (ch && i < 5) refs.current[i+1]?.focus();
          }}
          onKeyDown={e => { if (e.key === 'Backspace' && !e.target.value && i > 0) refs.current[i-1]?.focus(); }}
          onPaste={e => {
            const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
            onChange(p.padEnd(6,' ').slice(0,6));
            refs.current[Math.min(p.length,5)]?.focus();
            e.preventDefault();
          }}
          style={{
            width: 50, height: 58, textAlign: 'center', fontSize: 22, fontWeight: 700,
            border: (value[i]||'').trim() ? '2px solid #4f46e5' : '1.5px solid var(--border)',
            borderRadius: 10, background: (value[i]||'').trim() ? 'rgba(79,70,229,0.07)' : 'var(--bg-elevated)',
            color: 'var(--text-primary)', outline: 'none', caretColor: 'transparent',
            transition: 'all 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor='#4f46e5'; e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.12)'; }}
          onBlur={e => { e.target.style.boxShadow='none'; if(!(value[i]||'').trim()) e.target.style.borderColor='var(--border)'; }}
        />
      ))}
    </div>
  );
}

function PasswordStrength({ pw }) {
  if (!pw) return null;
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const colors = ['','#ef4444','#f97316','#eab308','#22c55e'];
  const labels = ['','Weak','Fair','Good','Strong'];
  return (
    <div>
      <div style={{ display:'flex', gap:4, marginBottom:4 }}>
        {[1,2,3,4].map(n => <div key={n} style={{ flex:1, height:3, borderRadius:4, background: n<=score ? colors[score] : 'var(--border)', transition:'background 0.3s' }}/>)}
      </div>
      <div style={{ fontSize:11, color:colors[score], fontWeight:600 }}>{labels[score]}</div>
    </div>
  );
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const [step, setStep]           = useState('form');   // 'form' | 'otp' | 'done'
  const [form, setForm]           = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [otp, setOtp]             = useState('      ');
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState('');

  const stepNum = { form:1, otp:2, done:2 };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!form.currentPassword) { setError('Please enter your current password.'); return; }
    if (!form.newPassword)     { setError('Please enter a new password.'); return; }
    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setError(''); setLoading(true);
    try {
      await apiFetch('/api/employee/change-password/send-otp', 'POST', {});
      setOtp('      ');
      setStep('otp');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleConfirm = async (e) => {
    e?.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setError(''); setLoading(true);
    try {
      await apiFetch('/api/employee/change-password', 'PUT', {
        otp: cleanOtp,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStep('done');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '8px 0' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:20, color:'var(--text-primary)', marginBottom:4 }}>
            🔑 Change Password
          </h2>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>
            Update your account password securely with OTP verification.
          </p>
        </div>

        <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:16, padding:32, boxShadow:'0 4px 24px rgba(0,0,0,0.05)' }}>

          {/* Progress bar */}
          <div style={{ display:'flex', gap:6, marginBottom:28 }}>
            {[1,2].map(n => (
              <div key={n} style={{ height:4, flex:1, borderRadius:4, background: n <= stepNum[step] ? '#4f46e5' : 'var(--border)', transition:'background 0.3s' }}/>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:'#fff1f2', border:'1px solid #fecdd3', borderRadius:8, padding:'10px 14px', color:'#f43f5e', fontSize:12, marginBottom:20, display:'flex', gap:8, alignItems:'center' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Step 1: Form */}
          {step === 'form' && (
            <form onSubmit={handleSendOtp} style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <div>
                <label style={labelStyle}>Current Password</label>
                <input type={showPw ? 'text' : 'password'} value={form.currentPassword}
                  onChange={e => setForm(f => ({...f, currentPassword:e.target.value}))}
                  placeholder="Enter your current password" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor='#4f46e5'; e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <div style={{ position:'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={form.newPassword}
                    onChange={e => setForm(f => ({...f, newPassword:e.target.value}))}
                    placeholder="At least 6 characters" style={{ ...inputStyle, paddingRight:40 }}
                    onFocus={e => { e.target.style.borderColor='#4f46e5'; e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:2 }}>
                    {showPw
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                <div style={{ marginTop:8 }}><PasswordStrength pw={form.newPassword} /></div>
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input type={showPw ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={e => setForm(f => ({...f, confirmPassword:e.target.value}))}
                  placeholder="Repeat new password" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor='#4f46e5'; e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
                />
                {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                  <div style={{ fontSize:11, color:'#f43f5e', marginTop:4 }}>Passwords do not match</div>
                )}
                {form.confirmPassword && form.newPassword === form.confirmPassword && form.newPassword && (
                  <div style={{ fontSize:11, color:'#22c55e', marginTop:4 }}>✓ Passwords match</div>
                )}
              </div>

              <div style={{ background:'rgba(79,70,229,0.06)', border:'1px solid rgba(79,70,229,0.15)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'var(--text-secondary)', display:'flex', gap:8 }}>
                📲 An OTP will be sent to your registered email to confirm this change.
              </div>

              <button type="submit" disabled={loading} style={{
                padding:'13px', background: loading ? '#c7d2fe' : '#4f46e5',
                color:'#fff', fontWeight:700, fontSize:13, borderRadius:9, border:'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(79,70,229,0.3)',
                transition:'all 0.15s',
              }}
                onMouseEnter={e => { if(!loading) e.currentTarget.style.background='#4338ca'; }}
                onMouseLeave={e => { if(!loading) e.currentTarget.style.background='#4f46e5'; }}
              >
                {loading ? 'Sending OTP…' : 'Send OTP to Email →'}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleConfirm}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📲</div>
                <h3 style={{ fontWeight:700, fontSize:17, color:'var(--text-primary)', marginBottom:6 }}>Check your email</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6, marginBottom:4 }}>
                  A 6-digit OTP has been sent to your registered email address.
                </p>
                <p style={{ fontSize:12, color:'var(--text-muted)' }}>Valid for 10 minutes.</p>
              </div>
              <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" onClick={() => { setStep('form'); setError(''); }} style={{
                  flex:1, padding:'12px', borderRadius:9, border:'1px solid var(--border)',
                  background:'var(--bg-elevated)', color:'var(--text-secondary)', cursor:'pointer', fontWeight:600, fontSize:13,
                }}>← Back</button>
                <button type="submit" disabled={loading} style={{
                  flex:2, padding:'12px', background: loading ? '#c7d2fe' : '#4f46e5',
                  color:'#fff', fontWeight:700, fontSize:13, borderRadius:9, border:'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(79,70,229,0.3)',
                }}>
                  {loading ? 'Verifying…' : 'Confirm Change'}
                </button>
              </div>
              <div style={{ textAlign:'center', marginTop:16 }}>
                <button type="button" onClick={handleSendOtp} disabled={loading} style={{ color:'#4f46e5', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontSize:12 }}>
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Done */}
          {step === 'done' && (
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
              <h3 style={{ fontWeight:700, fontSize:18, color:'var(--text-primary)', marginBottom:8 }}>Password Changed!</h3>
              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6, marginBottom:28 }}>
                Your password has been updated successfully. Use your new password on your next login.
              </p>
              <button onClick={() => navigate(-1)} style={{
                padding:'12px 28px', background:'#4f46e5', color:'#fff', fontWeight:700, fontSize:13,
                borderRadius:9, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(79,70,229,0.3)',
              }}>
                ← Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
