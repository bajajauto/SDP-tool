import { prisma } from './db';
import { ApiError } from './errors';

export const sdpInclude = { reflection: true, goals: { orderBy: { sortOrder: 'asc' as const } } };

export async function activeCycle() {
  const cycle = await prisma.cycle.findFirst({ where: { status: 'ACTIVE' } });
  if (!cycle) throw new ApiError(409, 'NO_ACTIVE_CYCLE', 'There is no active SDP cycle');
  return cycle;
}

export async function ownSdp(employeeId: string, create = false) {
  const cycle = await activeCycle();
  const found = await prisma.sdp.findUnique({ where: { employeeId_cycleId: { employeeId, cycleId: cycle.cycleId } }, include: sdpInclude });
  if (found || !create) return found;
  return prisma.sdp.create({ data: { employeeId, cycleId: cycle.cycleId, reflection: { create: {} } }, include: sdpInclude });
}

export function assertDraft(status: string) {
  if (status !== 'NOT_STARTED' && status !== 'DRAFT') throw new ApiError(409, 'SDP_IMMUTABLE', 'Submitted SDP content cannot be changed');
}

export function serializeSdp(sdp: any) {
  return {
    sdpId: sdp.sdpId, employeeId: sdp.employeeId, cycleId: sdp.cycleId, status: sdp.status, sharingScope: sdp.sharingScope,
    submittedAt: sdp.submittedAt?.toISOString() ?? null, conversationConfirmedAt: sdp.conversationConfirmedAt?.toISOString() ?? null,
    lastSavedAt: sdp.lastSavedAt.toISOString(), version: sdp.version,
    reflection: sdp.reflection ? { q1Words: sdp.reflection.q1Words, q1Text: sdp.reflection.q1Text, q2Text: sdp.reflection.q2Text, q3Text: sdp.reflection.q3Text, q4Text: sdp.reflection.q4Text, q5Text: sdp.reflection.q5Text, q6Text: sdp.reflection.q6Text } : null,
    goals: sdp.goals.map((goal: any) => ({ goalId: goal.goalId, sortOrder: goal.sortOrder, title: goal.title, domain: goal.domain, whyItMatters: goal.whyItMatters, grownWhen: goal.grownWhen, actionPlan: { do: goal.actionDo, learn: goal.actionLearn, connect: goal.actionConnect }, supportNeeded: goal.supportNeeded })),
  };
}
