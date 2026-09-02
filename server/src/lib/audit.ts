import type { Prisma, Role } from '@prisma/client';

export interface AuditInput {
  actorEmployeeId?: string;
  actorRole?: Role;
  action: string;
  entityType: string;
  entityId: string;
  subjectEmployeeId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
}

export function auditData(input: AuditInput): Prisma.AuditLogCreateInput {
  return {
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
    ipAddress: input.ipAddress,
    ...(input.actorEmployeeId ? { actor: { connect: { employeeId: input.actorEmployeeId } }, actorRole: input.actorRole } : {}),
    ...(input.subjectEmployeeId ? { subject: { connect: { employeeId: input.subjectEmployeeId } } } : {}),
  };
}
