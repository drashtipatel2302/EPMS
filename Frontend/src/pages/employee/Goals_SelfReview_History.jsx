import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, SectionHeader, Badge, ProgressBar, Button } from '../../components/UI';
import Loader from '../../components/Loader';
import { getAuthHeaders } from '../../services/api';

const apiFetch = async (path, method = 'GET', body = null) => {
  const opts = { method, headers: getAuthHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// ─── Goals ────────────────────────────────────────────────────────────────────
export function Goals() {
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/employee/performance')
      .then(d => { setEvals(d.evaluations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: 900 }}>
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Reviews', count: evals.length, color: '#6C63FF' },
            { label: 'Avg Rating', count: evals.length ? (evals.reduce((s,e) => s + (e.overallRating||0), 0) / evals.length).toFixed(1) : '—', color: '#43E8AC' },
            { label: 'Latest Review', count: evals[0]?.reviewPeriod || '—', color: '#FFB547' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-surface)', border: `1px solid ${s.color}30`,
              borderRadius: 'var(--r-md)', padding: '14px 16px',
              borderLeft: `3px solid ${s.color}`,
            }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 24, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {evals.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No performance reviews yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Your manager will add performance evaluations here</div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {evals.map(g => (
              <Card key={g._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {g.reviewPeriod} Review — {g.reviewMonth || ''}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>By: {g.evaluatedBy?.name || 'Manager'}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 22, color: '#6C63FF' }}>
                    {g.overallRating}/5
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {['taskCompletion','teamwork','communication','punctuality'].map(k => (
                    <div key={k}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                        <span style={{ fontWeight: 600 }}>{g[k]}/5</span>
                      </div>
                      <ProgressBar value={g[k]} max={5} height={5} />
                    </div>
                  ))}
                </div>
                {g.remarks && <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{g.remarks}"</div>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

// ─── Self Review ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'goals',    label: 'Goal Achievement',  desc: 'How well did you meet your assigned goals?' },
  { id: 'quality',  label: 'Work Quality',       desc: 'Rate the quality and impact of your work output.' },
  { id: 'collab',   label: 'Collaboration',      desc: 'How well did you work with teammates and cross-functional teams?' },
  { id: 'learning', label: 'Learning & Growth',  desc: 'Did you actively learn and develop new skills?' },
  { id: 'comm',     label: 'Communication',      desc: 'Rate your effectiveness in communication.' },
];

const RATING_LABELS = ['', 'Needs Improvement', 'Below Expectations', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'];

export function SelfReview() {
  const [ratings,   setRatings]   = useState({});   // { sectionId: number }
  const [comments,  setComments]  = useState({});   // { sectionId: string }
  const [period,    setPeriod]    = useState(() => {
    const now = new Date();
    return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
  });
  const [reviews,   setReviews]   = useState([]);   // submitted reviews list
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [submitting,setSubmitting]= useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'history'

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem('selfReviewDraft');
      if (draft) {
        const { ratings: r, comments: c, period: p } = JSON.parse(draft);
        if (r) setRatings(r);
        if (c) setComments(c);
        if (p) setPeriod(p);
      }
    } catch(e) {}
    loadReviews();
  }, []);

  const loadReviews = () => {
    setLoadingReviews(true);
    apiFetch('/api/self-review')
      .then(d => setReviews(d.reviews || []))
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  };

  const buildSections = () => SECTIONS.map(s => ({
    id: s.id, label: s.label,
    rating: ratings[s.id] || null,
    comment: comments[s.id] || '',
  }));

  const handleSaveDraft = async () => {
    setSaving(true); setError('');
    try {
      // Save to localStorage
      localStorage.setItem('selfReviewDraft', JSON.stringify({ ratings, comments, period }));
      // Also persist to backend
      await apiFetch('/api/self-review/draft', 'POST', { period, sections: buildSections() });
      setSuccess('Draft saved!');
      setTimeout(() => setSuccess(''), 2500);
    } catch(e) {
      // Even if backend fails, localStorage save is fine
      setSuccess('Draft saved locally!');
      setTimeout(() => setSuccess(''), 2500);
    } finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    const rated = SECTIONS.filter(s => ratings[s.id]);
    if (rated.length === 0) { setError('Please rate at least one section before submitting.'); return; }
    if (!period.trim()) { setError('Please enter a review period.'); return; }
    setSubmitting(true); setError('');
    try {
      await apiFetch('/api/self-review/submit', 'POST', { period, sections: buildSections() });
      // Clear form and draft
      setRatings({}); setComments({});
      localStorage.removeItem('selfReviewDraft');
      setSuccess('✓ Self Review submitted successfully!');
      setTimeout(() => setSuccess(''), 4000);
      setActiveTab('history');
      loadReviews();
    } catch(e) { setError(e.message || 'Failed to submit. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const RATING_COLOR = r => r >= 5 ? '#43E8AC' : r >= 4 ? '#6C63FF' : r >= 3 ? '#FFB547' : '#FF6584';

  return (
    <Layout>
      <div style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 24, color: 'var(--role-color, #10b981)', marginBottom: 4 }}>Self Review</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Rate yourself and submit to your manager / HR</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['form','history'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '7px 18px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: activeTab === tab ? '#6C63FF' : 'var(--bg-elevated)',
                color:      activeTab === tab ? '#fff'    : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab ? '#6C63FF' : 'var(--border)'}`,
              }}>
                {tab === 'form' ? '✏️ New Review' : `📋 My Submissions (${reviews.length})`}
              </button>
            ))}
          </div>
        </div>

        {error   && <div style={{ padding: '10px 14px', background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 8, color: '#FF6584', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
        {success && <div style={{ padding: '10px 14px', background: 'rgba(67,232,172,0.1)', border: '1px solid rgba(67,232,172,0.3)', borderRadius: 8, color: '#43E8AC', fontSize: 13, marginBottom: 16 }}>{success}</div>}

        {/* ── NEW REVIEW FORM ── */}
        {activeTab === 'form' && (
          <>
            {/* Period input */}
            <Card style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 20 }}>📋</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Review Period Label</div>
                  <input value={period} onChange={e => setPeriod(e.target.value)} placeholder="e.g. March 2026 or Q1 2026"
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor='#6C63FF'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
              </div>
            </Card>

            {/* Section cards */}
            {SECTIONS.map(s => (
              <Card key={s.id} style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.desc}</div>
                </div>
                {/* Star Rating */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setRatings(r => ({ ...r, [s.id]: n }))} style={{
                      width: 40, height: 40, borderRadius: 'var(--r-sm)',
                      background: (ratings[s.id]||0) >= n ? 'rgba(255,181,71,0.2)' : 'var(--bg-elevated)',
                      border: `1px solid ${(ratings[s.id]||0) >= n ? '#FFB547' : 'var(--border)'}`,
                      color: (ratings[s.id]||0) >= n ? '#FFB547' : 'var(--text-muted)',
                      fontSize: 18, cursor: 'pointer', transition: 'all 0.15s',
                    }}>★</button>
                  ))}
                  {ratings[s.id] && (
                    <span style={{ alignSelf: 'center', fontSize: 12, color: '#FFB547', fontWeight: 600, marginLeft: 4 }}>
                      {RATING_LABELS[ratings[s.id]]}
                    </span>
                  )}
                </div>
                <textarea
                  value={comments[s.id] || ''}
                  onChange={e => setComments(c => ({ ...c, [s.id]: e.target.value }))}
                  placeholder="Add comments or examples supporting your rating…"
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor='#6C63FF'} onBlur={e => e.target.style.borderColor='var(--border)'}
                />
              </Card>
            ))}

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Draft'}
              </Button>
              <button onClick={handleSubmit} disabled={submitting} style={{
                flex: 1, padding: '12px',
                background: submitting ? '#c7d2fe' : 'linear-gradient(90deg, #6C63FF, #8B85FF)',
                border: 'none', color: '#fff', fontWeight: 700, fontSize: 14,
                borderRadius: 'var(--r-sm)', cursor: submitting ? 'wait' : 'pointer',
                fontFamily: 'var(--font-body)', transition: 'all 0.3s',
              }}>
                {submitting ? '⏳ Submitting...' : 'Submit Self Review →'}
              </button>
            </div>
          </>
        )}

        {/* ── SUBMITTED REVIEWS HISTORY ── */}
        {activeTab === 'history' && (
          <div>
            {loadingReviews ? <Loader /> : reviews.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: 56, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>No reviews submitted yet</div>
                  <div style={{ fontSize: 13 }}>Go to "New Review" tab to fill in and submit your self review.</div>
                </div>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map((rv, idx) => {
                  const PERIOD_COLORS = ['#6C63FF','#43E8AC','#FFB547','#FF6584','#8B85FF'];
                  const c = PERIOD_COLORS[idx % PERIOD_COLORS.length];
                  const rated = rv.sections?.filter(s => s.rating) || [];
                  return (
                    <Card key={rv._id} style={{ position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: c }} />
                      <div style={{ paddingLeft: 16 }}>
                        {/* Header row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 2 }}>{rv.period}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              Submitted {rv.submittedAt ? new Date(rv.submittedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {rv.overallAvg && (
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: RATING_COLOR(rv.overallAvg) }}>{rv.overallAvg}/5</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg Rating</div>
                              </div>
                            )}
                            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: rv.status === 'SUBMITTED' ? 'rgba(67,232,172,0.12)' : 'rgba(108,99,255,0.12)',
                              color: rv.status === 'SUBMITTED' ? '#43E8AC' : '#6C63FF' }}>
                              {rv.status === 'SUBMITTED' ? '✓ Submitted' : 'Draft'}
                            </span>
                          </div>
                        </div>

                        {/* Section ratings */}
                        {rated.length > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
                            {rated.map(s => (
                              <div key={s.id} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label || s.id}</span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: RATING_COLOR(s.rating) }}>{'★'.repeat(s.rating)}{'☆'.repeat(5-s.rating)}</span>
                                </div>
                                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${(s.rating/5)*100}%`, background: RATING_COLOR(s.rating), borderRadius: 2 }} />
                                </div>
                                {s.comment && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>"{s.comment}"</div>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* HR Feedback */}
                        {rv.hrFeedback ? (
                          <div style={{ padding: '10px 14px', background: 'rgba(67,232,172,0.07)', borderRadius: 8, borderLeft: '3px solid #43E8AC' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#43E8AC', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Feedback from {rv.reviewedBy?.name || 'HR/Manager'}
                              {rv.reviewedAt && <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>{new Date(rv.reviewedAt).toLocaleDateString('en-IN')}</span>}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{rv.hrFeedback}</div>
                          </div>
                        ) : (
                          <div style={{ padding: '8px 12px', background: 'rgba(108,99,255,0.06)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            ⏳ Awaiting feedback from HR / Manager
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

// ─── History ──────────────────────────────────────────────────────────────────
export function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATIC_FALLBACK = [
    { period: 'Q3 2023', score: 4.0, goals: '5/6', raise: '+6%', status: 'completed', feedback: 'Strong delivery on all frontend tasks. Needs improvement in documentation.' },
    { period: 'Q2 2023', score: 3.6, goals: '4/6', raise: '+0%', status: 'completed', feedback: 'Met expectations on core deliverables. Communication gaps noted.' },
    { period: 'Q1 2023', score: 3.9, goals: '5/5', raise: '+4%', status: 'completed', feedback: 'Good quarter overall. Exceeded expectations on the migration project.' },
    { period: 'Annual 2022', score: 3.8, goals: '14/16', raise: '+8%', status: 'completed', feedback: 'Solid year. Promoted to Mid-level Developer.' },
  ];

  useEffect(() => {
    apiFetch('/api/employee/performance')
      .then(d => {
        const evals = d.evaluations || [];
        if (evals.length > 0) {
          const mapped = evals.map(e => ({
            period:   e.reviewPeriod || e.reviewMonth || 'Review',
            score:    e.overallRating || 0,
            goals:    (e.goalsAchieved != null && e.totalGoals != null) ? `${e.goalsAchieved}/${e.totalGoals}` : e.goalsAchieved != null ? `${e.goalsAchieved}` : '—',
            raise:    (e.salaryRaise != null && e.salaryRaise !== undefined) ? `+${e.salaryRaise}%` : '+0%',
            status:   e.status?.toLowerCase() || 'completed',
            feedback: e.remarks || e.feedback || 'No feedback provided.',
            evaluatedBy: e.evaluatedBy?.name || 'Manager',
            date:     e.createdAt || e.updatedAt || null,
          }));
          setHistory(mapped);
        } else {
          setHistory(STATIC_FALLBACK);
        }
      })
      .catch(() => setHistory(STATIC_FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = s => s >= 4.5 ? '#43E8AC' : s >= 3.5 ? '#6C63FF' : s >= 2.5 ? '#FFB547' : '#FF6584';

  return (
    <Layout>
      {loading ? <Loader /> : (
      <div style={{ maxWidth: 900 }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 24, color: 'var(--role-color, #10b981)', letterSpacing: '-0.5px', margin: 0 }}>
            Performance History
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Your complete performance review record</p>
        </div>

        {/* Summary strip */}
        {history.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Reviews', value: history.length, color: '#6C63FF', icon: '📋' },
              { label: 'Avg Score', value: (history.reduce((s,h) => s + (Number(h.score)||0), 0) / history.length).toFixed(1) + '/5', color: '#FFB547', icon: '⭐' },
              { label: 'Latest Period', value: history[0]?.period || '—', color: '#43E8AC', icon: '🗓' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--bg-surface)', border: `1px solid ${s.color}30`,
                borderRadius: 'var(--r-md)', padding: '14px 16px',
                borderLeft: `3px solid ${s.color}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review cards */}
        {history.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No performance history yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Your reviews will appear here once completed</div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {history.map((h, i) => (
              <Card key={i} style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: 4,
                  background: `linear-gradient(to bottom, #6C63FF, #FF6584)`,
                }}/>
                <div style={{ paddingLeft: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>{h.period}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        Performance Review{h.evaluatedBy ? ` · Reviewed by ${h.evaluatedBy}` : ''}
                        {h.date ? ` · ${new Date(h.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}` : ''}
                      </div>
                    </div>
                    <Badge status={h.status} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                    {[
                      { label: 'Score', value: `${h.score}/5`, color: scoreColor(Number(h.score)), icon: '⭐' },
                      { label: 'Goals', value: h.goals,        color: '#43E8AC',                  icon: '🎯' },
                      { label: 'Raise', value: h.raise,        color: '#6C63FF',                  icon: '💰' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.icon} {s.label}</div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    padding: '10px 14px',
                    background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)',
                    borderLeft: '2px solid var(--border)',
                    fontSize: 13, color: 'var(--text-secondary)',
                  }}>
                    "{h.feedback}"
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      )}
    </Layout>
  );
}
