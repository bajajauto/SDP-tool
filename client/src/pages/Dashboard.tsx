import { useState } from 'react';
import { useSdp } from '../state/SdpContext';
import type { CheckInPeriod, CheckInStatus, Milestone } from '@sdp/shared';
import { MILESTONE_LABELS, MILESTONE_ORDER } from '@sdp/shared';

type Tab = 'goals' | 'Q1' | 'MID_YEAR' | 'Q2' | 'YEAR_END';

const periodLabels: Record<CheckInPeriod, string> = {
  Q1: 'Quarterly Check-in 1',
  MID_YEAR: 'Mid-Year Conversation',
  Q2: 'Quarterly Check-in 2',
  YEAR_END: 'Year-End Conversation',
};

const statusOptions: CheckInStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'ON_TRACK', 'AT_RISK', 'ACHIEVED'];

export function Dashboard() {
  const { state, submitCheckIn, setCheckInDate } = useSdp();
  const [tab, setTab] = useState<Tab>('goals');

  const milestoneState = (m: Milestone): 'DONE' | 'PENDING' | 'NOT_DUE' => {
    if (m === 'SDP_SUBMITTED') return state.status !== 'NOT_STARTED' && state.status !== 'DRAFT' ? 'DONE' : 'PENDING';
    if (m === 'GROWTH_CONVERSATION') return state.conversationConfirmedAt ? 'DONE' : (state.status === 'SUBMITTED' ? 'PENDING' : 'NOT_DUE');
    if (m === 'Q1_CHECKIN') return hasAnyCheckIn('Q1') ? 'DONE' : 'PENDING';
    if (m === 'MID_YEAR_CHECKIN') return hasAnyCheckIn('MID_YEAR') ? 'DONE' : 'PENDING';
    if (m === 'Q2_CHECKIN') return hasAnyCheckIn('Q2') ? 'DONE' : 'PENDING';
    if (m === 'YEAR_END_CHECKIN') return hasAnyCheckIn('YEAR_END') ? 'DONE' : 'PENDING';
    return 'NOT_DUE';
  };

  function hasAnyCheckIn(period: CheckInPeriod): boolean {
    return state.goals.some((g) => !!state.checkIns[`${g.id}:${period}`]);
  }

  return (
    <div className="screen-inner">
      <div className="pillar-tag" style={{ background: 'var(--blue-l)', color: 'var(--blue)' }}>Progress Tracker</div>
      <h1 className="page-title">My Growth Tracker</h1>
      <p className="page-sub" style={{ marginBottom: 24 }}>Track your progress through the year. Write for yourself, not for the system.</p>

      <div className="dash-timeline">
        <div className="dash-tl-label">Milestone timeline</div>
        <div className="tl-track">
          {MILESTONE_ORDER.map((m) => {
            const s = milestoneState(m);
            return (
              <div className="tl-step" key={m}>
                <div className={`tl-dot ${s === 'DONE' ? 'done' : s === 'PENDING' ? 'now' : 'future'}`}>
                  {s === 'DONE' ? '✓' : s === 'PENDING' ? '→' : '-'}
                </div>
                <div className="tl-step-label">{MILESTONE_LABELS[m]}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dash-tab-bar">
        <button className={`dash-tab${tab === 'goals' ? ' on' : ''}`} onClick={() => setTab('goals')}>Track My Goals</button>
        {(['Q1', 'MID_YEAR', 'Q2', 'YEAR_END'] as CheckInPeriod[]).map((p) => (
          <button key={p} className={`dash-tab${tab === p ? ' on' : ''}`} onClick={() => setTab(p)}>{periodLabels[p]}</button>
        ))}
      </div>

      {tab === 'goals' && (
        <div>
          <p style={{ fontSize: 13.5, color: 'var(--mid)', lineHeight: 1.65, marginBottom: 16 }}>
            Your check-in status across the year, per goal.
          </p>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', boxShadow: 'var(--sh)' }}>
            <table className="track-grid">
              <thead>
                <tr>
                  <th>Goal</th>
                  <th className="cen">Q1</th>
                  <th className="cen">Mid-Year</th>
                  <th className="cen">Q2</th>
                  <th className="cen">Year-End</th>
                </tr>
              </thead>
              <tbody>
                {state.goals.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontStyle: 'italic' }}>Set development goals first to start tracking.</td></tr>
                )}
                {state.goals.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <div className="tg-goal">{g.title || 'Untitled goal'}</div>
                      {g.domain && <div className="tg-domain">{g.domain}</div>}
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
          />
        ) : null,
      )}
    </div>
  );
}

function CheckInPanel({
  period, goals, date, onDateChange, onSubmit, existing,
}: {
  period: CheckInPeriod;
  goals: { id: string; title: string; domain: string }[];
  date: string;
  onDateChange: (d: string) => void;
  onSubmit: (period: CheckInPeriod, goalId: string, note: string, status: CheckInStatus) => void;
  existing: Record<string, { progressNote: string; status: CheckInStatus; submittedAt: string | null }>;
}) {
  const [drafts, setDrafts] = useState<Record<string, { note: string; status: CheckInStatus }>>({});

  if (goals.length === 0) {
    return <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 32, textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>Set development goals first to use this check-in.</div>;
  }

  function draftFor(goalId: string) {
    return drafts[goalId] ?? { note: existing[`${goalId}:${period}`]?.progressNote ?? '', status: existing[`${goalId}:${period}`]?.status ?? 'IN_PROGRESS' };
  }

  function handleSubmitAll() {
    for (const g of goals) {
      const d = draftFor(g.id);
      if (d.note.trim().length > 0) onSubmit(period, g.id, d.note, d.status);
    }
  }

  return (
    <div>
      <div className="checkin-date-bar">
        <label>Date of this update:</label>
        <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
      </div>
      {goals.map((g) => {
        const locked = !!existing[`${g.id}:${period}`];
        const d = draftFor(g.id);
        return (
          <div className="dash-goal-card" key={g.id}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--cream-border)' }}>
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
        <button className="btn btn-primary" onClick={handleSubmitAll}>Submit check-in</button>
      </div>
    </div>
  );
}
