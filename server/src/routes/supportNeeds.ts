import { Router } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth';
import { prisma } from '../lib/db';
import { ApiError, asyncRoute } from '../lib/errors';
import { ownSdp } from '../lib/sdp';

export const supportNeedsRouter = Router();
supportNeedsRouter.get('/', asyncRoute(async (req, res) => { const sdp = await ownSdp((req as AuthedRequest).employeeId); res.json(sdp ? await prisma.supportNeed.findMany({ where: { sdpId: sdp.sdpId }, orderBy: { updatedAt: 'desc' } }) : []); }));
supportNeedsRouter.post('/', asyncRoute(async (req, res) => { const body = z.object({ supportNeedId: z.string().uuid().optional(), goalId: z.string().uuid().nullable().default(null), body: z.string().trim().min(1).max(10000) }).parse(req.body); const sdp = await ownSdp((req as AuthedRequest).employeeId); if (!sdp?.submittedAt) throw new ApiError(409, 'INVALID_TRANSITION', 'Submit the SDP before requesting support'); if (body.goalId && !sdp.goals.some((g) => g.goalId === body.goalId)) throw new ApiError(404, 'NOT_FOUND', 'Goal not found'); if (body.supportNeedId) { const result = await prisma.supportNeed.updateMany({ where: { supportNeedId: body.supportNeedId, sdpId: sdp.sdpId }, data: { body: body.body, goalId: body.goalId, status: 'OPEN', actionedAt: null, actionedBy: null } }); if (!result.count) throw new ApiError(404, 'NOT_FOUND', 'Support request not found'); res.json(await prisma.supportNeed.findUnique({ where: { supportNeedId: body.supportNeedId } })); return; } res.status(201).json(await prisma.supportNeed.create({ data: { sdpId: sdp.sdpId, goalId: body.goalId, body: body.body } })); }));
