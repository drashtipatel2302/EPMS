import React from 'react';

export function Card({ children, style, glass }) {
  return (
    <div className="epms-card" style={{
      background: glass ? 'rgba(255,255,255,0.85)' : '#ffffff',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: 24,
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}>{children}</div>
  );
}

export function StatCard({ label, value, sub, color = '#4f46e5', icon, trend, delay = 0 }) {
  const isPositive = trend > 0;
  return (
    <div className="epms-stat-card epms-fade-up" style={{
      background: '#ffffff', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding: 20,
      position: 'relative', overflow: 'hidden',
      animationDelay: `${delay}s`,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ position:'absolute', top:0, right:0, width:100, height:100, background:`radial-gradient(circle at top right, ${color}12, transparent 70%)`, borderRadius:'0 var(--r-lg) 0 100%' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:`${color}12`, border:`1px solid ${color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, transition:'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.2) rotate(-5deg)'}
          onMouseLeave={e=>e.currentTarget.style.transform='scale(1) rotate(0deg)'}
        >{icon}</div>
        {trend !== undefined && (
          <div className="epms-role-badge" style={{ padding:'3px 8px', borderRadius:20, background:isPositive?'#f0fdf4':'#fff1f2', color:isPositive?'#16a34a':'#f43f5e', fontSize:11, fontWeight:600 }}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="epms-count-up" style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:30, color:'var(--text-primary)', lineHeight:1, animationDelay:`${delay + 0.1}s` }}>{value}</div>
      <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:6 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{sub}</div>}
    </div>
  );
}

const BADGE_COLORS = {
  'active':       { bg:'#f0fdf4', text:'#16a34a', border:'#bbf7d0' },
  'inactive':     { bg:'#fff1f2', text:'#f43f5e', border:'#fecdd3' },
  'on-track':     { bg:'#f0fdf4', text:'#16a34a', border:'#bbf7d0' },
  'at-risk':      { bg:'#fffbeb', text:'#d97706', border:'#fde68a' },
  'not-started':  { bg:'#f8fafc', text:'#64748b', border:'#e2e8f0' },
  'completed':    { bg:'#f0fdf4', text:'#16a34a', border:'#bbf7d0' },
  'pending':      { bg:'#eef2ff', text:'#4f46e5', border:'#c7d2fe' },
  'overdue':      { bg:'#fff1f2', text:'#f43f5e', border:'#fecdd3' },
  'approved':     { bg:'#f0fdf4', text:'#16a34a', border:'#bbf7d0' },
  'under-review': { bg:'#fffbeb', text:'#d97706', border:'#fde68a' },
  'in-progress':  { bg:'#f0f9ff', text:'#0ea5e9', border:'#bae6fd' },
  'scheduled':    { bg:'#f8fafc', text:'#64748b', border:'#e2e8f0' },
  'high':         { bg:'#fff1f2', text:'#f43f5e', border:'#fecdd3' },
  'medium':       { bg:'#fffbeb', text:'#d97706', border:'#fde68a' },
  'low':          { bg:'#f0fdf4', text:'#16a34a', border:'#bbf7d0' },
  'HIGH':         { bg:'#fff1f2', text:'#f43f5e', border:'#fecdd3' },
  'MEDIUM':       { bg:'#fffbeb', text:'#d97706', border:'#fde68a' },
  'LOW':          { bg:'#f0fdf4', text:'#16a34a', border:'#bbf7d0' },
  'PENDING':      { bg:'#eef2ff', text:'#4f46e5', border:'#c7d2fe' },
  'COMPLETED':    { bg:'#f0fdf4', text:'#16a34a', border:'#bbf7d0' },
  'IN_PROGRESS':  { bg:'#f0f9ff', text:'#0ea5e9', border:'#bae6fd' },
  'APPROVED':     { bg:'#f0fdf4', text:'#16a34a', border:'#bbf7d0' },
  'REJECTED':     { bg:'#fff1f2', text:'#f43f5e', border:'#fecdd3' },
  'ACTIVE':       { bg:'#f0fdf4', text:'#16a34a', border:'#bbf7d0' },
  'INACTIVE':     { bg:'#fff1f2', text:'#f43f5e', border:'#fecdd3' },
};

export function Badge({ status }) {
  const c = BADGE_COLORS[status] || { bg:'#f8fafc', text:'#64748b', border:'#e2e8f0' };
  return (
    <span style={{ padding:'3px 10px', borderRadius:20, background:c.bg, color:c.text, border:`1px solid ${c.border}`, fontSize:11, fontWeight:600, textTransform:'capitalize', whiteSpace:'nowrap' }}>
      {status?.replace(/[_-]/g,' ')}
    </span>
  );
}

export function ProgressBar({ value, max=100, color='indigo', height=6, showLabel=false }) {
  const pct = Math.min(100, Math.round((value/max)*100));
  const colorMap = { indigo:'#4f46e5', green:'#10b981', blue:'#0ea5e9', red:'#f43f5e', amber:'#f59e0b', gray:'#94a3b8' };
  const barColor = colorMap[color] || color;
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div>
      {showLabel && (
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:11, color:'var(--text-muted)' }}>
          <span>{value}/{max}</span>
          <span style={{ color:barColor, fontWeight:600 }}>{pct}%</span>
        </div>
      )}
      <div style={{ height, background:'var(--bg-elevated)', borderRadius:height, overflow:'hidden' }}>
        <div style={{
          height:'100%',
          width:`${width}%`,
          background:`linear-gradient(90deg, ${barColor}cc, ${barColor})`,
          borderRadius:height,
          transition:'width 1s cubic-bezier(0.34,1.1,0.64,1)',
          boxShadow:`0 0 8px ${barColor}55`,
          position:'relative',
          overflow:'hidden',
        }}>
          <div style={{
            position:'absolute', top:0, left:0, right:0, bottom:0,
            background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
            borderRadius:height,
          }}/>
        </div>
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <div>
        <h3 style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:18, color:'var(--text-primary)', margin:0 }}>{title}</h3>
        {subtitle && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function Button({ children, onClick, variant='primary', size='md', style: extra }) {
  const base = { padding:size==='sm'?'6px 14px':'10px 20px', borderRadius:'var(--r-sm)', fontWeight:600, fontSize:size==='sm'?12:13, cursor:'pointer', border:'none', transition:'all 0.15s', fontFamily:'var(--font-body)', ...extra };
  const variants = {
    primary:   { background:'#4f46e5', color:'#fff', boxShadow:'0 2px 8px rgba(79,70,229,0.25)' },
    secondary: { background:'var(--bg-elevated)', color:'var(--text-secondary)', border:'1px solid var(--border-med)' },
    danger:    { background:'#fff1f2', color:'#f43f5e', border:'1px solid #fecdd3' },
    success:   { background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0' },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

export function BarChart({ data, color='#6C63FF', height=180 }) {
  const [hovered, setHovered] = React.useState(null);
  const [animated, setAnimated] = React.useState(false);
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    // Reset animation state whenever data changes
    setAnimated(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => setAnimated(true), 80);
          observer.disconnect();
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [data]);

  const COLORS = [
    '#6C63FF','#43E8AC','#FFB547','#FF6584','#38BDF8','#F472B6','#A78BFA','#fb923c'
  ];

  if (!data || data.length === 0) return null;

  const values = data.map(d => d.score ?? d.rate ?? d.value ?? 0);
  const max = Math.max(...values, 1);

  const chartH = height;
  const barAreaH = chartH - 80; // space for labels bottom + value top
  const numTicks = 5;
  const ticks = Array.from({ length: numTicks + 1 }, (_, i) => Math.round((max / numTicks) * i));

  return (
    <div ref={chartRef} style={{ width: '100%', position: 'relative', userSelect: 'none' }}>
      <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
        {/* Y-axis */}
        <div style={{
          display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between',
          paddingBottom: 44, paddingTop: 32, marginRight: 10, minWidth: 32,
        }}>
          {ticks.map(t => (
            <span key={t} style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1 }}>{t}</span>
          ))}
        </div>

        {/* Bars area */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Grid lines */}
          <div style={{ position: 'absolute', inset: '0 0 44px 0', display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between', pointerEvents: 'none' }}>
            {ticks.map(t => (
              <div key={t} style={{ width: '100%', height: 1, background: 'var(--border)', opacity: 0.5 }} />
            ))}
          </div>

          {/* Bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: chartH, paddingBottom: 44, paddingTop: 32, position: 'relative', zIndex: 1 }}>
            {data.map((d, i) => {
              const val = d.score ?? d.rate ?? d.value ?? 0;
              const pct = val / max;
              const barColor = COLORS[i % COLORS.length];
              const label = d.dept ?? d.month ?? d.name ?? `Item ${i+1}`;
              const shortLabel = label.length > 5 ? label.slice(0, 4) + '…' : label;
              const isHov = hovered === i;

              return (
                <div
                  key={i}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Tooltip */}
                  {isHov && (
                    <div style={{
                      position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                      background: '#1e1b4b', color: '#fff', borderRadius: 8, padding: '6px 12px',
                      fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10,
                      boxShadow: '0 4px 16px rgba(108,99,255,0.35)',
                      marginBottom: 8, pointerEvents: 'none',
                    }}>
                      {label}: <span style={{ color: barColor }}>{val}%</span>
                      <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1e1b4b' }} />
                    </div>
                  )}

                  {/* Value label */}
                  <div style={{
                    fontSize: 16, fontWeight: 900, color: barColor, marginBottom: 6,
                    opacity: animated ? 1 : 0,
                    transform: animated ? 'translateY(0)' : 'translateY(10px)',
                    transition: `opacity 0.4s ease ${i * 0.1 + 0.3}s, transform 0.4s ease ${i * 0.1 + 0.3}s`,
                    letterSpacing: '-0.5px', lineHeight: 1,
                  }}>
                    {val}
                  </div>

                  {/* Bar */}
                  <div style={{
                    width: '100%', maxWidth: 56,
                    height: `${pct * barAreaH}px`,
                    background: isHov
                      ? `linear-gradient(180deg, ${barColor} 0%, ${barColor}bb 100%)`
                      : `linear-gradient(180deg, ${barColor}dd 0%, ${barColor}88 100%)`,
                    borderRadius: '6px 6px 3px 3px',
                    boxShadow: isHov ? `0 4px 20px ${barColor}55` : `0 2px 8px ${barColor}25`,
                    transformOrigin: 'bottom center',
                    transform: animated
                      ? (isHov ? 'scaleY(1) scaleX(1.06)' : 'scaleY(1) scaleX(1)')
                      : 'scaleY(0) scaleX(1)',
                    transition: `transform 0.7s cubic-bezier(0.34,1.15,0.64,1) ${i * 0.1}s, box-shadow 0.18s ease, background 0.18s ease`,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Shine */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
                      borderRadius: 'inherit',
                    }} />
                  </div>

                  {/* X label */}
                  <div style={{
                    marginTop: 8, fontSize: 13, fontWeight: 700, color: isHov ? barColor : 'var(--text-secondary)',
                    textAlign: 'center', lineHeight: 1.2, transition: 'color 0.18s ease',
                    maxWidth: 56, wordBreak: 'break-word',
                  }} title={label}>
                    {shortLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 12, paddingLeft: 42 }}>
        {data.map((d, i) => {
          const barColor = COLORS[i % COLORS.length];
          const label = d.dept ?? d.month ?? d.name ?? `Item ${i+1}`;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'default' }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: barColor, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: hovered === i ? barColor : 'var(--text-secondary)', fontWeight: hovered === i ? 700 : 500, transition: 'all 0.15s' }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DonutChart({ data, size=120 }) {
  const total = data.reduce((s,d)=>s+d.value,0);
  let offset = 0;
  const r=40, cx=size/2, cy=size/2, circ=2*Math.PI*r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d,i) => {
        const pct=d.value/total, dash=pct*circ;
        const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth="14" strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-offset*circ} transform={`rotate(-90 ${cx} ${cy})`} opacity="0.9"/>;
        offset+=pct; return el;
      })}
      <text x={cx} y={cy+6} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text-primary)" fontFamily="Inter,sans-serif">{total}</text>
    </svg>
  );
}

export function Sparkline({ data, color='#6C63FF', height=100 }) {
  const [hovered, setHovered] = React.useState(null);
  const [animated, setAnimated] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, []);

  if (!data || data.length === 0) return null;

  if (data.length === 1) {
    const d = data[0];
    const val = d.score ?? d.value ?? 0;
    const month = d.month ?? d.name ?? '';
    const maxVal = val > 10 ? 100 : 5;
    const pct = Math.min(val / maxVal, 1);
    const R = 42, CIRC = 2 * Math.PI * R;
    const [count, setCount] = React.useState(0);
    const [dashOffset, setDashOffset] = React.useState(CIRC);
    React.useEffect(() => {
      let start = null;
      const duration = 1400;
      const ease = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      const step = ts => {
        if (!start) start = ts;
        const prog = Math.min((ts - start) / duration, 1);
        const e = ease(prog);
        setCount(Math.round(e * val * 10) / 10);
        setDashOffset(CIRC - e * pct * CIRC);
        if (prog < 1) requestAnimationFrame(step);
      };
      const raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, []);
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, width:'100%', boxSizing:'border-box', background:`linear-gradient(135deg,${color}08 0%,${color}04 100%)`, borderRadius:12, border:`1px solid ${color}18`, padding:'12px 20px' }}>
        {/* Circle */}
        <div style={{ flexShrink:0 }}>
          <svg width={110} height={110} viewBox="0 0 110 110">
            <defs>
              <linearGradient id="circGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color}/>
                <stop offset="100%" stopColor={color} stopOpacity="0.5"/>
              </linearGradient>
              <filter id="circGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <circle cx={55} cy={55} r={42} fill="none" stroke={`${color}18`} strokeWidth="9"/>
            <circle cx={55} cy={55} r={42} fill="none"
              stroke="url(#circGrad)" strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 55 55)"
              filter="url(#circGlow)"
            />
            <text x={55} y={50} textAnchor="middle" fontSize="22" fontWeight="900" fill={color} fontFamily="Inter,sans-serif">{count.toFixed(1)}</text>
            <text x={55} y={65} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="Inter,sans-serif" fontWeight="600">{`OUT OF ${maxVal}`}</text>
          </svg>
        </div>
        {/* Info */}
        <div style={{ display:'flex', flexDirection:'column', gap:6, minWidth:0 }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:1.2 }}>{month}</div>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', lineHeight:1.3 }}>Avg Performance Score</div>
          {maxVal === 5 && (
            <div style={{ display:'flex', alignItems:'center', gap:3 }}>
              {[1,2,3,4,5].map(star => (
                <span key={star} style={{ fontSize:14, opacity: star <= Math.round(val) ? 1 : 0.2 }}>&#11088;</span>
              ))}
            </div>
          )}
          {maxVal === 100 && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)' }}>Score</div>
              <div style={{ fontSize:18, fontWeight:900, color:'var(--text-primary)' }}>{val}<span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>/100</span></div>
            </div>
          )}
          <div style={{ fontSize:10, color:'var(--text-muted)', lineHeight:1.4 }}>More data will appear as evaluations are added</div>
        </div>
      </div>
    );
  }

  const values = data.map(d => d.score ?? d.value ?? 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 600, H = height - 20, PAD = 16;

  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - ((v - min) / range) * (H - PAD * 2) + PAD;
    return [x, y];
  });

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length-1][0]},${H+20} L${pts[0][0]},${H+20} Z`;
  const gradId = `spark-${color.replace('#','')}`;

  return (
    <div style={{ width:'100%', position:'relative' }}>
      <svg viewBox={`0 0 ${W} ${height}`} style={{ width:'100%', height, overflow:'visible' }}
        onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
          <filter id="glow-spark">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} opacity={animated ? 1 : 0} style={{ transition:'opacity 0.6s ease' }}/>
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-spark)"/>
        {pts.map(([x, y], i) => {
          const val = values[i];
          const isHov = hovered === i;
          return (
            <g key={i}>
              <rect x={x - 30} y={0} width={60} height={height} fill="transparent" onMouseEnter={() => setHovered(i)} style={{ cursor:'crosshair' }}/>
              {isHov && <line x1={x} y1={PAD} x2={x} y2={H+10} stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.4"/>}
              <circle cx={x} cy={y} r={isHov ? 6 : 4} fill={color} opacity={animated ? 1 : 0} style={{ transition:`opacity 0.4s ease ${i*0.08}s` }} filter={isHov ? 'url(#glow-spark)' : undefined}/>
              <circle cx={x} cy={y} r={isHov ? 10 : 0} fill={color} opacity="0.15" style={{ transition:'r 0.15s ease' }}/>
              {isHov && (
                <g>
                  <rect x={x - 28} y={y - 36} width={56} height={26} rx="7" fill="#1e1b4b"/>
                  <text x={x} y={y - 19} textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>{val}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ fontSize:11, color: hovered===i ? color : 'var(--text-muted)', fontWeight: hovered===i ? 700 : 500, textAlign:'center', transition:'color 0.15s', cursor:'default' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            {d.month ?? d.name ?? ''}
          </div>
        ))}
      </div>
    </div>
  );
}

export function KpiCard({ icon, value, label, delta, color='indigo', onClick }) {
  const colorMap = {
    indigo:{ bg:'#eef2ff', accent:'#4f46e5' }, blue:{ bg:'#f0f9ff', accent:'#0ea5e9' },
    green:{ bg:'#f0fdf4', accent:'#10b981' }, red:{ bg:'#fff1f2', accent:'#f43f5e' },
    amber:{ bg:'#fffbeb', accent:'#f59e0b' }, gray:{ bg:'#f8fafc', accent:'#64748b' },
  };
  const c = colorMap[color]||colorMap.indigo;
  return (
    <div onClick={onClick} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:'20px 24px', cursor:onClick?'pointer':'default', transition:'all 0.15s', boxShadow:'var(--shadow-sm)' }}
      onMouseEnter={e=>{ if(onClick){ e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(-2px)'; }}}
      onMouseLeave={e=>{ if(onClick){ e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='translateY(0)'; }}}
    >
      <div style={{ width:40, height:40, borderRadius:10, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:12 }}>{icon}</div>
      <div style={{ fontFamily:'var(--font-body)', fontSize:30, fontWeight:400, color:'var(--text-primary)', lineHeight:1 }}>{value??'—'}</div>
      <div style={{ fontSize:13, color:'var(--text-secondary)', marginTop:6 }}>{label}</div>
      {delta && <div style={{ fontSize:11, color:c.accent, marginTop:4 }}>{delta}</div>}
    </div>
  );
}

export function CardHeader({ children }) { return <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>{children}</div>; }
export function CardTitle({ children }) { return <h3 style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:17, color:'var(--text-primary)', margin:0 }}>{children}</h3>; }

export function Avatar({ name='?', size='md', src }) {
  const sizes = { sm:28, md:36, lg:48 };
  const px = sizes[size]||36;
  const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const colors = ['#4f46e5','#0ea5e9','#10b981','#f43f5e','#8b5cf6'];
  const color = colors[name.charCodeAt(0)%colors.length];
  if(src) return <img src={src} alt={name} style={{ width:px, height:px, borderRadius:'50%', objectFit:'cover' }}/>;
  return (
    <div style={{ width:px, height:px, borderRadius:'50%', background:color+'18', border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:px*0.35, fontWeight:600, color, flexShrink:0 }}>
      {initials}
    </div>
  );
}

const CHIP_COLORS = {
  green:{ bg:'#f0fdf4', text:'#16a34a' }, blue:{ bg:'#f0f9ff', text:'#0ea5e9' },
  indigo:{ bg:'#eef2ff', text:'#4f46e5' }, red:{ bg:'#fff1f2', text:'#f43f5e' },
  purple:{ bg:'#faf5ff', text:'#8b5cf6' }, gray:{ bg:'#f8fafc', text:'#64748b' },
  warn:{ bg:'#fffbeb', text:'#d97706' },
};
export function Chip({ children, color='gray' }) {
  const c = CHIP_COLORS[color]||CHIP_COLORS.gray;
  return <span style={{ padding:'3px 10px', borderRadius:20, background:c.bg, color:c.text, fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{children}</span>;
}

export function Btn({ children, onClick, variant='primary', size='md', type='button', disabled=false }) {
  const sizes = { sm:{padding:'5px 12px',fontSize:12}, md:{padding:'8px 18px',fontSize:13}, lg:{padding:'10px 24px',fontSize:14} };
  const variants = {
    primary:  { background:'#4f46e5', color:'#fff', border:'none', boxShadow:'0 2px 8px rgba(79,70,229,0.25)' },
    secondary:{ background:'var(--bg-elevated)', color:'var(--text-secondary)', border:'1px solid var(--border-med)' },
    ghost:    { background:'transparent', color:'#4f46e5', border:'none' },
    danger:   { background:'#fff1f2', color:'#f43f5e', border:'1px solid #fecdd3' },
    success:  { background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...sizes[size]||sizes.md, ...variants[variant]||variants.primary, borderRadius:8, fontWeight:600, cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.5:1, transition:'all 0.15s', fontFamily:'inherit' }}>
      {children}
    </button>
  );
}

export function Spinner({ size=32 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ width:size, height:size, borderRadius:'50%', border:'2px solid var(--bg-elevated)', borderTop:'2px solid #4f46e5', animation:'spin 0.7s linear infinite' }}/>
    </div>
  );
}

export function Modal({ open, onClose, title, children, width=520 }) {
  if(!open) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(15,23,42,0.4)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, animation:'fadeIn 0.15s ease' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:28, width:'100%', maxWidth:width, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.15)', animation:'fadeUp 0.2s ease' }}>
        {title && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h3 style={{ margin:0, fontFamily:'var(--font-body)', fontSize:18, fontWeight:400, color:'var(--text-primary)' }}>{title}</h3>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:22, lineHeight:1, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6 }}>×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Table({ headers=[], children, emptyMsg='No records found.' }) {
  return (
    <div style={{ overflowX:'auto', borderRadius:10, overflow:'hidden' }}>
      <style>{`
        .epms-table td { padding:11px 14px; color:var(--text-primary); border-bottom:1px solid var(--border); vertical-align:middle; font-size:13px; }
        .epms-table tr:last-child td { border-bottom:none; }
        .epms-table tbody tr:hover td { background:rgba(var(--role-color-rgb,79,70,229),0.04); }
        .epms-table th { background: var(--role-color, #4f46e5) !important; }
      `}</style>
      <table className="epms-table" style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {headers.map((h,i)=>(
              <th key={i} style={{
                textAlign:'left', padding:'11px 14px',
                color:'#ffffff', fontWeight:700, fontSize:11,
                textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap',
                background:'var(--role-color, #4f46e5)',
                position:'sticky', top:0, zIndex:2,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children || (
            <tr><td colSpan={headers.length} style={{ padding:'32px 14px', textAlign:'center', color:'var(--text-muted)' }}>{emptyMsg}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Stars({ value=0, max=5, onChange }) {
  return (
    <div style={{ display:'flex', gap:4 }}>
      {Array.from({length:max}).map((_,i)=>(
        <span key={i} onClick={()=>onChange&&onChange(i+1)} style={{ fontSize:18, cursor:onChange?'pointer':'default', color:i<value?'#f59e0b':'#e2e8f0', transition:'color 0.1s' }}>★</span>
      ))}
    </div>
  );
}

export function FormGroup({ label, children, error }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {label && <label style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</label>}
      {children}
      {error && <span style={{ fontSize:11, color:'#f43f5e' }}>{error}</span>}
    </div>
  );
}

const inputStyle = { background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'9px 12px', color:'var(--text-primary)', fontSize:13, outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit' };
export function Input({ value, onChange, placeholder, type='text', disabled, min, max, step, onBlur }) {
  return <input type={type} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} disabled={disabled} min={min} max={max} step={step} style={{ ...inputStyle, opacity:disabled?0.5:1 }}/>;
}
export function Select({ value, onChange, children, disabled }) {
  return <select value={value} onChange={onChange} disabled={disabled} style={{ ...inputStyle, opacity:disabled?0.5:1, cursor:'pointer' }}>{children}</select>;
}
export function Textarea({ value, onChange, placeholder, rows=3, disabled }) {
  return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled} style={{ ...inputStyle, resize:'vertical', opacity:disabled?0.5:1 }}/>;
}
export function FormGrid({ children, cols=2 }) {
  return <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:16 }}>{children}</div>;
}
export function FormActions({ children }) {
  return <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:20 }}>{children}</div>;
}
