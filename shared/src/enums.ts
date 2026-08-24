/**
 * Canonical enums for the SDP Tool, per PRD Section 22.2.
 * Import these everywhere. Never re-declare a milestone, status or scope
 * value inline in a component, route or DTO.
 */

export type SdpStatus =
  | 'NOT_STARTED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CONVERSATION_CONFIRMED'
  | 'IN_PROGRESS'
  | 'CLOSED';

export type SharingScope = 'FULL' | 'GOALS_ONLY';

export type GoalDomain = 'FUNCTIONAL' | 'BEHAVIOURAL' | 'LEADERSHIP';

export type CheckInPeriod = 'Q1' | 'MID_YEAR' | 'Q2' | 'YEAR_END';

export type CheckInStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'ON_TRACK'
  | 'AT_RISK'
  | 'ACHIEVED';

export type FeedbackType = 'PLAN' | 'MID_YEAR' | 'YEAR_END';

export type MilestoneState = 'DONE' | 'PENDING' | 'NOT_DUE';

export type Milestone =
  | 'SDP_SUBMITTED'
  | 'GROWTH_CONVERSATION'
  | 'MGR_PLAN_FEEDBACK'
  | 'Q1_CHECKIN'
  | 'MID_YEAR_CHECKIN'
  | 'MGR_MID_FEEDBACK'
  | 'Q2_CHECKIN'
  | 'YEAR_END_CHECKIN'
  | 'MGR_YEAR_FEEDBACK';

export type Role = 'EMPLOYEE' | 'MANAGER' | 'BUHR' | 'TD_ADMIN';

/** The nine milestones in cycle order. This ordering drives the dashboard
 * columns, the BUHR nudge template list and the employee timeline (PRD 7.2). */
export const MILESTONE_ORDER: Milestone[] = [
  'SDP_SUBMITTED',
  'GROWTH_CONVERSATION',
  'MGR_PLAN_FEEDBACK',
  'Q1_CHECKIN',
  'MID_YEAR_CHECKIN',
  'MGR_MID_FEEDBACK',
  'Q2_CHECKIN',
  'YEAR_END_CHECKIN',
  'MGR_YEAR_FEEDBACK',
];

export const MILESTONE_LABELS: Record<Milestone, string> = {
  SDP_SUBMITTED: 'SDP',
  GROWTH_CONVERSATION: 'Growth Conv',
  MGR_PLAN_FEEDBACK: 'Mgr Plan Fb',
  Q1_CHECKIN: 'Q1',
  MID_YEAR_CHECKIN: 'Mid-Year',
  MGR_MID_FEEDBACK: 'Mgr Mid Fb',
  Q2_CHECKIN: 'Q2',
  YEAR_END_CHECKIN: 'Year-End',
  MGR_YEAR_FEEDBACK: 'Mgr Year Fb',
};
