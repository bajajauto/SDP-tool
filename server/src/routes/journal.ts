import { Router } from 'express';
import type { JournalEntry } from '@sdp/shared';
import type { AuthedRequest } from '../middleware/auth';

export const journalRouter = Router();

/**
 * Journal isolation (CLAUDE.md non-negotiable #1, PRD FR-EMP-088,
 * FR-NFR-012). Every query below is filtered by the authenticated
 * employee ID taken from the identity middleware, never from a request
 * parameter or body. There is no route here that accepts an employeeId.
 */
const journalsByEmployee = new Map<string, JournalEntry[]>();

function ownEntries(employeeId: string): JournalEntry[] {
  if (!journalsByEmployee.has(employeeId)) {
    journalsByEmployee.set(employeeId, []);
  }
  return journalsByEmployee.get(employeeId)!;
}

journalRouter.get('/', (req, res) => {
  const { employeeId } = req as unknown as AuthedRequest;
  const entries = [...ownEntries(employeeId)].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  res.json(entries);
});

journalRouter.post('/', (req, res) => {
  const { employeeId } = req as unknown as AuthedRequest;
  const now = new Date().toISOString();
  const entry: JournalEntry = {
    entryId: crypto.randomUUID(),
    body: typeof req.body?.body === 'string' ? req.body.body : '',
    createdAt: now,
    updatedAt: now,
  };
  ownEntries(employeeId).push(entry);
  res.status(201).json(entry);
});

journalRouter.patch('/:entryId', (req, res) => {
  const { employeeId } = req as unknown as AuthedRequest;
  const entry = ownEntries(employeeId).find((e) => e.entryId === req.params.entryId);
  if (!entry) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }
  entry.body = typeof req.body?.body === 'string' ? req.body.body : entry.body;
  entry.updatedAt = new Date().toISOString();
  res.json(entry);
});

journalRouter.delete('/:entryId', (req, res) => {
  const { employeeId } = req as unknown as AuthedRequest;
  const entries = ownEntries(employeeId);
  const index = entries.findIndex((e) => e.entryId === req.params.entryId);
  if (index === -1) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }
  entries.splice(index, 1);
  res.status(204).end();
});
