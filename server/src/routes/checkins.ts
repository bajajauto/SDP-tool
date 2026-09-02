import { Router } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth';
import { prisma } from '../lib/db';
import { ApiError, asyncRoute } from '../lib/errors';
import { ownSdp } from '../lib/sdp';
import { auditData } from '../lib/audit';

export const checkInsRouter = Router();
checkInsRouter.get('/', asyncRoute(async (req, res) => { const period = z.enum(['Q1', 'MID_YEAR', 'Q2', 'YEAR_END']).optional().parse(req.query.period); const sdp = await ownSdp((req as AuthedRequest).employeeId); res.json(sdp ? await prisma.checkIn.findMany({ where: { sdpId: sdp.sdpId, ...(period && { period }) }, orderBy: { submittedAt: 'desc' } }) : []); }));
checkInsRouter.post('/', asyncRoute(async (req, res) => {
  const body = z.object({ goalId: z.string().uuid().nullable().default(null), period: z.enum(['Q1', 'MID_YEAR', 'Q2', 'YEAR_END']), progressNote: z.string().trim().min(1).max(10000), status: z.enum(['IN_PROGRESS', 'ON_TRACK', 'AT_RISK', 'ACHIEVED']) }).parse(req.body); const auth = req as AuthedRequest; const sdp = await ownSdp(auth.employeeId);
  if (!sdp || !['CONVERSATION_CONFIRMED', 'IN_PROGRESS'].includes(sdp.status)) throw new ApiError(409, 'INVALID_TRANSITION', 'Confirm the growth conversation before check-ins'); if (body.goalId && !sdp.goals.some((g) => g.goalId === body.goalId)) throw new ApiError(404, 'NOT_FOUND', 'Goal not found');
  const item = await prisma.$transaction(async (tx) => { const created = await tx.checkIn.create({ data: { sdpId: sdp.sdpId, ...body } }); await tx.sdp.update({ where: { sdpId: sdp.sdpId }, data: { status: 'IN_PROGRESS' } }); await tx.auditLog.create({ data: auditData({ actorEmployeeId: auth.employeeId, actorRole: 'EMPLOYEE', action: 'CHECKIN_SUBMITTED', entityType: 'CHECK_IN', entityId: created.checkInId, subjectEmployeeId: auth.employeeId, metadata: { period: body.period }, ipAddress: req.ip }) }); return created; }); res.status(201).json(item);
}));
