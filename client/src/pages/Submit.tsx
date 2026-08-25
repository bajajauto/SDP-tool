import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSdp } from '../state/SdpContext';
import { GrowthChecklistModal } from '../components/GrowthChecklistModal';
import { useMe } from '../lib/useMe';

export function Submit() {
  const { state, confirmConversation } = useSdp();
  const { me } = useMe();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [convDone, setConvDone] = useState(false);

  if (state.status === 'NOT_STARTED' || state.status === 'DRAFT') {
    return <Navigate to="/goals" replace />;
  }

  const managerName = me?.employee.managerEmployeeId ? 'your manager' : 'your manager';
  const alreadyConfirmed = state.status !== 'SUBMITTED';

  return (
    <div className="screen-inner">
      <div style={{ textAlign: 'center', paddingTop: 20, marginBottom: 36 }}>
        <h1 className="page-title" style={{ fontSize: 36, marginBottom: 12 }}>Your draft plan is submitted</h1>
        <p style={{ fontSize: 15, color: 'var(--mid)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto' }}>
          {state.sharingScope === 'GOALS_ONLY'
            ? 'Your development goals have been shared with your manager for review. Your reflection stays private to you.'
            : 'Your full plan, your reflection and your goals, has been shared with your manager for review.'}
          {' '}This is the beginning, not the end.
        </p>
      </div>

      <div style={{ background: 'var(--blue-d)', borderRadius: 'var(--r)', padding: '24px 28px', marginBottom: 22, display: 'flex', gap: 18 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 6 }}>
            Your next step
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 19, color: '#fff', marginBottom: 8 }}>
            Prepare for a growth conversation with {managerName}
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.72)', lineHeight: 1.7 }}>
            Before your manager can leave feedback, have a real conversation with them about your plan.
            Use the checklist below to prepare.
          </p>
        </div>
      </div>

      <div
        onClick={() => setChecklistOpen(true)}
        style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '24px 28px', marginBottom: 22, boxShadow: 'var(--sh)', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Growth Conversation Checklist</div>
          <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>Open checklist &rarr;</div>
        </div>
        <div style={{ background: 'var(--blue-xl)', borderRadius: 'var(--r-sm)', border: '1px solid var(--blue-l)', padding: '16px 18px', fontSize: 13.5, color: 'var(--mid)', lineHeight: 1.7 }}>
          Use the checklist to prepare. Tick items as you go, and pick up where you left off any time.
        </div>
      </div>

      {!alreadyConfirmed ? (
        <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', padding: '22px 26px', marginBottom: 24, boxShadow: 'var(--sh)' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 5 }}>Ready to unlock manager feedback?</div>
          <p style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 16, lineHeight: 1.65 }}>
            Once you have had the conversation with your manager, check the box below to unlock manager feedback.
          </p>
          <div className="chk-list-item" style={{ marginBottom: 18 }}>
            <div className={`chk-box${convDone ? ' on' : ''}`} onClick={() => setConvDone((d) => !d)} />
            <div className="chk-text" style={{ fontWeight: 500, color: 'var(--ink)' }}>
              I have had my growth conversation with my manager
            </div>
          </div>
          <button
            className="btn btn-primary"
            disabled={!convDone}
            onClick={() => setConfirming(true)}
          >
            Unlock Manager Feedback &rarr;
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--blue-xl)', border: '1px solid var(--blue-l)', borderRadius: 'var(--r)', padding: '18px 22px', marginBottom: 24 }}>
          Growth conversation confirmed on {state.conversationConfirmedAt ? new Date(state.conversationConfirmedAt).toLocaleDateString() : ''}.
          {' '}<Link to="/manager-feedback" style={{ fontWeight: 600 }}>View manager feedback &rarr;</Link>
        </div>
      )}

      {confirming && (
        <div className="overlay open" onClick={() => setConfirming(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setConfirming(false)}>&#10005;</button>
            <h2 style={{ fontSize: 22, marginBottom: 10 }}>Have you had your growth conversation with {managerName}?</h2>
            <p style={{ fontSize: 13.5, color: 'var(--mid)', marginBottom: 20, lineHeight: 1.65 }}>
              This action is not reversible. It unlocks manager feedback and notifies your manager.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setConfirming(false)} style={{ flex: 1, justifyContent: 'center' }}>Not yet</button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { confirmConversation(); setConfirming(false); }}
              >
                Yes, confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <GrowthChecklistModal open={checklistOpen} onClose={() => setChecklistOpen(false)} />
    </div>
  );
}
