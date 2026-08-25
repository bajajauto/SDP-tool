import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSdp } from '../state/SdpContext';

const waitingNotes = [
  'Good feedback takes a little thought. Your manager is reading the plan behind the goals, not just the words on the page.',
  'While you wait, notice one small action you can begin today. Growth does not need to wait for a notification.',
  'No need to refresh every thirty seconds. We promise the feedback will still find you.',
  'Your plan is with your manager now. Take a breath—you have already done the brave part: writing honestly.',
];

export function ManagerFeedback() {
  const { state } = useSdp();
  const navigate = useNavigate();
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  if (!state.conversationConfirmedAt) {
    return <Navigate to="/growth-conversation" replace />;
  }

  return (
    <div className="screen-inner" style={{ paddingTop: 22, paddingBottom: 28 }}>
      <h1 className="page-title">Your plan is in thoughtful hands</h1>
      <p className="page-sub" style={{ marginBottom: 16 }}>
        Your manager is reviewing your SDP as a coach, not as an evaluator. Feedback will appear here when it is ready.
      </p>

      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 20, boxShadow: 'var(--sh-md)', overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ background: 'var(--blue-d)', color: '#fff', padding: '20px 28px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, margin: '0 auto 10px', borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23 }} aria-hidden="true">&#128172;</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 5 }}>Awaiting your manager's feedback</div>
          <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 13.5, lineHeight: 1.65 }}>Your manager has been notified. There is nothing else you need to submit right now.</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 10, padding: '6px 11px', borderRadius: 20, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.82)', fontSize: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#8ee3b0', boxShadow: '0 0 0 4px rgba(142,227,176,.14)' }} /> Review in progress
          </div>
        </div>

        <div style={{ padding: '18px 26px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 8 }}>A thought while you wait</div>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.55, marginBottom: 12 }}>&ldquo;{waitingNotes[0]}&rdquo;</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setCheckedAt(new Date())}>Check feedback status</button>
          </div>
          {checkedAt && <div role="status" style={{ marginTop: 10, padding: '9px 12px', borderRadius: 'var(--r-sm)', background: 'var(--blue-xl)', color: 'var(--blue)', fontSize: 12.5 }}>Still being thoughtfully reviewed. Last checked at {checkedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</div>}
        </div>
      </div>

      <div className="nav-row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/goals')}>View my plan</button>
      </div>
    </div>
  );
}
