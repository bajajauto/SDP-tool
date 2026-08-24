import { Router } from 'express';
import type { AuthedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { seedEmployees, seedSdps } from '../data/seed';

export const teamRouter = Router();

/** FR-MGR-006: only direct reportees, from EC manager mapping. */
teamRouter.get('/', requireRole('MANAGER'), (req, res) => {
  const { employeeId } = req as unknown as AuthedRequest;
  const reportees = seedEmployees
    .filter((e) => e.managerEmployeeId === employeeId && e.isActive)
    .map((e) => {
      const sdp = seedSdps.find((s) => s.employeeId === e.employeeId);
      return {
        employeeId: e.employeeId,
        fullName: e.fullName,
        designation: e.designation,
        sharingScope: sdp?.sharingScope ?? null,
        submittedAt: sdp?.submittedAt ?? null,
      };
    });
  res.json(reportees);
});

/**
 * FR-MGR-010 / FR-X-055: the reportee DTO is selected by scope before
 * serialisation. A GOALS_ONLY response must not contain reflection fields
 * anywhere in the payload, so `reflection` is omitted from the object
 * entirely rather than sent as null or filtered client side.
 */
teamRouter.get('/:employeeId', requireRole('MANAGER'), (req, res) => {
  const { employeeId: managerId } = req as unknown as AuthedRequest;
  const reportee = seedEmployees.find(
    (e) => e.employeeId === req.params.employeeId && e.managerEmployeeId === managerId && e.isActive,
  );
  if (!reportee) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }
  const sdp = seedSdps.find((s) => s.employeeId === reportee.employeeId);
  if (!sdp) {
    res.status(404).json({ error: 'NO_SDP' });
    return;
  }

  const base = {
    employeeId: reportee.employeeId,
    employeeName: reportee.fullName,
    sharingScope: sdp.sharingScope,
    submittedAt: sdp.submittedAt,
    goals: sdp.goals,
  };

  if (sdp.sharingScope === 'FULL') {
    res.json({ ...base, reflection: sdp.reflection });
    return;
  }
  res.json(base);
});
