import type { Goal, GoalDomain, JournalEntry, Me, Reflection, Sdp, SharingScope, TrackingRow } from '@sdp/shared';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
const DEFAULT_DEV_EMPLOYEE_ID = (import.meta.env.VITE_DEV_EMPLOYEE_ID as string | undefined) ?? 'E0001';

/**
 * Dev-mode identity is switchable at runtime (per FR-SYS-010's stub: the
 * server trusts whatever `x-employee-id` we send). This is what lets the
 * four login demo profiles actually authenticate as different seeded
 * employees, instead of every role hitting the API as the same person.
 * Real SSO replaces all of this with a server-side session cookie.
 */
const DEV_IDENTITY_KEY = 'sdp_dev_employee_id_v1';

export function getDevEmployeeId(): string {
  try {
    return localStorage.getItem(DEV_IDENTITY_KEY) || DEFAULT_DEV_EMPLOYEE_ID;
  } catch {
    return DEFAULT_DEV_EMPLOYEE_ID;
  }
}

export function setDevEmployeeId(employeeId: string) {
  try {
    localStorage.setItem(DEV_IDENTITY_KEY, employeeId);
  } catch {
    // ignore, falls back to the default on next read
  }
}

export function clearDevEmployeeId() {
  try {
    localStorage.removeItem(DEV_IDENTITY_KEY);
  } catch {
    // ignore
  }
}

/** Real seeded employees (server/prisma/seed.ts) the four demo login cards map to. */
export const DEMO_IDENTITIES = {
  employee: 'E0001',
  manager: 'M001',
  buhr: 'HR001',
  tdadmin: 'ADMIN001',
} as const;

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message); }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'content-type': 'application/json', 'x-employee-id': getDevEmployeeId(), ...init?.headers },
  });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, payload?.error?.code ?? 'REQUEST_FAILED', payload?.error?.message ?? 'Request failed', payload?.error?.details);
  return payload as T;
}

export interface TeamReportee { employeeId: string; fullName: string; designation: string; sharingScope: SharingScope | null; submittedAt: string | null; }
export interface ReporteeDetail { employeeId: string; employeeName: string; sharingScope: SharingScope | null; submittedAt: string | null; goals: Goal[]; reflection?: Reflection; }

/**
 * POST/PATCH /sdp/goals echo the raw Prisma row (flat actionDo/actionLearn/
 * actionConnect columns), not the nested `actionPlan` shape the rest of the
 * API uses. SdpContext maps between the two; this is the wire shape.
 */
export interface RawGoal {
  goalId: string;
  sortOrder: number;
  title: string;
  domain: GoalDomain;
  whyItMatters: string;
  grownWhen: string;
  actionDo: string;
  actionLearn: string;
  actionConnect: string;
  supportNeeded: string;
}

export interface GoalPatchBody {
  title?: string;
  domain?: GoalDomain;
  whyItMatters?: string;
  grownWhen?: string;
  actionPlan?: { do?: string; learn?: string; connect?: string };
  supportNeeded?: string;
}

export const api = {
  me: () => request<Me>('/me'),
  sdp: {
    get: () => request<Sdp>('/sdp'),
    patchReflection: (body: Partial<Reflection>) => request<Sdp>('/sdp/reflection', { method: 'PATCH', body: JSON.stringify(body) }),
    createGoal: (body: GoalPatchBody) => request<RawGoal>('/sdp/goals', { method: 'POST', body: JSON.stringify(body) }),
    patchGoal: (goalId: string, body: GoalPatchBody) => request<RawGoal>(`/sdp/goals/${goalId}`, { method: 'PATCH', body: JSON.stringify(body) }),
    removeGoal: (goalId: string) => request<void>(`/sdp/goals/${goalId}`, { method: 'DELETE' }),
    submit: (sharingScope: SharingScope) => request<Sdp>('/sdp/submit', { method: 'POST', body: JSON.stringify({ sharingScope }) }),
    confirmConversation: () => request<Sdp>('/sdp/confirm-conversation', { method: 'POST' }),
  },
  journal: {
    list: () => request<JournalEntry[]>('/journal'),
    create: (body: string) => request<JournalEntry>('/journal', { method: 'POST', body: JSON.stringify({ body }) }),
    update: (entryId: string, body: string) => request<JournalEntry>(`/journal/${entryId}`, { method: 'PATCH', body: JSON.stringify({ body }) }),
    remove: (entryId: string) => request<void>(`/journal/${entryId}`, { method: 'DELETE' }),
  },
  team: { list: () => request<TeamReportee[]>('/team'), detail: (employeeId: string) => request<ReporteeDetail>(`/team/${employeeId}`) },
  hr: { tracking: async () => (await request<{ data: TrackingRow[] }>('/hr/tracking')).data },
};
