import { prisma } from '../lib/db';

// Ownership is mandatory in every repository method. No unscoped journal accessor exists.
export const journalRepository = {
  list: (employeeId: string) => prisma.journalEntry.findMany({ where: { employeeId, deletedAt: null }, orderBy: { createdAt: 'desc' }, select: { entryId: true, body: true, createdAt: true, updatedAt: true } }),
  create: (employeeId: string, body: string) => prisma.journalEntry.create({ data: { employeeId, body }, select: { entryId: true, body: true, createdAt: true, updatedAt: true } }),
  update: (employeeId: string, entryId: string, body: string) => prisma.journalEntry.updateMany({ where: { employeeId, entryId, deletedAt: null }, data: { body } }),
  findOwn: (employeeId: string, entryId: string) => prisma.journalEntry.findFirst({ where: { employeeId, entryId, deletedAt: null }, select: { entryId: true, body: true, createdAt: true, updatedAt: true } }),
  remove: (employeeId: string, entryId: string) => prisma.journalEntry.updateMany({ where: { employeeId, entryId, deletedAt: null }, data: { deletedAt: new Date(), body: '' } }),
};
