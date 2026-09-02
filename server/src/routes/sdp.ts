import { Router } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth';
import { prisma } from '../lib/db';
import { ApiError, asyncRoute } from '../lib/errors';
import { assertDraft, ownSdp, sdpInclude, serializeSdp } from '../lib/sdp';
import { auditData } from '../lib/audit';

export const sdpRouter = Router();
const reflectionSchema = z.object({
  q1Words: z.array(z.string().trim().min(1).max(50)).max(3).optional(), q1Text: z.string().max(2000).nullable().optional(),
  q2Text: z.string().max(5000).optional(), q3Text: z.string().max(5000).optional(), q4Text: z.string().max(5000).optional(),
  q5Text: z.string().max(5000).optional(), q6Text: z.string().max(5000).optional(), version: z.number().int().positive().optional(),
});
const goalSchema = z.object({
  title: z.string().max(300).optional(), domain: z.enum(['FUNCTIONAL', 'BEHAVIOURAL', 'LEADERSHIP']).optional(), whyItMatters: z.string().max(5000).optional(),
  grownWhen: z.string().max(5000).optional(), actionPlan: z.object({ do: z.string().max(5000).optional(), learn: z.string().max(5000).optional(), connect: z.string().max(5000).optional() }).optional(),
  supportNeeded: z.string().max(5000).optional(), sortOrder: z.number().int().min(1).max(3).optional(), version: z.number().int().positive().optional(),
});

sdpRouter.get('/', asyncRoute(async (req, res) => res.json(serializeSdp(await ownSdp((req as AuthedRequest).employeeId, true)))));

sdpRouter.patch('/reflection', asyncRoute(async (req, res) => {
  const body = reflectionSchema.parse(req.body); const sdp = await ownSdp((req as AuthedRequest).employeeId, true); assertDraft(sdp!.status);
  if (body.version && body.version !== sdp!.version) throw new ApiError(409, 'VERSION_CONFLICT', 'A newer version has already been saved');
  const { version: _version, ...reflection } = body;
  const updated = await prisma.sdp.update({ where: { sdpId: sdp!.sdpId }, data: { status: 'DRAFT', version: { increment: 1 }, lastSavedAt: new Date(), reflection: { upsert: { create: reflection, update: reflection } } }, include: sdpInclude });
  res.json(serializeSdp(updated));
}));

sdpRouter.post('/goals', asyncRoute(async (req, res) => {
  const body = goalSchema.parse(req.body); const sdp = await ownSdp((req as AuthedRequest).employeeId, true); assertDraft(sdp!.status);
  if (sdp!.goals.length >= 3) throw new ApiError(409, 'GOAL_LIMIT', 'An SDP can contain no more than three goals');
  const goal = await prisma.goal.create({ data: { sdpId: sdp!.sdpId, sortOrder: body.sortOrder ?? sdp!.goals.length + 1, title: body.title ?? '', domain: body.domain ?? 'FUNCTIONAL', whyItMatters: body.whyItMatters ?? '', grownWhen: body.grownWhen ?? '', actionDo: body.actionPlan?.do ?? '', actionLearn: body.actionPlan?.learn ?? '', actionConnect: body.actionPlan?.connect ?? '', supportNeeded: body.supportNeeded ?? '' } });
  await prisma.sdp.update({ where: { sdpId: sdp!.sdpId }, data: { status: 'DRAFT', version: { increment: 1 }, lastSavedAt: new Date() } }); res.status(201).json(goal);
}));

sdpRouter.patch('/goals/:goalId', asyncRoute(async (req, res) => {
  const body = goalSchema.parse(req.body); const sdp = await ownSdp((req as AuthedRequest).employeeId, false);
  if (!sdp) throw new ApiError(404, 'NOT_FOUND', 'SDP not found'); assertDraft(sdp.status);
  if (body.version && body.version !== sdp.version) throw new ApiError(409, 'VERSION_CONFLICT', 'A newer version has already been saved');
  if (!sdp.goals.some((g) => g.goalId === req.params.goalId)) throw new ApiError(404, 'NOT_FOUND', 'Goal not found');
  const goal = await prisma.goal.update({ where: { goalId: req.params.goalId }, data: { ...(body.title !== undefined && { title: body.title }), ...(body.domain && { domain: body.domain }), ...(body.whyItMatters !== undefined && { whyItMatters: body.whyItMatters }), ...(body.grownWhen !== undefined && { grownWhen: body.grownWhen }), ...(body.actionPlan?.do !== undefined && { actionDo: body.actionPlan.do }), ...(body.actionPlan?.learn !== undefined && { actionLearn: body.actionPlan.learn }), ...(body.actionPlan?.connect !== undefined && { actionConnect: body.actionPlan.connect }), ...(body.supportNeeded !== undefined && { supportNeeded: body.supportNeeded }), ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }) } });
  await prisma.sdp.update({ where: { sdpId: sdp.sdpId }, data: { version: { increment: 1 }, lastSavedAt: new Date() } }); res.json(goal);
}));

