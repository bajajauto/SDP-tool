import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSdp, type GoalDraft } from '../state/SdpContext';
import { SaveIndicator } from '../components/SaveIndicator';
import { SampleGoalsModal } from '../components/SampleGoalsModal';
import { ShareScopeModal } from '../components/ShareScopeModal';
import type { GoalDomain, SharingScope } from '@sdp/shared';

const domainLabels: Record<GoalDomain, string> = {
  FUNCTIONAL: 'Functional',
  BEHAVIOURAL: 'Behavioural',
  LEADERSHIP: 'Leadership',
};

function goalSummary(g: GoalDraft): string {
  const parts = [];
  if (g.domain) parts.push(domainLabels[g.domain]);
  if (g.title) parts.push(g.title);
  return parts.join(' · ');
}

export function Goals() {
  const { state, addGoal, updateGoal, removeGoal, submitPlan, lastSavedAt } = useSdp();
  const navigate = useNavigate();
  const [openGoalId, setOpenGoalId] = useState<string | null>(state.goals[0]?.id ?? null);
  const [sampleDomain, setSampleDomain] = useState<GoalDomain | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<string | null>('domain-guide');
  const previousGoalCount = useRef(state.goals.length);
  const submitted = state.status !== 'NOT_STARTED' && state.status !== 'DRAFT';

  useEffect(() => {
    if (state.goals.length > previousGoalCount.current) {
      setOpenGoalId(state.goals.at(-1)?.id ?? null);
    }
    previousGoalCount.current = state.goals.length;
  }, [state.goals]);

  function handleAdd() {
    if (state.goals.length >= 3) return;
    addGoal();
  }

  function handleRemove(id: string) {
    if (!confirm('Remove this development goal?')) return;
    removeGoal(id);
    if (openGoalId === id) setOpenGoalId(null);
  }

  function handleSubmitClick() {
    if (state.goals.length === 0) {
      setError('Please add at least one development goal before submitting.');
      return;
    }
    const incomplete = state.goals.find(
      (g) => !g.title || !g.domain || !g.whyItMatters || !g.grownWhen || !g.actionDo || !g.actionLearn || !g.actionConnect || !g.supportNeeded,
    );
    if (incomplete) {
      setError('Please complete every field for each goal before submitting.');
      setOpenGoalId(incomplete.id);
      return;
    }
    setError(null);
    setShareOpen(true);
  }

  function handleConfirmShare(scope: SharingScope) {
    submitPlan(scope);
    setShareOpen(false);
    navigate('/submit');
  }

  return (
    <div className="screen-inner wide">
      <div className="pillar-tag" style={{ background: 'var(--blue)', color: '#fff', marginBottom: 10 }}>Capability</div>
      <h1 className="page-title">My Development Goals</h1>
      <p className="page-sub" style={{ marginBottom: 8 }}>Set one to three goals that genuinely connect to your reflection.</p>
      <p className="goals-helper">Make each goal specific, observable and supported by a practical action plan.</p>

      <div className="goals-layout">
        <div>
          {state.goals.map((g, idx) => (
            <div className={`dgoal-card-v3${openGoalId === g.id ? ' expanded' : ''}`} key={g.id}>
              <div className="goal-head" onClick={() => setOpenGoalId(openGoalId === g.id ? null : g.id)}>
                <div className="goal-head-left">
                  <div className="goal-num">Development Goal 0{idx + 1}</div>
                  {goalSummary(g) && <div className="goal-sum">{goalSummary(g)}</div>}
                </div>
                <div className="goal-head-right">
                  <button className="dgoal-del" disabled={submitted} onClick={(e) => { e.stopPropagation(); handleRemove(g.id); }}>Remove</button>
                  <span className="goal-chev">&#9660;</span>
                </div>
              </div>
              {openGoalId === g.id && (
                <div className="goal-body">
                  <div className="goal-setup-grid">
                    <div>
                    <span className="goal-field-label">Goal Domain</span>
                    <select
                      className="goal-type-select"
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
                    <div>
                    <span className="goal-field-label">Goal title</span>
                    <input
                      className="g-input"
                      placeholder="Give this goal a clear, specific title..."
                      value={g.title}
                      disabled={submitted}
                      onChange={(e) => updateGoal(g.id, { title: e.target.value })}
                    />
                    </div>
                  </div>

                  <GoalSection label="Why this matters to me" hint="Connect this goal to a real need, challenge or aspiration.">
                    <textarea className="goal-section-input" rows={3} placeholder="Why is this goal important to your growth?" value={g.whyItMatters} disabled={submitted} onChange={(e) => updateGoal(g.id, { whyItMatters: e.target.value })} />
                  </GoalSection>
                  <GoalSection label="I will know I have grown when" hint="Describe the visible change or outcome you will be able to notice.">
                    <textarea className="goal-section-input" rows={3} placeholder="What will you do differently or more consistently?" value={g.grownWhen} disabled={submitted} onChange={(e) => updateGoal(g.id, { grownWhen: e.target.value })} />
                  </GoalSection>
                  <GoalSection label="Action plan: Do" badge="70%" hint="Build capability through practical experience in your day-to-day work.">
                    <textarea className="goal-section-input" rows={3} placeholder="What will you practise, own or deliver at work?" value={g.actionDo} disabled={submitted} onChange={(e) => updateGoal(g.id, { actionDo: e.target.value })} />
                  </GoalSection>
                  <GoalSection label="Action plan: Learn" badge="10%" hint="Use structured learning to gain knowledge, tools or perspective.">
                    <textarea className="goal-section-input" rows={3} placeholder="What course, resource or experience will help you learn?" value={g.actionLearn} disabled={submitted} onChange={(e) => updateGoal(g.id, { actionLearn: e.target.value })} />
                  </GoalSection>
                  <GoalSection label="Action plan: Connect" badge="20%" hint="Learn with and from people who can stretch your thinking.">
                    <textarea className="goal-section-input" rows={3} placeholder="Who will you seek feedback, coaching or exposure from?" value={g.actionConnect} disabled={submitted} onChange={(e) => updateGoal(g.id, { actionConnect: e.target.value })} />
                  </GoalSection>
                  <GoalSection label="Support I need" hint="Be clear about what your manager or organisation can do to help.">
                    <textarea className="goal-section-input" rows={3} placeholder="What support, access, time or feedback will you need?" value={g.supportNeeded} disabled={submitted} onChange={(e) => updateGoal(g.id, { supportNeeded: e.target.value })} />
                  </GoalSection>
                </div>
              )}
            </div>
          ))}
          {!submitted && (
            <button className="add-dgoal" disabled={state.goals.length >= 3} onClick={handleAdd}>
              <span className="add-dgoal-icon">+</span>
              <span>
                <strong>Add another development goal</strong>
                <small>{state.goals.length >= 3 ? 'Maximum of 3 goals reached' : `${3 - state.goals.length} goal${3 - state.goals.length === 1 ? '' : 's'} remaining`}</small>
              </span>
            </button>
          )}
          {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 10 }}>{error}</div>}
        </div>

        <aside className="goals-aside">
          <Panel title="Goal domain guide" id="domain-guide" expanded={expandedPanel === 'domain-guide'} onToggle={setExpandedPanel}>
            <DomainRow bg="#EBF2FA" color="#1E5FBA" label="Functional" desc="What you want to know or do better" />
            <DomainRow bg="#DBE7F6" color="#0E3F87" label="Behavioural" desc="How you want to show up differently" />
            <DomainRow bg="#C5D5F0" color="#0E3F87" label="Leadership" desc="How you grow the people around you" />
          </Panel>

          <Panel title="Sample goals for goal setting" id="sample-goals" expanded={expandedPanel === 'sample-goals'} onToggle={setExpandedPanel}>
            <div style={{ padding: '11px 12px 12px' }}>
              <SampleBtn bg="#EBF2FA" border="#C5D5F0" color="#1E5FBA" label="Functional" onClick={() => setSampleDomain('FUNCTIONAL')} />
              <SampleBtn bg="#DBE7F6" border="#A6BFE5" color="#0E3F87" label="Behavioural" onClick={() => setSampleDomain('BEHAVIOURAL')} />
              <SampleBtn bg="#C5D5F0" border="#A6BFE5" color="#0E3F87" label="Leadership" onClick={() => setSampleDomain('LEADERSHIP')} last />
            </div>
          </Panel>
        </aside>
      </div>

      <div className="nav-row">
        <button className="btn btn-ghost" onClick={() => navigate('/vision')}>&larr; Back to Reflection</button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SaveIndicator lastSavedAt={lastSavedAt} />
          {!submitted && <button className="btn btn-primary" onClick={handleSubmitClick}>Submit plan &rarr;</button>}
        </div>
      </div>

      <SampleGoalsModal domain={sampleDomain} onClose={() => setSampleDomain(null)} />
      <ShareScopeModal open={shareOpen} onClose={() => setShareOpen(false)} onConfirm={handleConfirmShare} />
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

function Panel({ title, id, expanded, onToggle, children }: { title: string; id: string; expanded: boolean; onToggle: (id: string | null) => void; children: ReactNode }) {
  return (
    <div className={`rp-panel${expanded ? ' expanded' : ''}`}>
      <div className="rp-head" onClick={() => onToggle(expanded ? null : id)}>
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

function SampleBtn({ bg, border, color, label, onClick, last }: { bg: string; border: string; color: string; label: string; onClick: () => void; last?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: bg, border: `1px solid ${border}`, borderRadius: 'var(--r-sm)', padding: '10px 12px', cursor: 'pointer', marginBottom: last ? 0 : 8 }}
    >
      <span style={{ fontSize: 12.5, fontWeight: 600, color }}>{label}</span>
      <span style={{ fontSize: 11, color, fontWeight: 600 }}>View &rarr;</span>
    </button>
  );
}
