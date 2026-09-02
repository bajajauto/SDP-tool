import { describe, expect, it } from 'vitest';
import { milestoneMap } from './lib/milestones';

describe('milestone state machine', () => {
  it('distinguishes DONE, PENDING, and NOT_DUE', () => {
    const map = milestoneMap({ submittedAt: new Date('2026-04-10'), conversationConfirmedAt: null, managerFeedback: [], checkIns: [], cycle: { q1WindowStart: new Date('2026-06-01'), midYearCutoff: new Date('2026-09-30'), q2WindowStart: new Date('2026-12-01'), yearEndCutoff: new Date('2027-03-15') } }, new Date('2026-05-01'));
    expect(map.SDP_SUBMITTED.state).toBe('DONE'); expect(map.GROWTH_CONVERSATION.state).toBe('PENDING'); expect(map.Q1_CHECKIN.state).toBe('NOT_DUE');
  });
});
