import { Router } from 'express';
import type { AuthedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { seedEmployees, seedSdps } from '../data/seed';
import { toTrackingRow } from '../lib/projection';

export const hrRouter = Router();

/**
 * FR-HR-001: scoped to the BUs the caller is mapped to as BUHR. No cross-BU
 * data is returned regardless of request parameters, so no BU filter is
 * ever read from the query string here.
 */
hrRouter.get('/tracking', requireRole('BUHR'), (req, res) => {
  const { employeeId } = req as unknown as AuthedRequest;
  const buhr = seedEmployees.find((e) => e.employeeId === employeeId);
  const scopedBus = new Set(
    seedEmployees.filter((e) => e.buhrEmployeeId === employeeId).map((e) => e.bu),
  );
  if (buhr) scopedBus.add(buhr.bu);

  const rows = seedEmployees
    .filter((e) => e.isActive && scopedBus.has(e.bu))
    .map((e) => {
      const manager = seedEmployees.find((m) => m.employeeId === e.managerEmployeeId);
      const sdp = seedSdps.find((s) => s.employeeId === e.employeeId);
      return toTrackingRow(e, manager?.fullName ?? '-', sdp);
    });

  res.json(rows);
});
