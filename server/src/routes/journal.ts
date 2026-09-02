import { Router } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth';
import { ApiError, asyncRoute } from '../lib/errors';
import { journalRepository } from '../repositories/journal';

export const journalRouter = Router();
const bodySchema = z.object({ body: z.string().max(20000) });

journalRouter.get('/', asyncRoute(async (req, res) => res.json(await journalRepository.list((req as AuthedRequest).employeeId))));
journalRouter.post('/', asyncRoute(async (req, res) => { const { body } = bodySchema.parse(req.body); res.status(201).json(await journalRepository.create((req as AuthedRequest).employeeId, body)); }));
journalRouter.patch('/:entryId', asyncRoute(async (req, res) => { const employeeId = (req as AuthedRequest).employeeId; const { body } = bodySchema.parse(req.body); const result = await journalRepository.update(employeeId, req.params.entryId, body); if (!result.count) throw new ApiError(404, 'NOT_FOUND', 'Journal entry not found'); res.json(await journalRepository.findOwn(employeeId, req.params.entryId)); }));
journalRouter.delete('/:entryId', asyncRoute(async (req, res) => { const result = await journalRepository.remove((req as AuthedRequest).employeeId, req.params.entryId); if (!result.count) throw new ApiError(404, 'NOT_FOUND', 'Journal entry not found'); res.status(204).end(); }));
