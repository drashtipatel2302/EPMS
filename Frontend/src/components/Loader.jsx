import React from 'react';
export default function Loader({ message = 'Loading...' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', minHeight:300, gap:16 }}>
      <div style={{ width:36, height:36, borderRadius:'50%', border:'2px solid #e2e8f0', borderTop:'2px solid #4f46e5', animation:'spin 0.8s linear infinite' }}/>
      <span style={{ fontSize:12, color:'var(--text-muted)' }}>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
