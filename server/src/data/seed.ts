import type { Employee, Goal, Reflection, Role, Sdp } from '@sdp/shared';

/**
 * Minimal in-memory seed for local development, standing in for the EC
 * mirror and the sdps table until the real database and EC sync land
 * (Phase 0, PRD Section 5). Not representative of the ~200/20/3/2 fixture
 * scale called for before real dashboard work starts.
 */
export const seedEmployees: Employee[] = [
  {
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
  },
  {
    employeeId: 'E010',
    fullName: 'Vikram Shah',
    email: 'vikram.shah@bajajauto.co.in',
    managerEmployeeId: null,
    buhrEmployeeId: 'E020',
    bu: 'Operations',
    function: 'Manufacturing',
    department: 'Plant 3',
    designation: 'Manager',
    buHeadEmployeeId: 'E030',
    hireDate: '2014-03-15',
    isActive: true,
  },
  {
    employeeId: 'E020',
    fullName: 'Priya Nair',
    email: 'priya.nair@bajajauto.co.in',
    managerEmployeeId: null,
    buhrEmployeeId: null,
    bu: 'Operations',
    function: 'Human Resources',
    department: 'HR Business Partnering',
    designation: 'HRBP',
    buHeadEmployeeId: 'E030',
    hireDate: '2016-01-10',
    isActive: true,
  },
];

const seedReflection: Reflection = {
  q1Words: ['Curious', 'Reliable', 'Calm'],
  q1Text: null,
  q2Text: 'I want to be known for staying calm during uncertainty and helping others think clearly when situations become stressful.',
  q3Text: 'I enjoy taking an ambiguous problem and breaking it into a structure that helps others understand what needs to happen next.',
  q4Text: 'During a supplier discussion, I was able to understand different viewpoints and find common ground.',
  q5Text: 'I delayed escalating a risk because I wanted to be completely sure first. My discomfort with uncertainty created more delay than the problem itself.',
  q6Text: 'I want to become someone who can confidently navigate ambiguity and help others stay focused during uncertainty.',
};

const seedGoals: Goal[] = [
  {
    goalId: 'G001',
    sortOrder: 1,
    title: 'Build deep root-cause analysis muscle',
    domain: 'FUNCTIONAL',
    whyItMatters: 'When a deviation comes up, I currently fix it well enough to get the line running again, but the same issue resurfaces weeks later.',
    grownWhen: 'A deviation I investigate does not reappear in the next production cycle.',
    actionPlan: {
      do: 'Apply 5-Why on every deviation I personally handle for the next quarter.',
      learn: 'Sit with the quality engineer on one real investigation each quarter.',
      connect: 'Ask the shift supervisor with the strongest track record to walk me through two of their reports.',
    },
    supportNeeded: 'Time for a structured RCA course.',
  },
];

export const seedSdps: Sdp[] = [
  {
    sdpId: 'S001',
    employeeId: 'E001',
    cycleId: 'C2026-27',
    status: 'SUBMITTED',
    sharingScope: 'FULL',
    submittedAt: '2026-04-18T00:00:00.000Z',
    conversationConfirmedAt: null,
    reflection: seedReflection,
    goals: seedGoals,
  },
];

export function resolveRoles(employeeId: string): Role[] {
  const roles: Role[] = ['EMPLOYEE'];
  if (seedEmployees.some((e) => e.managerEmployeeId === employeeId && e.isActive)) {
    roles.push('MANAGER');
  }
  if (seedEmployees.some((e) => e.buhrEmployeeId === employeeId && e.isActive)) {
    roles.push('BUHR');
  }
  return roles;
}
