import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const api = async (path, body) => {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

function OtpInput({ value, onChange, disabled }) {
  const inputs = useRef([]);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !e.target.value && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i, e) => {
    const ch = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = (value + '      ').slice(0, 6).split('');
    arr[i] = ch;
    const next = arr.join('');
    onChange(next);
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, ' ').slice(0, 6));
    if (pasted.length > 0) inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '24px 0' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={(value[i] || '').trim()}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: 48, height: 56,
            textAlign: 'center',
            fontSize: 22, fontWeight: 700,
            border: (value[i] || '').trim() ? '2px solid #4f46e5' : '1.5px solid #e2e8f0',
            borderRadius: 10,
            background: (value[i] || '').trim() ? 'rgba(79,70,229,0.06)' : '#f8fafc',
            color: '#1e293b',
            outline: 'none',
            transition: 'all 0.15s',
            caretColor: 'transparent',
          }}
          onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.12)'; }}
          onBlur={e => { e.target.style.boxShadow = 'none'; if (!(value[i] || '').trim()) e.target.style.borderColor = '#e2e8f0'; }}
        />
      ))}
    </div>
  );
}

function Countdown({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => { setLeft(seconds); }, [seconds]);
  useEffect(() => {
    if (left <= 0) { onDone(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return <span style={{ color: '#4f46e5', fontWeight: 700 }}>{m}:{s}</span>;
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
};
const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: '#f8fafc', border: '1.5px solid #e2e8f0',
  borderRadius: 9, color: '#1e293b', fontSize: 13,
  outline: 'none', transition: 'all 0.15s', boxSizing: 'border-box',
};
function ErrorBox({ msg }) {
  return (
    <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '10px 14px', color: '#f43f5e', fontSize: 12, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
      ⚠️ {msg}
    </div>
  );
}
function Spinner() {
  return <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;
}
function EyeBtn({ show, toggle }) {
  return (
    <button type="button" onClick={toggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
      {show
        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
      }
    </button>
  );
}
function PasswordStrength({ pw }) {
  if (!pw) return null;
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  return (
    <div style={{ marginTop: -6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(n => (
          <div key={n} style={{ flex: 1, height: 3, borderRadius: 4, background: n <= score ? colors[score] : '#e2e8f0', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: colors[score], fontWeight: 600 }}>{labels[score]}</div>
    </div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('      ');
  const [pw, setPw] = useState('');
  const [cpw, setCpw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const SubmitBtn = ({ text, icon }) => (
    <button type="submit" disabled={loading} style={{
      width: '100%', padding: '13px',
      background: loading ? '#c7d2fe' : 'linear-gradient(90deg,#4f46e5,#7c3aed)',
      color: '#fff', fontWeight: 700, fontSize: 14,
      borderRadius: 10, border: 'none',
      cursor: loading ? 'not-allowed' : 'pointer',
      boxShadow: loading ? 'none' : '0 4px 14px rgba(79,70,229,0.35)',
      transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {loading ? <><Spinner /> Processing…</> : <>{icon} {text}</>}
    </button>
  );

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email) { setError('Please enter your email.'); return; }
    setError(''); setLoading(true);
    try {
      await api('/api/auth/forgot-password/send-otp', { email });
      setOtp('      ');
      setCanResend(false);
      setTimerKey(k => k + 1);
      setStep('otp');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const clean = otp.trim();
    if (clean.length < 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setError(''); setLoading(true);
    try {
      await api('/api/auth/forgot-password/verify-otp', { email, otp: clean });
      setStep('reset');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e?.preventDefault();
    if (!pw || !cpw) { setError('Please fill all fields.'); return; }
    if (pw !== cpw) { setError('Passwords do not match.'); return; }
    if (pw.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await api('/api/auth/forgot-password/reset', { email, newPassword: pw, confirmPassword: cpw });
      setStep('done');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const stepNum = { email: 1, otp: 2, reset: 3, done: 3 };
  const icons   = { email: '📧', otp: '🔢', reset: '🔑', done: '✅' };
  const titles  = { email: 'Forgot Password', otp: 'Enter OTP', reset: 'New Password', done: 'Password Reset!' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa', fontFamily: 'var(--font-body)' }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle,rgba(79,70,229,0.10) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '40px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', position: 'relative' }}>

        {step !== 'done' && (
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 28, textDecoration: 'none' }}>
            ← Back to login
          </Link>
        )}

        {step !== 'done' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ height: 4, flex: 1, borderRadius: 4, background: n <= stepNum[step] ? '#4f46e5' : '#e2e8f0', transition: 'background 0.3s' }} />
            ))}
          </div>
        )}

        <div style={{ width: 52, height: 52, borderRadius: 14, background: step === 'done' ? 'rgba(16,185,129,0.12)' : 'rgba(79,70,229,0.12)', border: `1px solid ${step === 'done' ? 'rgba(16,185,129,0.3)' : 'rgba(79,70,229,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>
          {icons[step]}
        </div>

        <h2 style={{ fontWeight: 700, fontSize: 24, color: '#1e293b', marginBottom: 8 }}>{titles[step]}</h2>

        {/* ── email step ── */}
        {step === 'email' && (
          <>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>Enter your work email and we'll send a 6-digit OTP to reset your password.</p>
            {error && <ErrorBox msg={error} />}
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Work Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <SubmitBtn text="Send OTP" icon="→" />
            </form>
          </>
        )}

        {/* ── otp step ── */}
        {step === 'otp' && (
          <>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 4 }}>
              We sent a 6-digit code to <strong style={{ color: '#1e293b' }}>{email}</strong>.
            </p>
            {!canResend && (
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>
                Expires in: <Countdown key={timerKey} seconds={600} onDone={() => setCanResend(true)} />
              </p>
            )}
            {error && <ErrorBox msg={error} />}
            <form onSubmit={handleVerifyOtp}>
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />
              <SubmitBtn text="Verify OTP" icon="✓" />
            </form>
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
              {canResend
                ? <button onClick={handleSendOtp} disabled={loading} style={{ color: '#4f46e5', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Resend OTP</button>
                : <span>Didn't get the code? Resend after timer expires.</span>
              }
            </div>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button onClick={() => { setStep('email'); setOtp('      '); setError(''); }} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                ← Change email
              </button>
            </div>
          </>
        )}

        {/* ── reset step ── */}
        {step === 'reset' && (
          <>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>OTP verified! Choose a new password for your account.</p>
            {error && <ErrorBox msg={error} />}
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 6 characters" style={{ ...inputStyle, paddingRight: 40 }}
                    onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                  <EyeBtn show={showPw} toggle={() => setShowPw(s => !s)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input type={showPw ? 'text' : 'password'} value={cpw} onChange={e => setCpw(e.target.value)} placeholder="Repeat password" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <PasswordStrength pw={pw} />
              <SubmitBtn text="Reset Password" icon="🔒" />
            </form>
          </>
        )}

        {/* ── done step ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
              Your password for <strong style={{ color: '#1e293b' }}>{email}</strong> has been reset successfully.
            </p>
            <button onClick={() => navigate('/login')} style={{ padding: '13px 32px', background: 'linear-gradient(90deg,#4f46e5,#7c3aed)', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
              Go to Login →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