sdpRouter.delete('/goals/:goalId', asyncRoute(async (req, res) => {
  const sdp = await ownSdp((req as AuthedRequest).employeeId, false); if (!sdp) throw new ApiError(404, 'NOT_FOUND', 'SDP not found'); assertDraft(sdp.status);
  if (!sdp.goals.some((g) => g.goalId === req.params.goalId)) throw new ApiError(404, 'NOT_FOUND', 'Goal not found');
  await prisma.$transaction([prisma.goal.delete({ where: { goalId: req.params.goalId } }), prisma.sdp.update({ where: { sdpId: sdp.sdpId }, data: { version: { increment: 1 }, lastSavedAt: new Date() } })]); res.status(204).end();
}));

sdpRouter.post('/submit', asyncRoute(async (req, res) => {
  const { sharingScope } = z.object({ sharingScope: z.enum(['FULL', 'GOALS_ONLY']) }).parse(req.body); const auth = req as AuthedRequest; const sdp = await ownSdp(auth.employeeId, false);
  if (!sdp) throw new ApiError(422, 'SDP_INCOMPLETE', 'Complete your reflection and goals before submitting'); assertDraft(sdp.status);
  const errors: string[] = []; if (!sdp.reflection || sdp.reflection.q1Words.length < 1) errors.push('q1Words');
  for (const key of ['q2Text', 'q3Text', 'q4Text', 'q5Text', 'q6Text'] as const) if (!sdp.reflection || sdp.reflection[key].trim().length < 80) errors.push(key);
  if (sdp.goals.length < 1 || sdp.goals.length > 3) errors.push('goals'); sdp.goals.forEach((g, i) => { if (![g.title, g.whyItMatters, g.grownWhen, g.actionDo, g.actionLearn, g.actionConnect, g.supportNeeded].every((v) => v.trim())) errors.push(`goals.${i}`); });
  if (errors.length) throw new ApiError(422, 'SDP_INCOMPLETE', 'Complete all required SDP fields', errors); const employee = await prisma.employee.findUniqueOrThrow({ where: { employeeId: auth.employeeId } });
  const updated = await prisma.$transaction(async (tx) => { const saved = await tx.sdp.update({ where: { sdpId: sdp.sdpId }, data: { status: 'SUBMITTED', sharingScope, submittedAt: new Date(), managerEmployeeIdSnapshot: employee.managerEmployeeId, version: { increment: 1 } }, include: sdpInclude }); await tx.auditLog.create({ data: auditData({ actorEmployeeId: auth.employeeId, actorRole: 'EMPLOYEE', action: 'SDP_SUBMITTED', entityType: 'SDP', entityId: sdp.sdpId, subjectEmployeeId: auth.employeeId, metadata: { sharingScope }, ipAddress: req.ip }) }); return saved; }); res.json(serializeSdp(updated));
}));

sdpRouter.post('/confirm-conversation', asyncRoute(async (req, res) => {
  const auth = req as AuthedRequest; const sdp = await ownSdp(auth.employeeId, false); if (!sdp || sdp.status !== 'SUBMITTED') throw new ApiError(409, 'INVALID_TRANSITION', 'The SDP must be submitted first');
  const updated = await prisma.$transaction(async (tx) => { const saved = await tx.sdp.update({ where: { sdpId: sdp.sdpId }, data: { status: 'CONVERSATION_CONFIRMED', conversationConfirmedAt: new Date(), version: { increment: 1 } }, include: sdpInclude }); await tx.auditLog.create({ data: auditData({ actorEmployeeId: auth.employeeId, actorRole: 'EMPLOYEE', action: 'CONVERSATION_CONFIRMED', entityType: 'SDP', entityId: sdp.sdpId, subjectEmployeeId: auth.employeeId, ipAddress: req.ip }) }); return saved; }); res.json(serializeSdp(updated));
}));
