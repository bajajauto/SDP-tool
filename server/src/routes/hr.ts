import { Router } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth';
import { requireAnyRole } from '../middleware/auth';
import { prisma } from '../lib/db';
import { ApiError, asyncRoute } from '../lib/errors';
import { milestoneMap } from '../lib/milestones';

export const hrRouter = Router();
const querySchema = z.object({ search: z.string().max(100).optional(), bu: z.string().max(100).optional(), department: z.string().max(100).optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(200).default(50) });

hrRouter.get('/stage-deadlines', requireAnyRole('BUHR', 'TD_ADMIN'), asyncRoute(async (req, res) => {
  const auth = req as AuthedRequest;
  const isAdmin = auth.roles.includes('TD_ADMIN');
  const requestedBu = z.string().trim().min(1).max(100).optional().parse(req.query.bu);
  const businessUnitRows = await prisma.employee.findMany({ where: { isActive: true, ...(isAdmin ? {} : { buhrEmployeeId: auth.employeeId }) }, distinct: ['bu'], orderBy: { bu: 'asc' }, select: { bu: true } });
  const businessUnits = businessUnitRows.map((item) => item.bu);
  const bu = requestedBu ?? businessUnits[0];
  if (!bu || !businessUnits.includes(bu)) throw new ApiError(403, 'FORBIDDEN', 'You do not have access to this business unit');
  const cycle = await prisma.cycle.findFirst({ where: { status: 'ACTIVE' }, orderBy: { startDate: 'desc' } });
  if (!cycle) throw new ApiError(404, 'NOT_FOUND', 'No active cycle found');
  let rows = await prisma.stageDeadline.findMany({ where: { cycleId: cycle.cycleId, bu }, orderBy: { sortOrder: 'asc' } });
  let inheritedFrom: string | null = null;
  if (!rows.length) {
    const baseline = await prisma.stageDeadline.findFirst({ where: { cycleId: cycle.cycleId }, orderBy: [{ bu: 'asc' }, { sortOrder: 'asc' }] });
    if (baseline) { inheritedFrom = baseline.bu; rows = await prisma.stageDeadline.findMany({ where: { cycleId: cycle.cycleId, bu: baseline.bu }, orderBy: { sortOrder: 'asc' } }); }
  }
  res.json({ cycle: { cycleId: cycle.cycleId, label: cycle.label }, businessUnits, cohortId: rows[0]?.cohortId ?? null, cohortName: rows[0]?.cohortName ?? '', inheritedFrom, stages: rows.map((row) => ({ id: row.stageDeadlineId, name: row.name, deadline: row.deadline.toISOString().slice(0, 10), questions: row.questions })) });
}));

hrRouter.get('/tracking', requireAnyRole('BUHR', 'TD_ADMIN'), asyncRoute(async (req, res) => {
  const auth = req as AuthedRequest; const query = querySchema.parse(req.query); const isAdmin = auth.roles.includes('TD_ADMIN');
  const where: any = { isActive: true, ...(isAdmin ? {} : { buhrEmployeeId: auth.employeeId }), ...(query.bu && { bu: query.bu }), ...(query.department && { department: query.department }), ...(query.search && { OR: [{ fullName: { contains: query.search, mode: 'insensitive' } }, { employeeId: { contains: query.search, mode: 'insensitive' } }] }) };
  const [total, employees, activeCycle] = await prisma.$transaction([prisma.employee.count({ where }), prisma.employee.findMany({ where, include: { manager: { select: { fullName: true } }, buHead: { select: { fullName: true } }, buhr: { select: { fullName: true } }, sdps: { where: { cycle: { status: 'ACTIVE' } }, include: { managerFeedback: true, checkIns: true, cycle: true }, take: 1 } }, orderBy: { fullName: 'asc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }), prisma.cycle.findFirst({ where: { status: 'ACTIVE' } })]);
  // Status-only DTO by construction. No content relations are queried or serialised.
  const rows = employees.map((employee) => { const sdp = employee.sdps[0] ?? null; return { employeeId: employee.employeeId, employeeName: employee.fullName, managerName: employee.manager?.fullName ?? '-', jobLevel: employee.jobLevel, positionLevel: employee.positionLevel, company: employee.company, sector: employee.sector, bu: employee.bu, function: employee.function, department: employee.department, designation: employee.designation, baseLocation: employee.baseLocation, circle: employee.circle, ro: employee.ro, hub: employee.hub, buHeadName: employee.buHead?.fullName, buhrName: employee.buhr?.fullName, gender: employee.gender, topPotential: employee.topPotential == null ? undefined : employee.topPotential ? 'Top potential' : 'Not top potential', sharingScope: sdp?.sharingScope ?? null, milestones: milestoneMap(sdp, new Date(), activeCycle) }; });
  res.json({ data: rows, pagination: { page: query.page, pageSize: query.pageSize, total } });
}));
