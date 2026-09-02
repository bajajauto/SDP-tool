import { Router } from 'express';
import type { Me } from '@sdp/shared';
import type { AuthedRequest } from '../middleware/auth';
import { prisma } from '../lib/db';
import { asyncRoute, ApiError } from '../lib/errors';

export const meRouter = Router();

meRouter.get('/', asyncRoute(async (req, res) => {
  const { employeeId, roles } = req as unknown as AuthedRequest;
  const employee = await prisma.employee.findUnique({ where: { employeeId } });
  if (!employee) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  const cycle = await prisma.cycle.findFirst({ where: { status: 'ACTIVE' } });
  if (!cycle) throw new ApiError(409, 'NO_ACTIVE_CYCLE', 'There is no active SDP cycle');
  const sdp = await prisma.sdp.findUnique({ where: { employeeId_cycleId: { employeeId, cycleId: cycle.cycleId } } });

  const me: Me = {
    employee: {
      employeeId: employee.employeeId, fullName: employee.fullName, email: employee.email,
      managerEmployeeId: employee.managerEmployeeId, buhrEmployeeId: employee.buhrEmployeeId,
      bu: employee.bu, function: employee.function, department: employee.department,
      designation: employee.designation, buHeadEmployeeId: employee.buHeadEmployeeId,
      hireDate: employee.hireDate.toISOString().slice(0, 10), isActive: employee.isActive,
    },
    roles,
    cycle: { cycleId: cycle.cycleId, label: cycle.label, status: cycle.status },
    sdpStatus: sdp?.status ?? 'NOT_STARTED',
  };
  res.json(me);
}));
