import { useState } from 'react';
import { useSdp } from '../state/SdpContext';
import type { CheckInPeriod, CheckInStatus, GoalDomain } from '@sdp/shared';
import { SubmissionNotice } from '../components/SubmissionNotice';

type Tab = 'goals' | 'Q1' | 'MID_YEAR' | 'Q2' | 'YEAR_END';

const periodLabels: Record<CheckInPeriod, string> = {
  Q1: 'Quarterly Check-in 1',
  MID_YEAR: 'Mid-Year Conversation',
  Q2: 'Quarterly Check-in 2',
  YEAR_END: 'Year-End Conversation',
};
const periodGuidance: Record<CheckInPeriod, string> = {
  Q1: 'Capture your early progress, what you have tried, and what you want to focus on next. This update should take only a few minutes.',
  MID_YEAR: 'Take a deeper look at your progress so far. Reflect on what is working, what is not, and what you want to adjust for the rest of the year.',
  Q2: 'Record the progress you have made since mid-year and the actions that will help you maintain momentum.',
  YEAR_END: 'Reflect on the full year: what you built, what changed, and what you want to carry into your next development plan.',
};

const statusOptions: CheckInStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'ON_TRACK', 'AT_RISK', 'ACHIEVED'];
const domainLabels: Record<GoalDomain, string> = { FUNCTIONAL: 'Functional', BEHAVIOURAL: 'Behavioural', LEADERSHIP: 'Leadership' };

