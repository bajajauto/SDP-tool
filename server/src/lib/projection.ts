import { MILESTONE_ORDER } from '@sdp/shared';
import type { Employee, Milestone, MilestoneState, Sdp, TrackingRow } from '@sdp/shared';

/**
 * Builds the BUHR/TD Admin status-only projection (CLAUDE.md non-negotiable
 * #2, PRD FR-HR-006, FR-NFR-018). `TrackingRow` has no field capable of
 * carrying reflection, goal, feedback or check-in text, so there is nothing
 * here to accidentally leak: this function cannot return content that does
 * not exist on its own return type.
 */
export function toTrackingRow(
  employee: Employee,
  managerName: string,
  sdp: Sdp | undefined,
): TrackingRow {
  const milestones = {} as TrackingRow['milestones'];
  for (const milestone of MILESTONE_ORDER) {
    milestones[milestone] = { state: milestoneState(milestone, sdp), completedAt: null };
  }

  return {
    employeeId: employee.employeeId,
    employeeName: employee.fullName,
    managerName,
    bu: employee.bu,
    department: employee.department,
    sharingScope: sdp?.sharingScope ?? null,
    milestones,
  };
}

function milestoneState(milestone: Milestone, sdp: Sdp | undefined): MilestoneState {
  if (milestone === 'SDP_SUBMITTED') {
    return sdp?.submittedAt ? 'DONE' : 'PENDING';
  }
  return 'NOT_DUE';
}
