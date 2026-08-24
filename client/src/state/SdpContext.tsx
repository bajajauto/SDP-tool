import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CheckInPeriod, CheckInStatus, GoalDomain, SharingScope, SdpStatus } from '@sdp/shared';

// Rotated to give participants a clean slate for the current test cycle.
const STORAGE_KEY = 'sdp_draft_v2';

export interface ReflectionDraft {
  q1Words: string[];
  q1Text: string;
  q2Text: string;
  q3Text: string;
  q4Text: string;
  q5Text: string;
  q6Text: string;
}

export interface GoalDraft {
  id: string;
  title: string;
  domain: GoalDomain | '';
  whyItMatters: string;
  grownWhen: string;
  actionDo: string;
  actionLearn: string;
  actionConnect: string;
  supportNeeded: string;
}

export interface CheckInDraft {
  progressNote: string;
  status: CheckInStatus;
  submittedAt: string | null;
}

export interface SdpDraftState {
  reflection: ReflectionDraft;
  goals: GoalDraft[];
  status: SdpStatus;
  sharingScope: SharingScope | null;
  conversationConfirmedAt: string | null;
  checklist: Record<string, boolean>;
  checkIns: Record<string, CheckInDraft>;
  checkInDates: Record<CheckInPeriod, string>;
  supportNeeds: { id: string; body: string; createdAt: string }[];
}

const emptyReflection: ReflectionDraft = {
  q1Words: [], q1Text: '', q2Text: '', q3Text: '', q4Text: '', q5Text: '', q6Text: '',
};

const initialState: SdpDraftState = {
  reflection: emptyReflection,
  goals: [],
  status: 'NOT_STARTED',
  sharingScope: null,
  conversationConfirmedAt: null,
  checklist: {},
  checkIns: {},
  checkInDates: { Q1: '', MID_YEAR: '', Q2: '', YEAR_END: '' },
  supportNeeds: [],
};

function load(): SdpDraftState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return initialState;
  }
}

interface SdpContextValue {
  state: SdpDraftState;
  lastSavedAt: Date | null;
  updateReflection: (patch: Partial<ReflectionDraft>) => void;
  addGoal: () => void;
  updateGoal: (id: string, patch: Partial<GoalDraft>) => void;
  removeGoal: (id: string) => void;
  submitPlan: (scope: SharingScope) => void;
  confirmConversation: () => void;
  toggleChecklistItem: (id: string) => void;
  resetChecklist: () => void;
  submitCheckIn: (period: CheckInPeriod, goalId: string, note: string, status: CheckInStatus) => void;
  setCheckInDate: (period: CheckInPeriod, date: string) => void;
  addSupportNeed: (body: string) => void;
}

const SdpContext = createContext<SdpContextValue | null>(null);

export function SdpProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SdpDraftState>(load);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setLastSavedAt(new Date());
    }, 400);
    return () => clearTimeout(timeout);
  }, [state]);

  const value = useMemo<SdpContextValue>(() => ({
    state,
    lastSavedAt,
    updateReflection: (patch) => {
      setState((s) => ({
        ...s,
        status: s.status === 'NOT_STARTED' ? 'DRAFT' : s.status,
        reflection: { ...s.reflection, ...patch },
      }));
    },
    addGoal: () => {
      setState((s) => {
        if (s.goals.length >= 3) return s;
        const goal: GoalDraft = {
          id: crypto.randomUUID(),
          title: '', domain: '', whyItMatters: '', grownWhen: '',
          actionDo: '', actionLearn: '', actionConnect: '', supportNeeded: '',
        };
        return { ...s, goals: [...s.goals, goal] };
      });
    },
    updateGoal: (id, patch) => {
      setState((s) => ({
        ...s,
        goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      }));
    },
    removeGoal: (id) => {
      setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
    },
    submitPlan: (scope) => {
      setState((s) => ({ ...s, status: 'SUBMITTED', sharingScope: scope }));
    },
    confirmConversation: () => {
      setState((s) => ({ ...s, status: 'CONVERSATION_CONFIRMED', conversationConfirmedAt: new Date().toISOString() }));
    },
    toggleChecklistItem: (id) => {
      setState((s) => ({ ...s, checklist: { ...s.checklist, [id]: !s.checklist[id] } }));
    },
    resetChecklist: () => {
      setState((s) => ({ ...s, checklist: {} }));
    },
    submitCheckIn: (period, goalId, note, status) => {
      setState((s) => ({
        ...s,
        status: s.status === 'CONVERSATION_CONFIRMED' ? 'IN_PROGRESS' : s.status,
        checkIns: {
          ...s.checkIns,
          [`${goalId}:${period}`]: { progressNote: note, status, submittedAt: new Date().toISOString() },
        },
      }));
    },
    setCheckInDate: (period, date) => {
      setState((s) => ({ ...s, checkInDates: { ...s.checkInDates, [period]: date } }));
    },
    addSupportNeed: (body) => {
      setState((s) => ({
        ...s,
        supportNeeds: [...s.supportNeeds, { id: crypto.randomUUID(), body, createdAt: new Date().toISOString() }],
      }));
    },
  }), [state, lastSavedAt]);

  return <SdpContext.Provider value={value}>{children}</SdpContext.Provider>;
}

export function useSdp(): SdpContextValue {
  const ctx = useContext(SdpContext);
  if (!ctx) throw new Error('useSdp must be used within SdpProvider');
  return ctx;
}
