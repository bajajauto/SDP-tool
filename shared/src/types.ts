import type {
  CheckInPeriod,
  CheckInStatus,
  FeedbackType,
  GoalDomain,
  Milestone,
  MilestoneState,
  Role,
  SdpStatus,
  SharingScope,
} from './enums';

export interface Employee {
  employeeId: string;
  fullName: string;
  email: string;
  managerEmployeeId: string | null;
  buhrEmployeeId: string | null;
  bu: string;
  function: string;
  department: string;
  designation: string;
  buHeadEmployeeId: string | null;
  hireDate: string;
  isActive: boolean;
}

export interface Me {
  employee: Employee;
  roles: Role[];
  cycle: { cycleId: string; label: string; status: 'DRAFT' | 'ACTIVE' | 'CLOSED' };
  sdpStatus: SdpStatus;
}

export interface Reflection {
  q1Words: string[];
  q1Text: string | null;
  q2Text: string;
  q3Text: string;
  q4Text: string;
  q5Text: string;
  q6Text: string;
}

export interface ActionPlan {
  do: string;
  learn: string;
  connect: string;
}

export interface Goal {
  goalId: string;
  sortOrder: number;
  title: string;
  domain: GoalDomain;
  whyItMatters: string;
  grownWhen: string;
  actionPlan: ActionPlan;
  supportNeeded: string;
}

export interface Sdp {
  sdpId: string;
  employeeId: string;
  cycleId: string;
  status: SdpStatus;
  sharingScope: SharingScope | null;
  submittedAt: string | null;
  conversationConfirmedAt: string | null;
  lastSavedAt: string;
  version: number;
  reflection: Reflection | null;
  goals: Goal[];
}

export interface CheckIn {
  checkInId: string;
  goalId: string | null;
  period: CheckInPeriod;
  progressNote: string;
  status: CheckInStatus;
  submittedAt: string;
}

export interface ManagerFeedback {
  feedbackId: string;
  type: FeedbackType;
  authorEmployeeId: string;
  body: string;
  sharedAt: string | null;
}

export interface MilestoneStatus {
  milestone: Milestone;
  state: MilestoneState;
  completedAt: string | null;
}

export interface JournalEntry {
  entryId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Status-only projection for BUHR and TD Admin. Deliberately has no field
 * capable of carrying reflection, goal, feedback or check-in text.
 * See CLAUDE.md non-negotiable #2 and PRD FR-HR-006 / FR-TDA-005.
 */
export interface TrackingRow {
  employeeId: string;
  employeeName: string;
  managerName: string;
  bu: string;
  department: string;
  sharingScope: SharingScope | null;
  milestones: Record<Milestone, { state: MilestoneState; completedAt: string | null }>;
}
