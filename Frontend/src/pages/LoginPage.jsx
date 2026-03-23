import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const EyeOpen = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOff = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const MetricCard = ({ value, label, sub }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'border-color 0.2s, background 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
  >
    {/* Top shimmer line */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)' }} />
    <div style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>{value}</div>
    <div style={{ fontSize: '10.5px', color: '#64748b', lineHeight: 1.4 }}>
      <span style={{ color: 'rgba(129,140,248,0.8)', fontWeight: 500 }}>{label}</span>
      {sub && <><br />{sub}</>}
    </div>
  </div>
);

const RolePill = ({ role, color, bg, border }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '5px 10px', borderRadius: '99px',
    fontFamily: "'Fira Code', monospace", fontSize: '10px', fontWeight: 500,
    color, background: bg, border: `1px solid ${border}`,
  }}>
    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', opacity: 0.7 }} />
    {role}
  </span>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form);
      const { token, user } = res.data;
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070b14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />

      {/* Global CSS */}
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.05); }
          66% { transform: translate(-15px, 20px) scale(0.95); }
        }
        @keyframes appear {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-ring {
          to { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes shimmer-btn {
          0% { left: -75%; }
          100% { left: 125%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .field-input::placeholder { color: #1e293b !important; }
        .field-input:focus { border-color: rgba(99,102,241,0.5) !important; background: rgba(99,102,241,0.04) !important; }
        .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 12px 36px rgba(99,102,241,0.45) !important; }
        .btn-submit:active { transform: translateY(0); }
        .btn-submit::after {
          content: ''; position: absolute;
          top: -50%; left: -75%; width: 50%; height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        .btn-submit:hover::after { left: 125%; }
        .toggle-pw:hover { color: #f1f5f9 !important; }
        .metric-card:hover { background: rgba(255,255,255,0.05) !important; border-color: rgba(99,102,241,0.3) !important; }
      `}</style>

      {/* Background blobs */}
      {[
        { w: 500, h: 500, top: -120, left: -80, color: 'rgba(99,102,241,0.22)', delay: '0s' },
        { w: 380, h: 380, bottom: -60, right: -60, color: 'rgba(34,211,238,0.12)', delay: '-4s' },
        { w: 300, h: 300, top: '40%', left: '55%', color: 'rgba(139,92,246,0.1)', delay: '-8s' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: b.w, height: b.h,
          top: b.top, left: b.left, bottom: b.bottom, right: b.right,
          background: `radial-gradient(circle, ${b.color}, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(90px)',
          animation: `drift 12s ease-in-out infinite`,
          animationDelay: b.delay,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Dot grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.18) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }} />

      {/* Main card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '980px',
        margin: '0 16px',
        display: 'flex',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 0 0 1px rgba(99,102,241,0.08), 0 40px 80px rgba(0,0,0,0.12)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: '42%',
          flexShrink: 0,
          background: 'linear-gradient(145deg, #0c1230 0%, #0a0f20 60%, #070b14 100%)',
          padding: '52px 44px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }} className="hidden-mobile">

          {/* Spinning conic gradient */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 260, height: 260,
            background: 'conic-gradient(from 0deg, rgba(99,102,241,0.15), transparent 50%)',
            borderRadius: '50%',
            animation: 'drift 20s linear infinite',
            pointerEvents: 'none',
          }} />

          {/* Bottom glow */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
            background: 'linear-gradient(to top, rgba(99,102,241,0.06), transparent)',
            pointerEvents: 'none',
          }} />

          {/* Version tag */}
          <span style={{ position: 'absolute', top: 24, right: 24, fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'rgba(99,102,241,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            v2.4.1
          </span>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48, animation: 'fadeUp 0.5s 0.2s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,102,241,0.35)', flexShrink: 0 }}>
              <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f1f5f9', lineHeight: 1 }}>EPMS</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'rgba(129,140,248,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>Performance System</div>
            </div>
          </div>

          {/* Hero text */}
          <div style={{ flex: 1, animation: 'fadeUp 0.5s 0.35s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#f1f5f9', marginBottom: 16 }}>
              Track Every<br />
              <span style={{ background: 'linear-gradient(90deg, #818cf8, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Achievement
              </span>
              <br />That Counts
            </h1>
            <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7, maxWidth: 240, fontWeight: 300 }}>
              A unified platform for measuring, managing, and celebrating your team's performance in real time.
            </p>
          </div>

          {/* Metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '36px 0 28px', animation: 'fadeUp 0.5s 0.5s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <MetricCard value="4" label="Access Roles" sub="Layered permissions" />
            <MetricCard value="JWT" label="Auth Security" sub="Token protected" />
            <MetricCard value="Live" label="Analytics" sub="Real-time data" />
            <MetricCard value="256" label="Bit Encrypted" sub="Secure transport" />
          </div>

          {/* Role pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, animation: 'fadeUp 0.5s 0.65s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <RolePill role="SUPER_ADMIN" color="#fbbf24" bg="rgba(251,191,36,0.08)" border="rgba(251,191,36,0.2)" />
            <RolePill role="HR" color="#34d399" bg="rgba(52,211,153,0.08)" border="rgba(52,211,153,0.2)" />
            <RolePill role="MANAGER" color="#60a5fa" bg="rgba(96,165,250,0.08)" border="rgba(96,165,250,0.2)" />
            <RolePill role="EMPLOYEE" color="#a78bfa" bg="rgba(167,139,250,0.08)" border="rgba(167,139,250,0.2)" />
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, background: '#0d1424', padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>

          {/* Left edge accent line */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 1, background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.3) 30%, rgba(34,211,238,0.2) 70%, transparent)' }} />

          {/* Form header */}
          <div style={{ marginBottom: 36, animation: 'fadeUp 0.5s 0.3s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Fira Code', monospace", fontSize: 10, color: '#818cf8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
              Secure Access
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.4), transparent)', maxWidth: 60 }} />
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: 13.5, color: '#64748b', fontWeight: 300 }}>Sign in to your employee dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#dc2626', lineHeight: 1.5, animation: 'shake 0.4s ease' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ animation: 'fadeUp 0.5s 0.45s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            {/* Email field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8, fontWeight: 500 }}>
                Email Address
              </label>
              <div style={{ position: 'relative', borderRadius: 12, boxShadow: focusedField === 'email' ? '0 0 0 2px rgba(99,102,241,0.35), 0 0 20px rgba(99,102,241,0.08)' : 'none', transition: 'box-shadow 0.2s' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#818cf8' : '#64748b', transition: 'color 0.2s', pointerEvents: 'none' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="field-input"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 44px 14px 42px', color: '#f1f5f9', fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 400, outline: 'none', transition: 'border-color 0.2s, background 0.2s' }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8, fontWeight: 500 }}>
                Password
              </label>
              <div style={{ position: 'relative', borderRadius: 12, boxShadow: focusedField === 'password' ? '0 0 0 2px rgba(99,102,241,0.35), 0 0 20px rgba(99,102,241,0.08)' : 'none', transition: 'box-shadow 0.2s' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#818cf8' : '#64748b', transition: 'color 0.2s', pointerEvents: 'none' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="field-input"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 44px 14px 42px', color: '#f1f5f9', fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 400, outline: 'none', transition: 'border-color 0.2s, background 0.2s' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="toggle-pw"
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'color 0.2s', display: 'flex' }}>
                  {showPassword ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
              style={{ width: '100%', position: 'relative', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', border: 'none', borderRadius: 12, padding: '15px 24px', color: 'white', fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', cursor: loading ? 'not-allowed' : 'pointer', overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.2s', boxShadow: '0 8px 28px rgba(99,102,241,0.35)', marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {/* Sheen overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.12), transparent)', borderRadius: 12 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative', zIndex: 1, opacity: loading ? 0 : 1, transition: 'opacity 0.2s' }}>
                Sign In
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              {loading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-ring 0.7s linear infinite' }} />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', animation: 'fadeUp 0.5s 0.6s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: '#1e293b', letterSpacing: '0.15em' }}>SYSTEM INFO</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s 0.65s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <p style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.7 }}>
              Access is restricted to authorized personnel.<br />
              Contact your <span style={{ color: 'rgba(99,102,241,0.7)' }}>HR department</span> to request an account.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'blink 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: '#1e293b' }}>Encrypted · Secure · Monitored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
