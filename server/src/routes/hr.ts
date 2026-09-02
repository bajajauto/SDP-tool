import { Router } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth';
import { requireAnyRole } from '../middleware/auth';
import { prisma } from '../lib/db';
import { asyncRoute } from '../lib/errors';
import { milestoneMap } from '../lib/milestones';

export const hrRouter = Router();
const querySchema = z.object({ search: z.string().max(100).optional(), bu: z.string().max(100).optional(), department: z.string().max(100).optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(200).default(50) });

hrRouter.get('/tracking', requireAnyRole('BUHR', 'TD_ADMIN'), asyncRoute(async (req, res) => {
  const auth = req as AuthedRequest; const query = querySchema.parse(req.query); const isAdmin = auth.roles.includes('TD_ADMIN');
  const where: any = { isActive: true, ...(isAdmin ? {} : { buhrEmployeeId: auth.employeeId }), ...(query.bu && { bu: query.bu }), ...(query.department && { department: query.department }), ...(query.search && { OR: [{ fullName: { contains: query.search, mode: 'insensitive' } }, { employeeId: { contains: query.search, mode: 'insensitive' } }] }) };
  const [total, employees] = await prisma.$transaction([prisma.employee.count({ where }), prisma.employee.findMany({ where, include: { manager: { select: { fullName: true } }, sdps: { where: { cycle: { status: 'ACTIVE' } }, include: { managerFeedback: true, checkIns: true, cycle: true }, take: 1 } }, orderBy: { fullName: 'asc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize })]);
  // Status-only DTO by construction. No content relations are queried or serialised.
  const rows = employees.map((employee) => { const sdp = employee.sdps[0] ?? null; return { employeeId: employee.employeeId, employeeName: employee.fullName, managerName: employee.manager?.fullName ?? '-', bu: employee.bu, department: employee.department, sharingScope: sdp?.sharingScope ?? null, milestones: milestoneMap(sdp) }; });
  res.json({ data: rows, pagination: { page: query.page, pageSize: query.pageSize, total } });
}));