export function Dashboard() {
  const { state, submitCheckIn, setCheckInDate } = useSdp();
  const [tab, setTab] = useState<Tab>('goals');

  function hasAnyCheckIn(period: CheckInPeriod): boolean {
    return state.goals.some((g) => !!state.checkIns[`${g.id}:${period}`]);
  }

  function isCheckInComplete(period: CheckInPeriod): boolean {
    return state.goals.length > 0 && state.goals.every((goal) => !!state.checkIns[`${goal.id}:${period}`]);
  }

  const timeline = [
    { label: 'Publish SDP', done: state.status !== 'NOT_STARTED' && state.status !== 'DRAFT', marker: 'S' },
    { label: 'Quarterly Check-in 1', done: hasAnyCheckIn('Q1'), marker: '1' },
    { label: 'Mid-Year Conversation', done: hasAnyCheckIn('MID_YEAR'), marker: 'M' },
    { label: 'Quarterly Check-in 2', done: hasAnyCheckIn('Q2'), marker: '2' },
    { label: 'Year-End Conversation', done: hasAnyCheckIn('YEAR_END'), marker: 'E' },
  ];
  const currentTimelineIndex = timeline.findIndex((item) => !item.done);

  return (
    <div className="screen-inner wide dashboard-screen">
      <h1 className="page-title">My Growth Tracker</h1>
      <p className="page-sub" style={{ marginBottom: 24 }}>Track your progress through the year. Each update takes a few minutes. Write for yourself, not for the system.</p>

      <div className="dash-timeline">
        <div className="dash-tl-label">Check-in timeline</div>
        <div className="tl-track">
          {timeline.map((item, index) => {
            const isCurrent = index === currentTimelineIndex;
            return (
              <div className="tl-step" key={item.label}>
                <div className={`tl-dot ${item.done ? 'done' : isCurrent ? 'now' : 'future'}`}>
                  {item.done ? '✓' : isCurrent ? '→' : item.marker}
                </div>
                <div className="tl-step-label" style={isCurrent ? { color: 'var(--blue)', fontWeight: 600 } : undefined}>{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dash-tab-bar">
        <button className={`dash-tab${tab === 'goals' ? ' on' : ''}`} onClick={() => setTab('goals')}>Track My Goals</button>
        {(['Q1', 'MID_YEAR', 'Q2', 'YEAR_END'] as CheckInPeriod[]).map((p) => {
          const complete = isCheckInComplete(p);
          return <button key={p} className={`dash-tab${tab === p ? ' on' : ''}${complete ? ' completed' : ''}`} onClick={() => setTab(p)}>{complete && <span className="dash-tab-check" aria-hidden="true">&#10003;</span>}{periodLabels[p]}</button>;
        })}
      </div>

      {tab === 'goals' && (
        <div>
          {state.goals.length > 0 && <div className="tracker-goal-count">Tracking all {state.goals.length} development goal{state.goals.length === 1 ? '' : 's'}</div>}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', boxShadow: 'var(--sh)' }}>
            <table className="track-grid">
              <thead>
                <tr>
                  <th>Goal</th>
                  <th className="cen">Quarterly Check-in 1</th>
                  <th className="cen">Mid-Year</th>
                  <th className="cen">Quarterly Check-in 2</th>
                  <th className="cen">Year-End</th>
                </tr>
              </thead>
              <tbody>
                {state.goals.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontStyle: 'italic' }}>Set development goals first to start tracking.</td></tr>
                )}
                {state.goals.map((g, goalIndex) => (
                  <tr key={`${g.id}-${goalIndex}`}>
                    <td>
                      <div className="tg-number">Development Goal {goalIndex + 1}</div>
                      <div className="tg-goal">{g.title || 'Untitled goal'}</div>
                      {g.domain && <div className="tg-domain">{domainLabels[g.domain]}</div>}
                    </td>
                    {(['Q1', 'MID_YEAR', 'Q2', 'YEAR_END'] as CheckInPeriod[]).map((p) => {
                      const ci = state.checkIns[`${g.id}:${p}`];
                      return (
                        <td className="cen" key={p}>
                          <div className="tg-cell-wrap">
                            <span className={`tg-box${ci ? ' on' : ''}`}>{ci ? '✓' : ''}</span>
                            {ci?.submittedAt && <div className="tg-date">{new Date(ci.submittedAt).toLocaleDateString()}</div>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(['Q1', 'MID_YEAR', 'Q2', 'YEAR_END'] as CheckInPeriod[]).map((p) =>
        tab === p ? (
          <CheckInPanel
            key={p}
            period={p}
            goals={state.goals}
            date={state.checkInDates[p]}
            onDateChange={(d) => setCheckInDate(p, d)}
            onSubmit={submitCheckIn}
            existing={state.checkIns}
            onComplete={() => setTab('goals')}
          />
        ) : null,
      )}
    </div>
  );
}

function CheckInPanel({
  period, goals, date, onDateChange, onSubmit, existing, onComplete,
}: {
  period: CheckInPeriod;
  goals: { id: string; title: string; domain: string }[];
  date: string;
  onDateChange: (d: string) => void;
  onSubmit: (period: CheckInPeriod, goalId: string, note: string, status: CheckInStatus) => void;
  existing: Record<string, { progressNote: string; status: CheckInStatus; submittedAt: string | null }>;
  onComplete: () => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, { note: string; status: CheckInStatus }>>({});
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [viewSubmission, setViewSubmission] = useState(false);

  if (goals.length === 0) {
    return <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 32, textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>Set development goals first to use this check-in.</div>;
  }

  function draftFor(goalId: string) {
    return drafts[goalId] ?? { note: existing[`${goalId}:${period}`]?.progressNote ?? '', status: existing[`${goalId}:${period}`]?.status ?? 'IN_PROGRESS' };
  }

  function handleSubmitAll() {
    let submittedCount = 0;
    for (const g of goals) {
      if (existing[`${g.id}:${period}`]) continue;
      const d = draftFor(g.id);
      if (d.note.trim().length > 0) {
        onSubmit(period, g.id, d.note, d.status);
        submittedCount += 1;
      }
    }
    if (submittedCount > 0) setSubmittedNotice(true);
  }

  const allSubmitted = goals.every((goal) => !!existing[`${goal.id}:${period}`]);

  return (
    <div>
      <div className="tracker-help checkin-guidance"><strong>{periodLabels[period]}</strong>{periodGuidance[period]}</div>
      {allSubmitted && <>
        <div className="checkin-submitted-banner"><span aria-hidden="true">&#10003;</span><div><strong>{periodLabels[period]} submitted</strong><p>This check-in is complete and no longer editable.</p></div></div>
        <div className="view-submission-action"><button type="button" className="btn btn-secondary" onClick={() => setViewSubmission((visible) => !visible)}>{viewSubmission ? 'Hide submission' : 'View submission'}</button></div>
      </>}
      {(!allSubmitted || viewSubmission) && <div className="checkin-submission-details">
        <div className="checkin-date-bar">
          <label>Date of this update:</label>
          <input type="date" value={date} disabled={allSubmitted} onChange={(e) => onDateChange(e.target.value)} />
        </div>
        {goals.map((g, goalIndex) => {
        const locked = !!existing[`${g.id}:${period}`];
        const d = draftFor(g.id);
        return (
          <div className="dash-goal-card" key={`${g.id}-${goalIndex}`}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--cream-border)' }}>
              <div className="tg-number">Development Goal {goalIndex + 1} of {goals.length}</div>
              <div className="dg-title">{g.title || 'Untitled goal'}</div>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <textarea
                className="micro-ta"
                rows={3}
                placeholder="What progress have you made on this goal?"
                value={d.note}
                disabled={locked}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [g.id]: { ...d, note: e.target.value } }))}
              />
              <select
                className="goal-type-select"
                style={{ marginTop: 10 }}
                value={d.status}
                disabled={locked}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [g.id]: { ...d, status: e.target.value as CheckInStatus } }))}
              >
                {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              {locked && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, fontStyle: 'italic' }}>Submitted, no longer editable.</div>}
            </div>
          </div>
        );
        })}
      </div>}
      {!allSubmitted && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button className="btn btn-primary" onClick={handleSubmitAll}>Submit check-in</button>
        </div>
      )}
      <SubmissionNotice open={submittedNotice} title={`${periodLabels[period]} submitted`} message="Your progress update has been saved and is now shown in your Growth Tracker." onClose={() => { setSubmittedNotice(false); onComplete(); }} />
    </div>
  );
}
