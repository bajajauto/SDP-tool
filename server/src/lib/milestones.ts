import type { Milestone, MilestoneState, TrackingRow } from '@sdp/shared';
import { MILESTONE_ORDER } from '@sdp/shared';

export function milestoneMap(sdp: any | null, now = new Date()): TrackingRow['milestones'] {
  const doneAt: Partial<Record<Milestone, Date | null>> = {};
  if (sdp?.submittedAt) doneAt.SDP_SUBMITTED = sdp.submittedAt;
  if (sdp?.conversationConfirmedAt) doneAt.GROWTH_CONVERSATION = sdp.conversationConfirmedAt;
  for (const feedback of sdp?.managerFeedback ?? []) { if (feedback.sharedAt) doneAt[feedback.type === 'PLAN' ? 'MGR_PLAN_FEEDBACK' : feedback.type === 'MID_YEAR' ? 'MGR_MID_FEEDBACK' : 'MGR_YEAR_FEEDBACK'] = feedback.sharedAt; }
  for (const checkIn of sdp?.checkIns ?? []) { doneAt[checkIn.period === 'Q1' ? 'Q1_CHECKIN' : checkIn.period === 'MID_YEAR' ? 'MID_YEAR_CHECKIN' : checkIn.period === 'Q2' ? 'Q2_CHECKIN' : 'YEAR_END_CHECKIN'] = checkIn.submittedAt; }
  const due: Partial<Record<Milestone, Date>> = sdp?.cycle ? { Q1_CHECKIN: sdp.cycle.q1WindowStart, MID_YEAR_CHECKIN: sdp.cycle.midYearCutoff, Q2_CHECKIN: sdp.cycle.q2WindowStart, YEAR_END_CHECKIN: sdp.cycle.yearEndCutoff } : {};
  return Object.fromEntries(MILESTONE_ORDER.map((milestone) => { const completed = doneAt[milestone]; const state: MilestoneState = completed ? 'DONE' : due[milestone] && now < due[milestone]! ? 'NOT_DUE' : 'PENDING'; return [milestone, { state, completedAt: completed?.toISOString() ?? null }]; })) as TrackingRow['milestones'];
}
