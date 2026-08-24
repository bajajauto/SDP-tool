import type {
  Employee, Goal, JournalEntry, Me, Milestone, Reflection, Role, SharingScope, TrackingRow,
} from '@sdp/shared';
import { MILESTONE_ORDER } from '@sdp/shared';

/**
 * Frontend-only mock data layer. There is no backend running yet (see
 * server/, kept on disk for when that work resumes). Every function here
 * has the same shape the real `/api/*` routes will have, so swapping this
 * module for real `fetch` calls later should not require touching any page.
 *
 * All roles are granted to the mock user so every screen (Employee,
 * Manager, BUHR) is reachable without a login/role switcher. Real role
 * derivation from EC mapping (FR-EC-004) replaces this once the backend
 * is back.
 */

const mockEmployee: Employee = {
  employeeId: 'E001',
  fullName: 'Asha Rao',
  email: 'asha.rao@bajajauto.co.in',
  managerEmployeeId: 'E010',
  buhrEmployeeId: 'E020',
  bu: 'Operations',
  function: 'Manufacturing',
  department: 'Plant 3',
  designation: 'Senior Engineer',
  buHeadEmployeeId: 'E030',
  hireDate: '2019-06-01',
  isActive: true,
};

const mockRoles: Role[] = ['EMPLOYEE', 'MANAGER', 'BUHR'];

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---- Journal (localStorage backed, mimics server-side per-employee isolation) ----
const JOURNAL_KEY = 'sdp_mock_journal_v1';

function loadJournal(): JournalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(JOURNAL_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveJournal(entries: JournalEntry[]) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
}

// ---- Team / reportees mock data ----
export interface TeamReportee {
  employeeId: string;
  fullName: string;
  designation: string;
  sharingScope: SharingScope | null;
  submittedAt: string | null;
}

export interface ReporteeDetail {
  employeeId: string;
  employeeName: string;
  sharingScope: SharingScope | null;
  submittedAt: string | null;
  goals: Goal[];
  reflection?: Reflection;
}

const mockGoal: Goal = {
  goalId: 'G100',
  sortOrder: 1,
  title: 'Improve incident response coordination across shifts',
  domain: 'LEADERSHIP',
  whyItMatters: 'We lose time and information at every shift change when an incident is open.',
  grownWhen: 'A live incident handed over from one shift to the next is picked up without repeating diagnosis.',
  actionPlan: {
    do: 'Build a one-page incident handover format with the supervisors of both shifts.',
    learn: 'Look at how the maintenance group runs incident bridges across geographies.',
    connect: 'Run a working session with the four shift leads.',
  },
  supportNeeded: 'Visible backing from my manager when I ask shift leads for time.',
};

const mockReportees: (TeamReportee & { reflection?: Reflection; goals: Goal[] })[] = [
  {
    employeeId: 'E002',
    fullName: 'Rohan Mehta',
    designation: 'Senior Production Engineer',
    sharingScope: 'FULL',
    submittedAt: '2026-04-18T00:00:00.000Z',
    goals: [mockGoal],
    reflection: {
      q1Words: ['Curious', 'Methodical'],
      q1Text: null,
      q2Text: 'Reliability under pressure, calm in escalations, and finishing what I start.',
      q3Text: 'Root-causing problems on the line, and mentoring younger operators.',
      q4Text: 'Led the Q3 retrofit with zero unplanned downtime.',
      q5Text: 'I sat on a safety audit concern for almost two weeks because I wanted to be completely sure.',
      q6Text: 'The engineer who can take a new line from concept to steady state.',
    },
  },
  {
    employeeId: 'E003',
    fullName: 'Arjun Patel',
    designation: 'Plant Operations Lead',
    sharingScope: 'GOALS_ONLY',
    submittedAt: '2026-03-30T00:00:00.000Z',
    goals: [{ ...mockGoal, goalId: 'G101', title: 'Develop a sharper read on equipment fatigue patterns', domain: 'FUNCTIONAL' }],
  },
];

// ---- BUHR tracking mock data ----
function buildTrackingRow(employeeName: string, managerName: string, department: string, doneThrough: number): TrackingRow {
  const milestones = {} as TrackingRow['milestones'];
  MILESTONE_ORDER.forEach((m: Milestone, i: number) => {
    milestones[m] = {
      state: i < doneThrough ? 'DONE' : i === doneThrough ? 'PENDING' : 'NOT_DUE',
      completedAt: i < doneThrough ? '2026-05-0' + (i + 1) + 'T00:00:00.000Z' : null,
    };
  });
  return {
    employeeId: employeeName.replace(/\s/g, '').toUpperCase(),
    employeeName,
    managerName,
    bu: 'Operations',
    department,
    sharingScope: doneThrough > 0 ? 'FULL' : null,
    milestones,
  };
}

const mockTracking: TrackingRow[] = [
  buildTrackingRow('Rohan Mehta', 'Vikram Singh', 'Production', 3),
  buildTrackingRow('Arjun Patel', 'Vikram Singh', 'Operations', 5),
  buildTrackingRow('Meera Iyer', 'Vikram Singh', 'Quality', 7),
  buildTrackingRow('Priya Sharma', 'Vikram Singh', 'Maintenance', 0),
];

export const api = {
  me: () => delay<Me>({
    employee: mockEmployee,
    roles: mockRoles,
    cycle: { cycleId: 'C2026-27', label: '2026-27', status: 'ACTIVE' },
    sdpStatus: 'SUBMITTED',
  }),
  journal: {
    list: () => delay([...loadJournal()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
    create: (body: string) => {
      const now = new Date().toISOString();
      const entry: JournalEntry = { entryId: crypto.randomUUID(), body, createdAt: now, updatedAt: now };
      const entries = [...loadJournal(), entry];
      saveJournal(entries);
      return delay(entry);
    },
    update: (entryId: string, body: string) => {
      const entries = loadJournal();
      const entry = entries.find((e) => e.entryId === entryId);
      if (entry) {
        entry.body = body;
        entry.updatedAt = new Date().toISOString();
        saveJournal(entries);
      }
      return delay(entry as JournalEntry);
    },
    remove: (entryId: string) => {
      saveJournal(loadJournal().filter((e) => e.entryId !== entryId));
      return delay(undefined);
    },
  },
  team: {
    list: () => delay<TeamReportee[]>(mockReportees.map(({ employeeId, fullName, designation, sharingScope, submittedAt }) => ({ employeeId, fullName, designation, sharingScope, submittedAt }))),
    detail: (employeeId: string) => {
      const r = mockReportees.find((x) => x.employeeId === employeeId);
      if (!r) return Promise.reject(new Error('NOT_FOUND'));
      const base: ReporteeDetail = {
        employeeId: r.employeeId,
        employeeName: r.fullName,
        sharingScope: r.sharingScope,
        submittedAt: r.submittedAt,
        goals: r.goals,
      };
      return delay(r.sharingScope === 'FULL' ? { ...base, reflection: r.reflection } : base);
    },
  },
  hr: {
    tracking: () => delay<TrackingRow[]>(mockTracking),
  },
};
