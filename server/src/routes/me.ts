import { Router } from 'express';
import type { Me } from '@sdp/shared';
import type { AuthedRequest } from '../middleware/auth';
import { seedEmployees, seedSdps } from '../data/seed';

export const meRouter = Router();

meRouter.get('/', (req, res) => {
  const { employeeId, roles } = req as unknown as AuthedRequest;
  const employee = seedEmployees.find((e) => e.employeeId === employeeId);
  if (!employee) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  const sdp = seedSdps.find((s) => s.employeeId === employeeId);

  const me: Me = {
    employee,
    roles,
    cycle: { cycleId: 'C2026-27', label: '2026-27', status: 'ACTIVE' },
    sdpStatus: sdp?.status ?? 'NOT_STARTED',
  };
  res.json(me);
});
