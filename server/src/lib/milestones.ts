import type { Milestone, MilestoneState, TrackingRow } from '@sdp/shared';
import { MILESTONE_ORDER } from '@sdp/shared';

export function milestoneMap(sdp: any | null, now = new Date(), activeCycle?: any): TrackingRow['milestones'] {
  const doneAt: Partial<Record<Milestone, Date | null>> = {};
  if (sdp?.submittedAt) doneAt.SDP_SUBMITTED = sdp.submittedAt;
  if (sdp?.conversationConfirmedAt) doneAt.GROWTH_CONVERSATION = sdp.conversationConfirmedAt;
  for (const feedback of sdp?.managerFeedback ?? []) { if (feedback.sharedAt) doneAt[feedback.type === 'PLAN' ? 'MGR_PLAN_FEEDBACK' : feedback.type === 'MID_YEAR' ? 'MGR_MID_FEEDBACK' : 'MGR_YEAR_FEEDBACK'] = feedback.sharedAt; }
  for (const checkIn of sdp?.checkIns ?? []) { doneAt[checkIn.period === 'Q1' ? 'Q1_CHECKIN' : checkIn.period === 'MID_YEAR' ? 'MID_YEAR_CHECKIN' : checkIn.period === 'Q2' ? 'Q2_CHECKIN' : 'YEAR_END_CHECKIN'] = checkIn.submittedAt; }
  const cycle = sdp?.cycle ?? activeCycle;
  const due: Partial<Record<Milestone, Date>> = cycle ? {
    ...(sdp?.conversationConfirmedAt ? { MGR_PLAN_FEEDBACK: sdp.conversationConfirmedAt } : {}),
    Q1_CHECKIN: cycle.q1WindowStart,
    MID_YEAR_CHECKIN: cycle.midYearCutoff,
    MGR_MID_FEEDBACK: cycle.midYearCutoff,
    Q2_CHECKIN: cycle.q2WindowStart,
    YEAR_END_CHECKIN: cycle.yearEndCutoff,
    MGR_YEAR_FEEDBACK: cycle.yearEndCutoff,
  } : {};
  return Object.fromEntries(MILESTONE_ORDER.map((milestone) => { const completed = doneAt[milestone]; const state: MilestoneState = completed ? 'DONE' : due[milestone] && now < due[milestone]! ? 'NOT_DUE' : 'PENDING'; return [milestone, { state, completedAt: completed?.toISOString() ?? null }]; })) as TrackingRow['milestones'];
}
