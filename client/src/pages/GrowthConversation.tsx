import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { growthChecklist } from '../content/toolkit';
import { useSdp } from '../state/SdpContext';

export function GrowthConversation() {
  const { state, toggleChecklistItem, resetChecklist, confirmConversation } = useSdp();
  const [convDone, setConvDone] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const items = growthChecklist.flatMap((section) => section.items);
  const doneCount = items.filter((item) => state.checklist[item.id]).length;
  const checklistComplete = doneCount === items.length;

  if (state.status === 'NOT_STARTED' || state.status === 'DRAFT') return <Navigate to="/submit" replace />;

  return <div className="screen-inner growth-conversation-page">
    <h1 className="page-title">Prepare for a growth conversation with your manager</h1>
    <p className="page-sub">Before your manager can leave feedback, have a real conversation with them about your plan. Use the checklist below to prepare.</p>

    <section className="growth-checklist-card">
      <div className="growth-checklist-heading">
        <div><h2>Growth Conversation Checklist</h2><p>Use this checklist to prepare for your growth conversation. Tick items as you go, and pick up where you left off any time.</p></div>
        <span>{doneCount} of {items.length} complete</span>
      </div>
      {growthChecklist.map((section) => <div key={section.heading} className="growth-checklist-section">
        <h3>{section.heading}</h3>
        {section.items.map((item) => {
          const checked = !!state.checklist[item.id];
          return <button type="button" key={item.id} className={`gcl-item${checked ? ' checked' : ''}`} onClick={() => toggleChecklistItem(item.id)} aria-pressed={checked}>
            <span className="gcl-box" aria-hidden="true">{checked ? '✓' : ''}</span><span className="gcl-text">{item.text}</span>
          </button>;
        })}
      </div>)}
      <div className="gcl-meta"><strong>{doneCount} of {items.length} complete</strong><button type="button" className="gcl-reset" onClick={resetChecklist}>Reset checklist</button></div>
    </section>

    {!state.conversationConfirmedAt ? <section className="conversation-unlock-card">
      <h2>Ready to unlock manager feedback?</h2>
      <p>Once you have had the conversation with your manager, check the box below to unlock manager feedback.</p>
      <button type="button" className={`conversation-confirm-check${convDone ? ' checked' : ''}`} disabled={!checklistComplete} onClick={() => setConvDone(!convDone)}>
        <span className="chk-box">{convDone ? '✓' : ''}</span><span>I have had my growth conversation with my manager</span>
      </button>
      {!checklistComplete && <div className="conversation-gate-note">Complete all checklist items before confirming your growth conversation.</div>}
      <button type="button" className="btn btn-primary" disabled={!checklistComplete || !convDone} onClick={() => setConfirming(true)}>Unlock Manager Feedback &rarr;</button>
    </section> : <div className="conversation-confirmed">Growth conversation confirmed on {new Date(state.conversationConfirmedAt).toLocaleDateString()}. <Link to="/manager-feedback">View manager feedback &rarr;</Link></div>}

    {confirming && <div className="overlay open" onClick={() => setConfirming(false)}><div className="modal" style={{ maxWidth: 440 }} onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={() => setConfirming(false)}>&#10005;</button>
      <h2 style={{ fontSize: 22, marginBottom: 10 }}>Have you had your growth conversation with your manager?</h2>
      <p style={{ fontSize: 13.5, color: 'var(--mid)', marginBottom: 20, lineHeight: 1.65 }}>This action is not reversible. It unlocks manager feedback and notifies your manager.</p>
      <div style={{ display: 'flex', gap: 10 }}><button className="btn btn-secondary" onClick={() => setConfirming(false)} style={{ flex: 1, justifyContent: 'center' }}>Not yet</button><button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { confirmConversation(); setConfirming(false); }}>Yes, confirm</button></div>
    </div></div>}
  </div>;
}
