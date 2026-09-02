import { prisma } from '../lib/db';
import { ApiError } from '../lib/errors';
import { auditData } from '../lib/audit';

export interface EcEmployeeRecord { employeeId: string; fullName: string; email: string; managerEmployeeId?: string; managerEmail?: string; buhrEmployeeId?: string; buhrEmail?: string; bu: string; function: string; department: string; designation: string; buHeadEmployeeId?: string; hireDate: string; isActive: boolean; }
export interface EcProvider { fetchEmployees(): Promise<EcEmployeeRecord[]>; }
export class MockEcProvider implements EcProvider { async fetchEmployees() { return [] as EcEmployeeRecord[]; } }

export async function runEcSync(provider: EcProvider, actorEmployeeId: string, ipAddress?: string) {
  const run = await prisma.syncRun.create({ data: {} });
  try {
    const records = await provider.fetchEmployees(); const previous = await prisma.syncRun.findFirst({ where: { status: 'COMPLETED', syncRunId: { not: run.syncRunId } }, orderBy: { completedAt: 'desc' } });
    if (previous?.sourceCount && records.length < previous.sourceCount * 0.5) { await prisma.syncRun.update({ where: { syncRunId: run.syncRunId }, data: { status: 'ABORTED', sourceCount: records.length, error: 'Source population below safety threshold', completedAt: new Date() } }); throw new ApiError(409, 'EC_SYNC_ABORTED', 'EC sync population was below the 50 percent safety threshold'); }
    let createdCount = 0, updatedCount = 0, flaggedCount = 0;
    await prisma.$transaction(async (tx) => { for (const record of records) { const gaps = [...(!record.managerEmployeeId ? ['MANAGER_NOT_MAPPED'] : []), ...(!record.buhrEmployeeId ? ['BUHR_NOT_MAPPED'] : [])]; const exists = await tx.employee.findUnique({ where: { employeeId: record.employeeId }, select: { employeeId: true } }); const data = { ...record, managerEmployeeId: record.managerEmployeeId ?? null, managerEmail: record.managerEmail ?? null, buhrEmployeeId: record.buhrEmployeeId ?? null, buhrEmail: record.buhrEmail ?? null, buHeadEmployeeId: record.buHeadEmployeeId ?? null, hireDate: new Date(record.hireDate), syncGaps: gaps, lastSyncedAt: new Date() }; await tx.employee.upsert({ where: { employeeId: record.employeeId }, create: data, update: data }); exists ? updatedCount++ : createdCount++; if (gaps.length) flaggedCount++; } });
    const completed = await prisma.syncRun.update({ where: { syncRunId: run.syncRunId }, data: { status: 'COMPLETED', sourceCount: records.length, createdCount, updatedCount, flaggedCount, completedAt: new Date() } }); await prisma.auditLog.create({ data: auditData({ actorEmployeeId, actorRole: 'TD_ADMIN', action: 'EC_SYNC_COMPLETED', entityType: 'SYNC_RUN', entityId: run.syncRunId, metadata: { sourceCount: records.length, createdCount, updatedCount, flaggedCount }, ipAddress }) }); return completed;
  } catch (error) { if (error instanceof ApiError) throw error; await prisma.syncRun.update({ where: { syncRunId: run.syncRunId }, data: { status: 'FAILED', error: error instanceof Error ? error.message : 'Unknown sync failure', completedAt: new Date() } }); throw error; }
}
