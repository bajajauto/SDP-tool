import { Router } from 'express';
import type { AuthedRequest } from '../middleware/auth';
import { seedSdps } from '../data/seed';

export const sdpRouter = Router();

sdpRouter.get('/', (req, res) => {
  const { employeeId } = req as unknown as AuthedRequest;
  const sdp = seedSdps.find((s) => s.employeeId === employeeId);
  if (!sdp) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }
  res.json(sdp);
});
