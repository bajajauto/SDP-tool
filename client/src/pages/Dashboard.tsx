import { useEffect, useState } from 'react';
import { useSdp } from '../state/SdpContext';
import type { CheckInPeriod, CheckInStatus, GoalDomain } from '@sdp/shared';
import { SubmissionNotice } from '../components/SubmissionNotice';
import { api } from '../lib/api';
import type { CheckInQuestion } from '../lib/api';

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

const domainLabels: Record<GoalDomain, string> = { FUNCTIONAL: 'Functional', BEHAVIOURAL: 'Behavioural', LEADERSHIP: 'Leadership' };

export function Dashboard() {
  const { state, submitCheckIn, setCheckInDate } = useSdp();
  const [tab, setTab] = useState<Tab>('goals');
  const [labels, setLabels] = useState(periodLabels);
  const [configuredQuestions, setConfiguredQuestions] = useState<Partial<Record<CheckInPeriod, CheckInQuestion[]>>>({});

  useEffect(() => {
    let active = true;
    api.myCheckInSetup().then((setup) => {
      if (!active || !setup.stages.length) return;
      const configured = setup.stages.map((stage) => stage.name.trim()).filter(Boolean);
      setLabels({ Q1: configured[0] || periodLabels.Q1, MID_YEAR: configured[1] || periodLabels.MID_YEAR, Q2: configured[2] || periodLabels.Q2, YEAR_END: configured[3] || periodLabels.YEAR_END });
      setConfiguredQuestions({ Q1: setup.stages[0]?.questions, MID_YEAR: setup.stages[1]?.questions, Q2: setup.stages[2]?.questions, YEAR_END: setup.stages[3]?.questions });
    }).catch(() => { /* Keep the standard labels when no cohort setup is available. */ });
    return () => { active = false; };
  }, []);

  function hasAnyCheckIn(period: CheckInPeriod): boolean {
    return state.goals.some((g) => !!state.checkIns[`${g.id}:${period}`]);
  }

  function isCheckInComplete(period: CheckInPeriod): boolean {
    return state.goals.length > 0 && state.goals.every((goal) => !!state.checkIns[`${goal.id}:${period}`]);
  }

  const periods = ['Q1', 'MID_YEAR', 'Q2', 'YEAR_END'] as CheckInPeriod[];
  const isPeriodAvailable = (period: CheckInPeriod) => Boolean(state.checkInWindows && new Date(state.checkInWindows[period]) <= new Date());
  const availablePeriods = periods.filter(isPeriodAvailable);
  const timeline = [
    { label: 'Publish SDP', done: state.status !== 'NOT_STARTED' && state.status !== 'DRAFT', marker: 'S', available: true },
    ...periods.map((period) => ({ label: labels[period], done: hasAnyCheckIn(period), marker: period === 'Q1' ? '1' : period === 'MID_YEAR' ? 'M' : period === 'Q2' ? '2' : 'E', available: isPeriodAvailable(period) })),
  ];
  const currentTimelineIndex = timeline.findIndex((item) => item.available && !item.done);

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
        {periods.map((p) => {
          const complete = isCheckInComplete(p);
          const available = isPeriodAvailable(p);
          const availableOn = state.checkInWindows?.[p] ? new Date(state.checkInWindows[p]).toLocaleDateString() : null;
          return <button key={p} className={`dash-tab${tab === p ? ' on' : ''}${complete ? ' completed' : ''}`} disabled={!available} title={!available && availableOn ? `Available from ${availableOn}` : undefined} onClick={() => setTab(p)}>{complete && <span className="dash-tab-check" aria-hidden="true">&#10003;</span>}{labels[p]}</button>;
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
                  {periods.map((period) => <th className={`cen${isPeriodAvailable(period) ? '' : ' checkin-not-available'}`} key={period}>{labels[period]}</th>)}
                </tr>
              </thead>
              <tbody>
                {state.goals.length === 0 && (
                  <tr><td colSpan={periods.length + 1} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontStyle: 'italic' }}>Set development goals first to start tracking.</td></tr>
                )}
                {state.goals.map((g, goalIndex) => (
                  <tr key={`${g.id}-${goalIndex}`}>
                    <td>
                      <div className="tg-number">Development Goal {goalIndex + 1}</div>
                      <div className="tg-goal">{g.title || 'Untitled goal'}</div>
                      {g.domain && <div className="tg-domain">{domainLabels[g.domain]}</div>}
                    </td>
                    {periods.map((p) => {
                      const ci = state.checkIns[`${g.id}:${p}`];
                      return (
                        <td className={`cen${isPeriodAvailable(p) ? '' : ' checkin-not-available'}`} key={p}>
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

      {availablePeriods.map((p) =>
        tab === p ? (
          <CheckInPanel
            key={p}
            period={p}
            label={labels[p]}
            questions={configuredQuestions[p] ?? []}
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
  period, label, questions, goals, date, onDateChange, onSubmit, existing, onComplete,
}: {
  period: CheckInPeriod;
  label: string;
  questions: CheckInQuestion[];
  goals: { id: string; title: string; domain: string }[];
  date: string;
  onDateChange: (d: string) => void;
  onSubmit: (period: CheckInPeriod, goalId: string, note: string, status: CheckInStatus) => void;
  existing: Record<string, { progressNote: string; status: CheckInStatus; submittedAt: string | null }>;
  onComplete: () => void;
}) {
  const [quarterlyDrafts, setQuarterlyDrafts] = useState<Record<string, { rating: number; done: string; correction: string }>>({});
  const [conversationDraft, setConversationDraft] = useState({ left: '', right: '', bottom: '' });
  const [templateAnswers, setTemplateAnswers] = useState<Record<string, Record<string, string>>>({});
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [viewSubmission, setViewSubmission] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (goals.length === 0) {
    return <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 32, textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>Set development goals first to use this check-in.</div>;
  }

  function handleSubmitAll() {
    const isQuarterly = period === 'Q1' || period === 'Q2';
    if (questions.length) {
      const responseKeys = isQuarterly ? goals.filter((goal) => !existing[`${goal.id}:${period}`]).map((goal) => goal.id) : ['conversation'];
      const incomplete = responseKeys.some((key) => questions.some((question) => !templateAnswers[key]?.[question.id]?.trim()));
      if (incomplete) { setValidationError('Answer every selected question before submitting.'); return; }
      responseKeys.forEach((key) => {
        const answers = templateAnswers[key];
        const note = questions.map((question) => `${question.prompt}\n${question.type === 'SCALE' ? `${answers[question.id]}/5` : answers[question.id]}`).join('\n\n');
        const scaleAnswer = questions.find((question) => question.type === 'SCALE') ? Number(answers[questions.find((question) => question.type === 'SCALE')!.id]) : 3;
        const status: CheckInStatus = scaleAnswer === 1 ? 'AT_RISK' : scaleAnswer === 2 ? 'IN_PROGRESS' : scaleAnswer === 5 ? 'ACHIEVED' : 'ON_TRACK';
        if (isQuarterly) onSubmit(period, key, note, status);
        else goals.forEach((goal) => { if (!existing[`${goal.id}:${period}`]) onSubmit(period, goal.id, note, status); });
      });
    } else if (isQuarterly) {
      const incomplete = goals.some((goal) => { const draft = quarterlyDrafts[goal.id]; return !existing[`${goal.id}:${period}`] && (!draft?.rating || !draft.done.trim() || !draft.correction.trim()); });
      if (incomplete) { setValidationError('Choose a progress rating and answer both questions for every goal.'); return; }
      goals.forEach((goal) => {
        if (existing[`${goal.id}:${period}`]) return;
        const draft = quarterlyDrafts[goal.id];
        const status: CheckInStatus = draft.rating === 1 ? 'AT_RISK' : draft.rating === 2 ? 'IN_PROGRESS' : draft.rating === 5 ? 'ACHIEVED' : 'ON_TRACK';
        onSubmit(period, goal.id, `Progress rating: ${draft.rating}/5\n\nWhat have I done this quarter?\n${draft.done}\n\nCourse correction needed\n${draft.correction}`, status);
      });
    } else {
      if (!conversationDraft.left.trim() || !conversationDraft.right.trim() || !conversationDraft.bottom.trim()) { setValidationError('Answer all three conversation questions before submitting.'); return; }
      const questions = period === 'MID_YEAR'
        ? ['What is working well?', 'What needs to change?', 'Support I need from my manager']
        : ['What worked?', 'What did not work?', 'Strengths I used and growth I achieved'];
      const note = `${questions[0]}\n${conversationDraft.left}\n\n${questions[1]}\n${conversationDraft.right}\n\n${questions[2]}\n${conversationDraft.bottom}`;
      goals.forEach((goal) => { if (!existing[`${goal.id}:${period}`]) onSubmit(period, goal.id, note, 'ON_TRACK'); });
    }
    setValidationError(''); setSubmittedNotice(true);
  }

  const allSubmitted = goals.every((goal) => !!existing[`${goal.id}:${period}`]);

  return (
    <div>
      <div className="tracker-help checkin-guidance"><strong>{label}</strong>{periodGuidance[period]}</div>
      {allSubmitted && <>
        <div className="checkin-submitted-banner"><span aria-hidden="true">&#10003;</span><div><strong>{label} submitted</strong><p>This check-in is complete and no longer editable.</p></div></div>
        <div className="view-submission-action"><button type="button" className="btn btn-secondary" onClick={() => setViewSubmission((visible) => !visible)}>{viewSubmission ? 'Hide submission' : 'View submission'}</button></div>
      </>}
      {(!allSubmitted || viewSubmission) && <div className="checkin-submission-details">
        <div className="checkin-date-bar">
          <label>Date of this update:</label>
          <input type="date" value={date} disabled={allSubmitted} onChange={(e) => onDateChange(e.target.value)} />
        </div>
        {questions.length ? <TemplateQuestions questions={questions} perGoal={period === 'Q1' || period === 'Q2'} goals={goals} period={period} existing={existing} answers={templateAnswers} onChange={setTemplateAnswers} /> : (period === 'Q1' || period === 'Q2') ? goals.map((g, goalIndex) => {
          const locked = !!existing[`${g.id}:${period}`];
          const draft = quarterlyDrafts[g.id] ?? { rating: 0, done: '', correction: '' };
          return <div className="dash-goal-card" key={`${g.id}-${goalIndex}`}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--cream-border)' }}><div className="tg-number">Development Goal {goalIndex + 1} of {goals.length}</div><div className="dg-title">{g.title || 'Untitled goal'}</div></div>
            <div className="checkin-question-body">
              {locked ? <div className="submitted-checkin-text">{existing[`${g.id}:${period}`].progressNote}</div> : <>
                <div className="micro-q"><div className="mq-text">How well am I progressing on this goal?</div><div className="scale-row"><span>Low</span><div className="scale-dots">{[1, 2, 3, 4, 5].map((rating) => <button type="button" key={rating} className={`scale-dot${draft.rating === rating ? ' on' : ''}`} aria-pressed={draft.rating === rating} onClick={() => setQuarterlyDrafts((current) => ({ ...current, [g.id]: { ...draft, rating } }))}>{rating}</button>)}</div><span>High</span></div></div>
                <label className="checkin-question">What have I done this quarter?<textarea className="micro-ta" rows={3} placeholder="Reflect on actual progress, not intentions. A few honest lines is enough." value={draft.done} onChange={(event) => setQuarterlyDrafts((current) => ({ ...current, [g.id]: { ...draft, done: event.target.value } }))} /></label>
                <label className="checkin-question">Any course correction needed?<textarea className="micro-ta" rows={2} placeholder="Any adjustments to the goal or your approach..." value={draft.correction} onChange={(event) => setQuarterlyDrafts((current) => ({ ...current, [g.id]: { ...draft, correction: event.target.value } }))} /></label>
              </>}
            </div>
          </div>;
        }) : <ConversationQuestions period={period} heading={label} locked={allSubmitted} existingNote={existing[`${goals[0].id}:${period}`]?.progressNote} draft={conversationDraft} onChange={setConversationDraft} />}
      </div>}
      {validationError && <p className="checkin-validation-error" role="alert">{validationError}</p>}
      {!allSubmitted && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button className="btn btn-primary" onClick={handleSubmitAll}>Submit check-in</button>
        </div>
      )}
      <SubmissionNotice open={submittedNotice} title={`${label} submitted`} message="Your progress update has been saved and is now shown in your Growth Tracker." onClose={() => { setSubmittedNotice(false); onComplete(); }} />
    </div>
  );
}

function TemplateQuestions({ questions, perGoal, goals, period, existing, answers, onChange }: {
  questions: CheckInQuestion[];
  perGoal: boolean;
  goals: { id: string; title: string; domain: string }[];
  period: CheckInPeriod;
  existing: Record<string, { progressNote: string; status: CheckInStatus; submittedAt: string | null }>;
  answers: Record<string, Record<string, string>>;
  onChange: (answers: Record<string, Record<string, string>>) => void;
}) {
  const targets = perGoal ? goals.map((goal, index) => ({ key: goal.id, title: goal.title || 'Untitled goal', eyebrow: `Development Goal ${index + 1} of ${goals.length}`, existingNote: existing[`${goal.id}:${period}`]?.progressNote })) : [{ key: 'conversation', title: '', eyebrow: '', existingNote: existing[`${goals[0].id}:${period}`]?.progressNote }];
  return <>{targets.map((target) => <div className="dash-goal-card configured-checkin-card" key={target.key}>{perGoal && <div className="configured-checkin-heading"><div className="tg-number">{target.eyebrow}</div><div className="dg-title">{target.title}</div></div>}<div className="checkin-question-body">{target.existingNote ? <div className="submitted-checkin-text">{target.existingNote}</div> : questions.map((question) => <div className="checkin-question" key={question.id}><span>{question.prompt}</span>{question.type === 'SCALE' ? <div className="scale-row"><span>Low</span><div className="scale-dots">{[1, 2, 3, 4, 5].map((rating) => <button type="button" key={rating} className={`scale-dot${answers[target.key]?.[question.id] === String(rating) ? ' on' : ''}`} onClick={() => onChange({ ...answers, [target.key]: { ...answers[target.key], [question.id]: String(rating) } })}>{rating}</button>)}</div><span>High</span></div> : <textarea className="micro-ta" rows={3} placeholder={question.placeholder || 'Write your response...'} value={answers[target.key]?.[question.id] ?? ''} onChange={(event) => onChange({ ...answers, [target.key]: { ...answers[target.key], [question.id]: event.target.value } })} />}</div>)}</div></div>)}</>;
}

function ConversationQuestions({ period, heading, locked, existingNote, draft, onChange }: { period: 'MID_YEAR' | 'YEAR_END'; heading: string; locked: boolean; existingNote?: string; draft: { left: string; right: string; bottom: string }; onChange: (draft: { left: string; right: string; bottom: string }) => void }) {
  const content = period === 'MID_YEAR'
    ? { left: 'What is working well?', leftPlaceholder: 'Strengths used, progress made...', right: 'What needs to change?', rightPlaceholder: 'Course corrections or adjustments...', bottom: 'Support I need from my manager', bottomPlaceholder: 'Be specific about what would help most.' }
    : { left: 'What worked?', leftPlaceholder: 'Honest reflection on the year...', right: 'What did not work?', rightPlaceholder: 'What would you do differently...', bottom: 'Strengths I used and growth I achieved', bottomPlaceholder: 'What did you actually build this year...' };
  return <div className="dash-goal-card conversation-checkin-card"><div className="dg-title">{heading}</div>{locked ? <div className="submitted-checkin-text">{existingNote}</div> : <><div className="conversation-question-grid"><label className="checkin-question">{content.left}<textarea className="micro-ta" rows={4} placeholder={content.leftPlaceholder} value={draft.left} onChange={(event) => onChange({ ...draft, left: event.target.value })} /></label><label className="checkin-question">{content.right}<textarea className="micro-ta" rows={4} placeholder={content.rightPlaceholder} value={draft.right} onChange={(event) => onChange({ ...draft, right: event.target.value })} /></label></div><label className="checkin-question">{content.bottom}<span className="shared-with-manager">Shared with manager</span><textarea className="micro-ta" rows={3} placeholder={content.bottomPlaceholder} value={draft.bottom} onChange={(event) => onChange({ ...draft, bottom: event.target.value })} /></label></>}</div>;
}
