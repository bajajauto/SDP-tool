import { Router } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { prisma } from '../lib/db';
import { ApiError, asyncRoute } from '../lib/errors';
import { auditData } from '../lib/audit';
import { MockEcProvider, runEcSync } from '../services/ecSync';
import { randomUUID } from 'node:crypto';
import { corporateEmailWhere, isBajajAutoEmail } from '../lib/corporateEmail';

export const adminRouter = Router(); adminRouter.use(requireRole('TD_ADMIN'));
adminRouter.get('/cycle', asyncRoute(async (_req, res) => res.json(await prisma.cycle.findFirst({ where: { status: 'ACTIVE' } }))));
adminRouter.put('/cycle', asyncRoute(async (req, res) => { const body = z.object({ label: z.string().min(1).max(30), startDate: z.coerce.date(), hireDateCutoff: z.coerce.date(), q1WindowStart: z.coerce.date(), q1WindowEnd: z.coerce.date(), midYearCutoff: z.coerce.date(), q2WindowStart: z.coerce.date(), q2WindowEnd: z.coerce.date(), yearEndCutoff: z.coerce.date(), status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED']) }).parse(req.body); const auth = req as AuthedRequest; const saved = await prisma.$transaction(async (tx) => { if (body.status === 'ACTIVE') await tx.cycle.updateMany({ where: { status: 'ACTIVE', label: { not: body.label } }, data: { status: 'CLOSED' } }); const cycle = await tx.cycle.upsert({ where: { label: body.label }, create: body, update: body }); await tx.auditLog.create({ data: auditData({ actorEmployeeId: auth.employeeId, actorRole: 'TD_ADMIN', action: 'CYCLE_CONFIGURED', entityType: 'CYCLE', entityId: cycle.cycleId, ipAddress: req.ip }) }); return cycle; }); res.json(saved); }));
adminRouter.post('/cycle/reopen', asyncRoute(async (req, res) => { const { employeeId } = z.object({ employeeId: z.string().optional() }).parse(req.body); const auth = req as AuthedRequest; const cycle = await prisma.cycle.findFirst({ where: { status: { in: ['ACTIVE', 'CLOSED'] } }, orderBy: { startDate: 'desc' } }); if (!cycle) throw new ApiError(404, 'NOT_FOUND', 'Cycle not found'); await prisma.$transaction(async (tx) => { await tx.cycle.update({ where: { cycleId: cycle.cycleId }, data: { status: 'ACTIVE', isReopened: true } }); if (employeeId) await tx.sdp.updateMany({ where: { cycleId: cycle.cycleId, employeeId }, data: { status: 'DRAFT', sharingScope: null, submittedAt: null } }); await tx.auditLog.create({ data: auditData({ actorEmployeeId: auth.employeeId, actorRole: 'TD_ADMIN', action: 'CYCLE_REOPENED', entityType: employeeId ? 'SDP' : 'CYCLE', entityId: employeeId ?? cycle.cycleId, subjectEmployeeId: employeeId, ipAddress: req.ip }) }); }); res.status(204).end(); }));
adminRouter.get('/audit', asyncRoute(async (req, res) => { const page = z.coerce.number().int().min(1).default(1).parse(req.query.page); const pageSize = z.coerce.number().int().min(1).max(200).default(50).parse(req.query.pageSize); res.json(await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize })); }));
adminRouter.get('/data-gaps', asyncRoute(async (_req, res) => res.json(await prisma.employee.findMany({ where: { isActive: true, syncGaps: { isEmpty: false } }, select: { employeeId: true, fullName: true, bu: true, syncGaps: true, lastSyncedAt: true } }))));
adminRouter.post('/ec-sync', asyncRoute(async (req, res) => res.status(202).json(await runEcSync(new MockEcProvider(), (req as AuthedRequest).employeeId, req.ip))));
adminRouter.get('/templates', asyncRoute(async (_req, res) => res.json(await prisma.emailTemplate.findMany({ orderBy: { key: 'asc' } }))));
adminRouter.put('/templates/:key', asyncRoute(async (req, res) => { const body = z.object({ subject: z.string().min(1).max(300), bodyHtml: z.string().min(1).max(50000) }).parse(req.body); const existing = await prisma.emailTemplate.findFirst({ where: { key: req.params.key, scope: 'TD_ADMIN', buId: null } }); res.json(existing ? await prisma.emailTemplate.update({ where: { templateId: existing.templateId }, data: { ...body, updatedBy: (req as AuthedRequest).employeeId } }) : await prisma.emailTemplate.create({ data: { key: req.params.key, scope: 'TD_ADMIN', ...body, updatedBy: (req as AuthedRequest).employeeId } })); }));
adminRouter.get('/email-recipients', asyncRoute(async (_req, res) => {
  const employees = await prisma.employee.findMany({ where: { isActive: true, email: corporateEmailWhere }, orderBy: { fullName: 'asc' }, select: { employeeId: true, fullName: true, email: true, bu: true, designation: true, cohortAssignments: { where: { cycle: { status: 'ACTIVE' } }, take: 1, select: { cohortId: true, cohort: { select: { name: true } } } } } });
  res.json(employees.map(({ cohortAssignments, ...employee }) => ({ ...employee, cohortId: cohortAssignments[0]?.cohortId ?? null, cohortName: cohortAssignments[0]?.cohort.name ?? null })));
}));
adminRouter.post('/emails/send', asyncRoute(async (req, res) => {
  const body = z.object({ templateKey: z.enum(['AUTO_SDP_SUBMITTED', 'AUTO_FEEDBACK_SHARED', 'AUTO_CHECKIN_COMPLETED']), recipients: z.array(z.string().email()).min(1).max(500), subject: z.string().trim().min(1).max(300), bodyHtml: z.string().trim().min(1).max(50000) }).parse(req.body);
  const recipients = [...new Set(body.recipients.map((email) => email.trim().toLowerCase()))];
  if (recipients.some((email) => !isBajajAutoEmail(email))) throw new ApiError(400, 'CORPORATE_EMAIL_REQUIRED', 'All recipients must use a bajajauto.co.in email address');
  const auth = req as AuthedRequest; const actor = await prisma.employee.findUniqueOrThrow({ where: { employeeId: auth.employeeId }, select: { email: true } });
  await prisma.$transaction(async (tx) => {
    await tx.emailLog.createMany({ data: recipients.map((toEmail) => ({ templateKey: body.templateKey, toEmail, fromEmail: actor.email, subject: body.subject, triggeredBy: auth.employeeId, idempotencyKey: `manual:${auth.employeeId}:${randomUUID()}` })) });
    await tx.auditLog.create({ data: auditData({ actorEmployeeId: auth.employeeId, actorRole: 'TD_ADMIN', action: 'MANUAL_EMAIL_QUEUED', entityType: 'EMAIL_TEMPLATE', entityId: body.templateKey, metadata: { recipientCount: recipients.length }, ipAddress: req.ip }) });
  });
  res.status(202).json({ queued: recipients.length });
}));

const questionSchema = z.object({ id: z.string().trim().min(1).max(80), prompt: z.string().trim().min(1).max(300), type: z.enum(['TEXT', 'SCALE']), placeholder: z.string().max(300).optional() });
const stageSchema = z.object({ name: z.string().trim().min(1).max(100), deadline: z.coerce.date(), questions: z.array(questionSchema).min(1).max(10) });
adminRouter.get('/stage-deadlines/cohorts', asyncRoute(async (_req, res) => {
  const cycle = await prisma.cycle.findFirst({ where: { status: 'ACTIVE' }, orderBy: { startDate: 'desc' } });
  if (!cycle) throw new ApiError(404, 'NOT_FOUND', 'No active cycle found');
  const [rows, participantGroups] = await Promise.all([
    prisma.stageDeadline.findMany({ where: { cycleId: cycle.cycleId }, orderBy: [{ bu: 'asc' }, { sortOrder: 'asc' }] }),
    prisma.employee.groupBy({ by: ['bu'], where: { isActive: true }, _count: { employeeId: true } }),
  ]);
  const participants = new Map(participantGroups.map((group) => [group.bu, group._count.employeeId]));
  const cohorts = new Map<string, { cohortId: string; cohortName: string; bu: string; checkInCount: number; nextDeadline: string | null; participants: number }>();
  for (const row of rows) {
    const current = cohorts.get(row.bu);
    const deadline = row.deadline.toISOString().slice(0, 10);
    cohorts.set(row.bu, { cohortId: row.cohortId, cohortName: row.cohortName, bu: row.bu, checkInCount: (current?.checkInCount ?? 0) + 1, nextDeadline: !current?.nextDeadline || deadline < current.nextDeadline ? deadline : current.nextDeadline, participants: participants.get(row.bu) ?? 0 });
  }
  res.json({ cycle: { cycleId: cycle.cycleId, label: cycle.label }, cohorts: [...cohorts.values()] });
}));
adminRouter.get('/stage-deadlines', asyncRoute(async (req, res) => {
  const requestedBu = z.string().trim().min(1).max(100).optional().parse(req.query.bu);
  const cycle = await prisma.cycle.findFirst({ where: { status: 'ACTIVE' }, orderBy: { startDate: 'desc' } });
  if (!cycle) throw new ApiError(404, 'NOT_FOUND', 'No active cycle found');
  const businessUnits = await prisma.employee.findMany({ where: { isActive: true }, distinct: ['bu'], orderBy: { bu: 'asc' }, select: { bu: true } });
  const bu = requestedBu ?? businessUnits[0]?.bu;
  if (!bu) throw new ApiError(404, 'NOT_FOUND', 'No business units found');
  let rows = await prisma.stageDeadline.findMany({ where: { cycleId: cycle.cycleId, bu }, orderBy: { sortOrder: 'asc' } });
  let inheritedFrom: string | null = null;
  if (!rows.length) {
    const baseline = await prisma.stageDeadline.findFirst({ where: { cycleId: cycle.cycleId }, orderBy: [{ bu: 'asc' }, { sortOrder: 'asc' }] });
    if (baseline) {
      inheritedFrom = baseline.bu;
      rows = await prisma.stageDeadline.findMany({ where: { cycleId: cycle.cycleId, bu: baseline.bu }, orderBy: { sortOrder: 'asc' } });
    }
  }
  res.json({ cycle: { cycleId: cycle.cycleId, label: cycle.label }, businessUnits: businessUnits.map((item) => item.bu), cohortId: rows[0]?.cohortId ?? null, cohortName: rows[0]?.cohortName ?? '', inheritedFrom, stages: rows.map((row) => ({ id: row.stageDeadlineId, name: row.name, deadline: row.deadline.toISOString().slice(0, 10), questions: row.questions })) });
}));
adminRouter.put('/stage-deadlines', asyncRoute(async (req, res) => {
  const body = z.object({ bu: z.string().trim().min(1).max(100), cohortId: z.string().min(1).nullable().optional(), cohortName: z.string().trim().min(1).max(100), businessUnits: z.array(z.string().trim().min(1).max(100)).max(100).optional(), stages: z.array(stageSchema).min(1).max(30), applyToAll: z.boolean().default(false) }).parse(req.body);
  const cycle = await prisma.cycle.findFirst({ where: { status: 'ACTIVE' }, orderBy: { startDate: 'desc' } });
  if (!cycle) throw new ApiError(404, 'NOT_FOUND', 'No active cycle found');
  const selectedBu = await prisma.employee.findFirst({ where: { isActive: true, bu: body.bu }, select: { bu: true } });
  if (!selectedBu) throw new ApiError(404, 'NOT_FOUND', 'Business unit not found');
  const availableBusinessUnits = (await prisma.employee.findMany({ where: { isActive: true }, distinct: ['bu'], select: { bu: true } })).map((item) => item.bu);
  const businessUnits = body.applyToAll ? availableBusinessUnits : body.businessUnits?.length ? body.businessUnits : [body.bu];
  if (businessUnits.some((bu) => !availableBusinessUnits.includes(bu))) throw new ApiError(404, 'NOT_FOUND', 'One or more business units were not found');
  const auth = req as AuthedRequest;
  const cohort = await prisma.$transaction(async (tx) => {
    const existingStage = await tx.stageDeadline.findFirst({ where: { cycleId: cycle.cycleId, bu: body.bu } });
    const existingCohort = body.cohortId ? await tx.cohort.findFirst({ where: { cohortId: body.cohortId, cycleId: cycle.cycleId } }) : existingStage ? await tx.cohort.findUnique({ where: { cohortId: existingStage.cohortId } }) : await tx.cohort.findUnique({ where: { cycleId_name: { cycleId: cycle.cycleId, name: body.cohortName } } });
    const cohort = existingCohort ? await tx.cohort.update({ where: { cohortId: existingCohort.cohortId }, data: { name: body.cohortName } }) : await tx.cohort.create({ data: { cycleId: cycle.cycleId, name: body.cohortName } });
    await tx.stageDeadline.deleteMany({ where: { cycleId: cycle.cycleId, bu: { in: businessUnits } } });
    await tx.stageDeadline.createMany({ data: businessUnits.flatMap((bu) => body.stages.map((stage, sortOrder) => ({ cycleId: cycle.cycleId, cohortId: cohort.cohortId, bu, cohortName: body.cohortName, name: stage.name, deadline: stage.deadline, questions: stage.questions, sortOrder }))) });
    const employees = await tx.employee.findMany({ where: { isActive: true, bu: { in: businessUnits } }, select: { employeeId: true } });
    for (const employee of employees) await tx.cohortAssignment.upsert({ where: { employeeId_cycleId: { employeeId: employee.employeeId, cycleId: cycle.cycleId } }, create: { cohortId: cohort.cohortId, cycleId: cycle.cycleId, employeeId: employee.employeeId }, update: { cohortId: cohort.cohortId, assignedAt: new Date() } });
    await tx.sdp.updateMany({ where: { cycleId: cycle.cycleId, employeeId: { in: employees.map((employee) => employee.employeeId) } }, data: { cohortId: cohort.cohortId } });
    await tx.auditLog.create({ data: auditData({ actorEmployeeId: auth.employeeId, actorRole: 'TD_ADMIN', action: body.applyToAll ? 'STAGE_DEADLINES_APPLIED_TO_ALL_BUS' : 'STAGE_DEADLINES_UPDATED', entityType: 'COHORT', entityId: cohort.cohortId, metadata: { bu: body.bu, businessUnits, stageCount: body.stages.length, cycleId: cycle.cycleId }, ipAddress: req.ip }) });
    return cohort;
  });
  res.json({ cohortId: cohort.cohortId, bu: body.bu, appliedBusinessUnits: businessUnits.length, stages: body.stages.map((stage, index) => ({ id: `${body.bu}-${index}`, name: stage.name, deadline: stage.deadline.toISOString().slice(0, 10), questions: stage.questions })) });
}));
adminRouter.delete('/stage-deadlines', asyncRoute(async (req, res) => {
  const bu = z.string().trim().min(1).max(100).parse(req.query.bu);
  const cycle = await prisma.cycle.findFirst({ where: { status: 'ACTIVE' }, orderBy: { startDate: 'desc' } });
  if (!cycle) throw new ApiError(404, 'NOT_FOUND', 'No active cycle found');
  const employees = await prisma.employee.findMany({ where: { bu }, select: { employeeId: true } });
  const employeeIds = employees.map((employee) => employee.employeeId);
  const existing = await prisma.stageDeadline.findFirst({ where: { cycleId: cycle.cycleId, bu } });
  if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Cohort setup not found');
  const auth = req as AuthedRequest;
  await prisma.$transaction(async (tx) => {
    await tx.stageDeadline.deleteMany({ where: { cycleId: cycle.cycleId, bu } });
    await tx.cohortAssignment.deleteMany({ where: { cycleId: cycle.cycleId, employeeId: { in: employeeIds }, cohortId: existing.cohortId } });
    await tx.sdp.updateMany({ where: { cycleId: cycle.cycleId, employeeId: { in: employeeIds }, cohortId: existing.cohortId }, data: { cohortId: null } });
    const remaining = await tx.stageDeadline.count({ where: { cohortId: existing.cohortId } });
    if (!remaining) await tx.cohort.delete({ where: { cohortId: existing.cohortId } });
    await tx.auditLog.create({ data: auditData({ actorEmployeeId: auth.employeeId, actorRole: 'TD_ADMIN', action: 'COHORT_SETUP_DELETED', entityType: 'COHORT', entityId: existing.cohortId, metadata: { bu, cycleId: cycle.cycleId }, ipAddress: req.ip }) });
  });
  res.status(204).end();
}));
