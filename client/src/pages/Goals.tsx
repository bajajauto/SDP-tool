import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSdp, type GoalDraft } from '../state/SdpContext';
import { SaveIndicator } from '../components/SaveIndicator';
import { SampleGoalsModal } from '../components/SampleGoalsModal';
import { ShareScopeModal } from '../components/ShareScopeModal';
import { Modal } from '../components/Modal';
import type { GoalDomain, SharingScope } from '@sdp/shared';

const domainLabels: Record<GoalDomain, string> = {
  FUNCTIONAL: 'Functional',
  BEHAVIOURAL: 'Behavioural',
  LEADERSHIP: 'Leadership',
};
const MIN_GOALS = 2;
const MAX_GOALS = 3;

function goalSummary(g: GoalDraft): string {
  const parts = [];
  if (g.domain) parts.push(domainLabels[g.domain]);
  if (g.title) parts.push(g.title);
  return parts.join(' · ');
}

function isGoalComplete(g: GoalDraft): boolean {
  return Boolean(g.title && g.domain && g.whyItMatters && g.grownWhen
    && g.actionDo && g.actionLearn && g.actionConnect && g.supportNeeded);
}

export function Goals() {
  const { state, addGoal, updateGoal, removeGoal, submitPlan, lastSavedAt, saveStatus, loading } = useSdp();
  const navigate = useNavigate();
  const [openGoalId, setOpenGoalId] = useState<string | null>(state.goals[0]?.id ?? null);
  const [sampleDomain, setSampleDomain] = useState<GoalDomain | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['domain-guide', 'sample-goals', 'action-templates']);
  const previousGoalCount = useRef(state.goals.length);
  const submitted = state.status !== 'NOT_STARTED' && state.status !== 'DRAFT';

  function togglePanel(id: string) {
    setExpandedPanels((current) => current.includes(id) ? current.filter((panel) => panel !== id) : [...current, id]);
  }

  useEffect(() => {
    if (state.goals.length > previousGoalCount.current) {
      setOpenGoalId(state.goals.at(-1)?.id ?? null);
    }
    previousGoalCount.current = state.goals.length;
  }, [state.goals]);

  useEffect(() => {
    // Keep one editable card available, but enforce the two-goal minimum
    // only at submission time so employees can freely add and remove drafts.
    if (!loading && !submitted && state.goals.length === 0) addGoal();
  }, [loading, state.goals.length, submitted, addGoal]);

  function handleAdd() {
    if (state.goals.length >= MAX_GOALS) return;
    addGoal();
  }

  function handleRemove(id: string) {
    if (!confirm('Remove this development goal?')) return;
    removeGoal(id);
    if (openGoalId === id) setOpenGoalId(null);
  }

  function handleSubmitClick() {
    setValidationAttempted(true);
    if (saveStatus === 'saving') {
      setError('Please wait for your latest changes to finish saving, then submit again.');
      return;
    }
    if (state.goals.length < MIN_GOALS) {
      setError(`Please add at least ${MIN_GOALS} development goals before submitting.`);
      return;
    }
    const incompleteGoals = state.goals.filter((goal) => !isGoalComplete(goal));
    const incomplete = incompleteGoals[0];
    if (incomplete) {
      const numbers = incompleteGoals.map((goal) => state.goals.indexOf(goal) + 1).join(', ');
      setError(`Goal${incompleteGoals.length > 1 ? 's' : ''} ${numbers} ${incompleteGoals.length > 1 ? 'are' : 'is'} incomplete. Complete the highlighted fields or remove the extra goal card before submitting.`);
      setOpenGoalId(incomplete.id);
      window.setTimeout(() => document.getElementById(`goal-${incomplete.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
      return;
    }
    setError(null);
    setShareOpen(true);
  }

  async function handleConfirmShare(scope: SharingScope) {
    try {
      await submitPlan(scope);
      setShareOpen(false);
      navigate('/submit');
    } catch {
      setShareOpen(false);
      setError('Could not submit your plan. Please check your connection and try again.');
    }
  }

  return (
    <div className="screen-inner wide">
      <h1 className="page-title">My Development Goals</h1>
      <div className="goals-title-row">
        <p className="page-sub">Set 2-3 goals that genuinely connect to your reflection.</p>
        <button type="button" className="review-before-btn" onClick={() => setReviewOpen(true)}>&#9432; Review before deciding</button>
      </div>
      {submitted && <div className="deadline-lock" role="status"><span aria-hidden="true">&#128274;</span><div><strong>Submission deadline has passed</strong><p>Your submitted goals are now locked and cannot be edited or removed.</p></div></div>}

      <div className="goals-layout">
        <div>
          {state.goals.map((g, idx) => (
            <div id={`goal-${g.id}`} className={`dgoal-card-v3${openGoalId === g.id ? ' expanded' : ''}${validationAttempted && !isGoalComplete(g) ? ' has-errors' : ''}`} key={g.id}>
              <div className="goal-head" onClick={() => setOpenGoalId(openGoalId === g.id ? null : g.id)}>
                <div className="goal-head-left">
                  <div className="goal-num">Development Goal 0{idx + 1}</div>
                  {goalSummary(g) && <div className="goal-sum">{goalSummary(g)}</div>}
                </div>
                <div className="goal-head-right">
                  {validationAttempted && !isGoalComplete(g) && <span className="goal-needs-attention">Needs attention</span>}
                  {isGoalComplete(g) && <span className={`goal-save-tag ${saveStatus}`}>
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'error' ? 'Not saved' : <>&#10003; Saved</>}
                  </span>}
                  <button type="button" className="dgoal-del" disabled={submitted} title={submitted ? 'Goals cannot be removed after submission' : 'Remove goal'} onClick={(e) => { e.stopPropagation(); handleRemove(g.id); }}>
                    <span aria-hidden="true">&#128465;</span> {submitted ? 'Locked' : 'Remove'}
                  </button>
                  <span className="goal-chev">&#9660;</span>
                </div>
              </div>
              {openGoalId === g.id && (
                <div className="goal-body">
                  <div style={{ marginBottom: 14 }}>
                    <span className="goal-field-label">Goal Domain</span>
                    <select
                      className={`goal-type-select${validationAttempted && !g.domain ? ' field-invalid' : ''}`}
                      value={g.domain}
                      disabled={submitted}
                      onChange={(e) => updateGoal(g.id, { domain: e.target.value as GoalDomain })}
                    >
                      <option value="">Select...</option>
                      <option value="FUNCTIONAL">Functional</option>
                      <option value="BEHAVIOURAL">Behavioural</option>
                      <option value="LEADERSHIP">Leadership</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <span className="goal-field-label">What I want to build</span>
                    <input
                      className={`g-input${validationAttempted && !g.title.trim() ? ' field-invalid' : ''}`}
                      style={{ fontSize: 16, padding: '10px 0', fontFamily: 'var(--serif)' }}
                      placeholder="Give this goal a clear, specific title..."
                      value={g.title}
                      disabled={submitted}
                      onChange={(e) => updateGoal(g.id, { title: e.target.value })}
                    />
                  </div>

                  <div className="goal-field-row">
                    <div className="goal-field-col"><span className="goal-field-label">Why does this matter to me?</span><textarea className={`q-input${validationAttempted && !g.whyItMatters.trim() ? ' field-invalid' : ''}`} rows={3} placeholder="In your own words, connected to your reflection." value={g.whyItMatters} disabled={submitted} onChange={(e) => updateGoal(g.id, { whyItMatters: e.target.value })} /></div>
                    <div className="goal-field-col"><span className="goal-field-label">I will know I have grown when...</span><textarea className={`q-input${validationAttempted && !g.grownWhen.trim() ? ' field-invalid' : ''}`} rows={3} placeholder="A behaviour or moment, not a number." value={g.grownWhen} disabled={submitted} onChange={(e) => updateGoal(g.id, { grownWhen: e.target.value })} /></div>
                  </div>

                  <div className="action-plan-inline">
                    <div className="action-plan-title">Action Plan</div>
                    <div className="action-plan-row">
                      <span className="dlc-label dlc-do">Do · 70%</span>
                      <textarea className={validationAttempted && !g.actionDo.trim() ? 'field-invalid' : ''} rows={2} placeholder="What will I practise, own, or deliver at work?" value={g.actionDo} disabled={submitted} onChange={(e) => updateGoal(g.id, { actionDo: e.target.value })} />
                    </div>
                    <div className="action-plan-row">
                      <span className="dlc-label dlc-learn">Learn · 10%</span>
                      <textarea className={validationAttempted && !g.actionLearn.trim() ? 'field-invalid' : ''} rows={2} placeholder="What will I read, study, or complete?" value={g.actionLearn} disabled={submitted} onChange={(e) => updateGoal(g.id, { actionLearn: e.target.value })} />
                    </div>
                    <div className="action-plan-row">
                      <span className="dlc-label dlc-connect">Connect · 20%</span>
                      <textarea className={validationAttempted && !g.actionConnect.trim() ? 'field-invalid' : ''} rows={2} placeholder="Who will I observe, learn from, or ask for feedback?" value={g.actionConnect} disabled={submitted} onChange={(e) => updateGoal(g.id, { actionConnect: e.target.value })} />
                    </div>
                    <div className="support-field"><label>Support I need</label><textarea className={validationAttempted && !g.supportNeeded.trim() ? 'field-invalid' : ''} rows={2} placeholder="What do you need from your manager or the organisation? Be specific." value={g.supportNeeded} disabled={submitted} onChange={(e) => updateGoal(g.id, { supportNeeded: e.target.value })} /></div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!submitted && (
            <button className="add-dgoal" disabled={state.goals.length >= MAX_GOALS} onClick={handleAdd}>
              <span className="add-dgoal-icon">+</span>
              <span>
                <strong>Add another development goal</strong>
                <small>{state.goals.length >= MAX_GOALS ? 'Maximum of 3 goals reached' : `${MAX_GOALS - state.goals.length} goal${MAX_GOALS - state.goals.length === 1 ? '' : 's'} remaining`}</small>
              </span>
            </button>
          )}
          {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 10 }}>{error}</div>}
        </div>

        <aside className="goals-aside">
          <Panel title="Goal domain guide" id="domain-guide" expanded={expandedPanels.includes('domain-guide')} onToggle={togglePanel}>
            <DomainRow bg="#EBF2FA" color="#1E5FBA" label="Functional" desc="What you want to know or do better" />
            <DomainRow bg="#DBE7F6" color="#0E3F87" label="Behavioural" desc="How you want to show up differently" />
            <DomainRow bg="#C5D5F0" color="#0E3F87" label="Leadership" desc="How you grow the people around you" />
          </Panel>

          <Panel title="Sample goals for goal setting" id="sample-goals" expanded={expandedPanels.includes('sample-goals')} onToggle={togglePanel}>
            <div style={{ padding: '11px 12px 12px' }}>
              <SampleBtn icon="⌁" bg="#EBF2FA" border="#C5D5F0" color="#1E5FBA" label="Functional" onClick={() => setSampleDomain('FUNCTIONAL')} />
              <SampleBtn icon="◇" bg="#DBE7F6" border="#A6BFE5" color="#0E3F87" label="Behavioural" onClick={() => setSampleDomain('BEHAVIOURAL')} />
              <SampleBtn icon="♟" bg="#C5D5F0" border="#A6BFE5" color="#0E3F87" label="Leadership" onClick={() => setSampleDomain('LEADERSHIP')} last />
            </div>
          </Panel>

          <Panel title="Action plan templates" id="action-templates" expanded={expandedPanels.includes('action-templates')} onToggle={togglePanel}>
            <ActionTemplateRow icon="▮" title="Functional Goal" body="Do: practise in real work and own something end to end. Learn: complete one targeted course. Connect: shadow an expert and ask for feedback." />
            <ActionTemplateRow icon="▧" title="Behavioural Goal" body="Choose a recurring situation, practise deliberately in that moment, and ask for specific feedback afterwards." />
            <ActionTemplateRow icon="◎" title="Leadership Goal" body="Own an outcome through people, delegate meaningful work, coach someone, and reflect after key moments." />
          </Panel>
        </aside>
      </div>

      <div className="nav-row">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SaveIndicator lastSavedAt={lastSavedAt} saveStatus={saveStatus} />
          {!submitted && <button className="btn btn-primary" disabled={saveStatus === 'saving'} onClick={handleSubmitClick}>{saveStatus === 'saving' ? 'Saving changes...' : 'Submit plan →'}</button>}
        </div>
      </div>

      <SampleGoalsModal domain={sampleDomain} onClose={() => setSampleDomain(null)} />
      <ShareScopeModal open={shareOpen} onClose={() => setShareOpen(false)} onConfirm={handleConfirmShare} />
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth={520}>
        <div className="q-num">Review before deciding</div>
        <h2 style={{ margin: '10px 0 12px' }}>What is your reflection pointing towards?</h2>
        <p style={{ color: 'var(--mid)', lineHeight: 1.7 }}>Look back at the patterns in your reflection. Choose goals that matter to you, describe a visible change, and keep the action plan practical enough to begin.</p>
        <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18 }} onClick={() => setReviewOpen(false)}>Continue to my goals</button>
      </Modal>
    </div>
  );
}

function GoalSection({ label, hint, badge, children }: { label: string; hint: string; badge?: string; children: ReactNode }) {
  return (
    <section className="goal-section">
      <div className="goal-section-heading">
        <div>
          <label className="goal-section-label">{label}</label>
          <p className="goal-section-hint">{hint}</p>
        </div>
        {badge && <span className="goal-section-badge">{badge}</span>}
      </div>
      {children}
    </section>
  );
}

function Panel({ title, id, expanded, onToggle, children }: { title: string; id: string; expanded: boolean; onToggle: (id: string) => void; children: ReactNode }) {
  return (
    <div className={`rp-panel${expanded ? ' expanded' : ''}`}>
      <div className="rp-head" onClick={() => onToggle(id)}>
        <div>{title}</div>
        <span className="rp-chev">&#9660;</span>
      </div>
      <div className="rp-body">{children}</div>
    </div>
  );
}

function DomainRow({ bg, color, label, desc }: { bg: string; color: string; label: string; desc: string }) {
  return (
    <div style={{ padding: '11px 14px', background: bg, borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--mid)', lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function SampleBtn({ icon, bg, border, color, label, onClick, last }: { icon: string; bg: string; border: string; color: string; label: string; onClick: () => void; last?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: bg, border: `1px solid ${border}`, borderRadius: 'var(--r-sm)', padding: '10px 12px', cursor: 'pointer', marginBottom: last ? 0 : 8 }}
    >
      <span style={{ fontSize: 12.5, fontWeight: 600, color }}><span aria-hidden="true" style={{ marginRight: 5 }}>{icon}</span>{label}</span>
      <span style={{ fontSize: 11, color, fontWeight: 600 }}>View &rarr;</span>
    </button>
  );
}

function ActionTemplateRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return <div className={`action-template-row${open ? ' open' : ''}`}>
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}><span><i aria-hidden="true">{icon}</i>{title}</span><b aria-hidden="true">&#9656;</b></button>
    {open && <div>{body}</div>}
  </div>;
}
