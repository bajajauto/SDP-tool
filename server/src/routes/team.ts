import { Router } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { prisma } from '../lib/db';
import { ApiError, asyncRoute } from '../lib/errors';
import { milestoneMap } from '../lib/milestones';
import { auditData } from '../lib/audit';

export const teamRouter = Router();
async function reporteeSdp(managerId: string, employeeId: string) {
  const employee = await prisma.employee.findFirst({ where: { employeeId, managerEmployeeId: managerId, isActive: true }, include: { sdps: { where: { cycle: { status: 'ACTIVE' } }, include: { reflection: true, goals: { orderBy: { sortOrder: 'asc' } }, managerFeedback: true, supportNeeds: true, checkIns: true, cycle: true }, take: 1 } } });
  if (!employee) throw new ApiError(404, 'NOT_FOUND', 'Reportee not found'); return { employee, sdp: employee.sdps[0] };
}
teamRouter.get('/', requireRole('MANAGER'), asyncRoute(async (req, res) => {
  const employees = await prisma.employee.findMany({ where: { managerEmployeeId: (req as AuthedRequest).employeeId, isActive: true }, include: { sdps: { where: { cycle: { status: 'ACTIVE' } }, include: { managerFeedback: true, checkIns: true, cycle: true }, take: 1 } }, orderBy: { fullName: 'asc' } });
  res.json(employees.map((employee) => { const sdp = employee.sdps[0] ?? null; return { employeeId: employee.employeeId, fullName: employee.fullName, designation: employee.designation, sharingScope: sdp?.sharingScope ?? null, submittedAt: sdp?.submittedAt?.toISOString() ?? null, milestones: milestoneMap(sdp) }; }));
}));
teamRouter.get('/:employeeId', requireRole('MANAGER'), asyncRoute(async (req, res) => {
  const { employee, sdp } = await reporteeSdp((req as AuthedRequest).employeeId, req.params.employeeId); if (!sdp?.submittedAt) throw new ApiError(404, 'NO_SDP', 'No submitted SDP found');
  const base = { employeeId: employee.employeeId, employeeName: employee.fullName, sharingScope: sdp.sharingScope, submittedAt: sdp.submittedAt.toISOString(), goals: sdp.goals.map((g) => ({ goalId: g.goalId, sortOrder: g.sortOrder, title: g.title, domain: g.domain, whyItMatters: g.whyItMatters, grownWhen: g.grownWhen, actionPlan: { do: g.actionDo, learn: g.actionLearn, connect: g.actionConnect }, supportNeeded: g.supportNeeded })) };
  res.json(sdp.sharingScope === 'FULL' ? { ...base, reflection: sdp.reflection && { q1Words: sdp.reflection.q1Words, q1Text: sdp.reflection.q1Text, q2Text: sdp.reflection.q2Text, q3Text: sdp.reflection.q3Text, q4Text: sdp.reflection.q4Text, q5Text: sdp.reflection.q5Text, q6Text: sdp.reflection.q6Text } } : base);
}));
teamRouter.get('/:employeeId/feedback', requireRole('MANAGER'), asyncRoute(async (req, res) => { const { sdp } = await reporteeSdp((req as AuthedRequest).employeeId, req.params.employeeId); res.json(sdp?.managerFeedback ?? []); }));
teamRouter.put('/:employeeId/feedback/:type', requireRole('MANAGER'), asyncRoute(async (req, res) => {
  const type = z.enum(['PLAN', 'MID_YEAR', 'YEAR_END']).parse(req.params.type); const { body } = z.object({ body: z.string().max(10000) }).parse(req.body); const auth = req as AuthedRequest; const { sdp } = await reporteeSdp(auth.employeeId, req.params.employeeId); if (!sdp) throw new ApiError(404, 'NO_SDP', 'No SDP found');
  const existing = sdp.managerFeedback.find((f) => f.type === type); if (existing?.sharedAt) throw new ApiError(409, 'FEEDBACK_IMMUTABLE', 'Shared feedback cannot be changed');
  res.json(await prisma.managerFeedback.upsert({ where: { sdpId_type: { sdpId: sdp.sdpId, type } }, create: { sdpId: sdp.sdpId, type, authorEmployeeId: auth.employeeId, body }, update: { body } }));
}));
teamRouter.post('/:employeeId/feedback/:type/share', requireRole('MANAGER'), asyncRoute(async (req, res) => {
  const type = z.enum(['PLAN', 'MID_YEAR', 'YEAR_END']).parse(req.params.type); const auth = req as AuthedRequest; const { sdp } = await reporteeSdp(auth.employeeId, req.params.employeeId); if (!sdp) throw new ApiError(404, 'NO_SDP', 'No SDP found'); if (type === 'PLAN' && !['CONVERSATION_CONFIRMED', 'IN_PROGRESS'].includes(sdp.status)) throw new ApiError(409, 'INVALID_TRANSITION', 'The growth conversation must be confirmed first');
  const feedback = sdp.managerFeedback.find((f) => f.type === type); if (!feedback?.body.trim()) throw new ApiError(422, 'FEEDBACK_INCOMPLETE', 'Add feedback before sharing'); if (feedback.sharedAt) throw new ApiError(409, 'FEEDBACK_IMMUTABLE', 'Feedback has already been shared');
  const shared = await prisma.$transaction(async (tx) => { const item = await tx.managerFeedback.update({ where: { feedbackId: feedback.feedbackId }, data: { sharedAt: new Date() } }); await tx.auditLog.create({ data: auditData({ actorEmployeeId: auth.employeeId, actorRole: 'MANAGER', action: 'FEEDBACK_SHARED', entityType: 'MANAGER_FEEDBACK', entityId: feedback.feedbackId, subjectEmployeeId: req.params.employeeId, metadata: { type }, ipAddress: req.ip }) }); return item; }); res.json(shared);
}));
teamRouter.post('/:employeeId/support-needs/:id/action', requireRole('MANAGER'), asyncRoute(async (req, res) => { const auth = req as AuthedRequest; const { sdp } = await reporteeSdp(auth.employeeId, req.params.employeeId); if (!sdp?.supportNeeds.some((n) => n.supportNeedId === req.params.id)) throw new ApiError(404, 'NOT_FOUND', 'Support request not found'); res.json(await prisma.supportNeed.update({ where: { supportNeedId: req.params.id }, data: { status: 'ACTIONED', actionedBy: auth.employeeId, actionedAt: new Date() } })); }));
