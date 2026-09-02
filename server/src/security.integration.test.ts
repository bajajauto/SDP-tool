import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app';
import { prisma } from './lib/db';

const app = createApp();
afterAll(async () => { await prisma.journalEntry.deleteMany({ where: { body: { startsWith: 'TEST_ONLY_' } } }); await prisma.$disconnect(); });

describe('server-side privacy boundaries', () => {
  it('FR-NFR-012 isolates journals by authenticated employee', async () => {
    const created = await request(app).post('/api/journal').set('x-employee-id', 'E0001').send({ body: 'TEST_ONLY_PRIVATE' }).expect(201);
    const other = await request(app).get('/api/journal').set('x-employee-id', 'E0002').expect(200);
    expect(other.body.some((entry: { entryId: string }) => entry.entryId === created.body.entryId)).toBe(false);
    await request(app).patch(`/api/journal/${created.body.entryId}`).set('x-employee-id', 'E0002').send({ body: 'TEST_ONLY_STOLEN' }).expect(404);
  });

  it('FR-HR-006 returns a status-only tracking DTO', async () => {
    const response = await request(app).get('/api/hr/tracking?pageSize=5').set('x-employee-id', 'HR001').expect(200);
    const encoded = JSON.stringify(response.body);
    for (const forbidden of ['reflection', 'goals', 'feedback', 'progressNote', 'journal']) expect(encoded).not.toContain(`"${forbidden}"`);
  });

  it('FR-SYS-013 rejects role escalation', async () => {
    await request(app).get('/api/admin/audit').set('x-employee-id', 'E0001').expect(403);
  });

  it('FR-X-055 omits reflection for GOALS_ONLY sharing', async () => {
    const response = await request(app).get('/api/team/E0002').set('x-employee-id', 'M002').expect(200);
    expect(response.body.sharingScope).toBe('GOALS_ONLY'); expect(response.body).not.toHaveProperty('reflection');
  });
});
