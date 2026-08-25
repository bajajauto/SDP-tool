import { Link, Navigate } from 'react-router-dom';
import { useSdp } from '../state/SdpContext';

export function Submit() {
  const { state } = useSdp();

  if (state.status === 'NOT_STARTED' || state.status === 'DRAFT') return <Navigate to="/goals" replace />;

  return <div className="screen-inner">
    <div style={{ textAlign: 'center', paddingTop: 20, marginBottom: 36 }}>
      <div className="pillar-tag" style={{ background: 'var(--green-l)', color: 'var(--green)' }}>Plan submitted</div>
      <h1 className="page-title" style={{ fontSize: 36, marginBottom: 12 }}>Your draft plan is submitted</h1>
      <p style={{ fontSize: 15, color: 'var(--mid)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto' }}>
        {state.sharingScope === 'GOALS_ONLY'
          ? 'Your development goals have been shared with your manager for review. Your reflection stays private to you.'
          : 'Your full plan, your reflection and your goals, has been shared with your manager for review.'}
        {' '}This is the beginning, not the end.
      </p>
    </div>
    <div className="submit-next-step">
      <div><span>Next section</span><h2>Prepare for your growth conversation</h2><p>Use the preparation checklist, then confirm once you have spoken with your manager.</p></div>
      <Link className="btn btn-primary" to="/growth-conversation">Continue &rarr;</Link>
    </div>
  </div>;
}
