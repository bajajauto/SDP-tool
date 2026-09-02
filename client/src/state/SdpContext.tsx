import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { CheckInPeriod, CheckInStatus, GoalDomain, Reflection, SharingScope, SdpStatus } from '@sdp/shared';
import { api, type GoalPatchBody, type RawGoal } from '../lib/api';

/**
 * Local-only extras (check-in drafts, the growth-conversation checklist,
 * support-need drafts) that don't have a wired-up server round trip yet.
 * Reflection, goals, submission and conversation confirmation below this
 * DO go to the real `/api/sdp` endpoints (server/src/routes/sdp.ts) - see
 * the UAT finding this fixes: this used to be a pure localStorage mock
 * that never talked to the server at all, so "Last saved" was a lie.
 */
const LOCAL_EXTRAS_KEY = 'sdp_local_extras_v1';

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

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const emptyReflection: ReflectionDraft = {
  q1Words: [], q1Text: '', q2Text: '', q3Text: '', q4Text: '', q5Text: '', q6Text: '',
};

interface LocalExtras {
  checklist: Record<string, boolean>;
  checkIns: Record<string, CheckInDraft>;
  checkInDates: Record<CheckInPeriod, string>;
  supportNeeds: { id: string; body: string; createdAt: string }[];
}

const emptyExtras: LocalExtras = {
  checklist: {},
  checkIns: {},
  checkInDates: { Q1: '', MID_YEAR: '', Q2: '', YEAR_END: '' },
  supportNeeds: [],
};

function loadExtras(): LocalExtras {
  try {
    const raw = localStorage.getItem(LOCAL_EXTRAS_KEY);
    return raw ? { ...emptyExtras, ...JSON.parse(raw) } : emptyExtras;
  } catch {
    return emptyExtras;
  }
}

function toReflectionDraft(r: Reflection | null): ReflectionDraft {
  if (!r) return emptyReflection;
  return { q1Words: r.q1Words, q1Text: r.q1Text ?? '', q2Text: r.q2Text, q3Text: r.q3Text, q4Text: r.q4Text, q5Text: r.q5Text, q6Text: r.q6Text };
}

function toGoalDraft(g: RawGoal): GoalDraft {
  return {
    id: g.goalId, title: g.title, domain: g.domain, whyItMatters: g.whyItMatters, grownWhen: g.grownWhen,
    actionDo: g.actionDo, actionLearn: g.actionLearn, actionConnect: g.actionConnect, supportNeeded: g.supportNeeded,
  };
}

function goalPatchBody(patch: Partial<GoalDraft>): GoalPatchBody {
  const body: GoalPatchBody = {};
  if (patch.title !== undefined) body.title = patch.title;
  if (patch.domain) body.domain = patch.domain;
  if (patch.whyItMatters !== undefined) body.whyItMatters = patch.whyItMatters;
  if (patch.grownWhen !== undefined) body.grownWhen = patch.grownWhen;
  if (patch.supportNeeded !== undefined) body.supportNeeded = patch.supportNeeded;
  if (patch.actionDo !== undefined || patch.actionLearn !== undefined || patch.actionConnect !== undefined) {
    body.actionPlan = {
      ...(patch.actionDo !== undefined && { do: patch.actionDo }),
      ...(patch.actionLearn !== undefined && { learn: patch.actionLearn }),
      ...(patch.actionConnect !== undefined && { connect: patch.actionConnect }),
    };
  }
  return body;
}

interface SdpContextValue {
  state: SdpDraftState;
  lastSavedAt: Date | null;
  saveStatus: SaveStatus;
  loading: boolean;
  updateReflection: (patch: Partial<ReflectionDraft>) => void;
  addGoal: (minimumCount?: number) => void;
  updateGoal: (id: string, patch: Partial<GoalDraft>) => void;
  removeGoal: (id: string) => void;
  submitPlan: (scope: SharingScope) => Promise<void>;
  confirmConversation: () => Promise<void>;
  toggleChecklistItem: (id: string) => void;
  resetChecklist: () => void;
  submitCheckIn: (period: CheckInPeriod, goalId: string, note: string, status: CheckInStatus) => void;
  setCheckInDate: (period: CheckInPeriod, date: string) => void;
  addSupportNeed: (body: string) => void;
}

const SdpContext = createContext<SdpContextValue | null>(null);

export function SdpProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState<ReflectionDraft>(emptyReflection);
  const [goals, setGoals] = useState<GoalDraft[]>([]);
  const [status, setStatus] = useState<SdpStatus>('NOT_STARTED');
  const [sharingScope, setSharingScope] = useState<SharingScope | null>(null);
  const [conversationConfirmedAt, setConversationConfirmedAt] = useState<string | null>(null);
  const [extras, setExtras] = useState<LocalExtras>(loadExtras);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const goalsRef = useRef(goals);
  goalsRef.current = goals;
  const creatingGoalRef = useRef(false);
  const reflectionDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingReflectionRef = useRef<Partial<ReflectionDraft>>({});
  const goalDebounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingGoalRef = useRef<Record<string, Partial<GoalDraft>>>({});

  // Hydrate from the server on mount (and whenever the signed-in identity
  // changes - App.tsx remounts SdpProvider on view switch for this reason).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.sdp.get().then((sdp) => {
      if (cancelled) return;
      setReflection(toReflectionDraft(sdp.reflection));
      setGoals(sdp.goals.map((g) => ({
        id: g.goalId, title: g.title, domain: g.domain, whyItMatters: g.whyItMatters, grownWhen: g.grownWhen,
        actionDo: g.actionPlan.do, actionLearn: g.actionPlan.learn, actionConnect: g.actionPlan.connect, supportNeeded: g.supportNeeded,
      })));
      setStatus(sdp.status);
      setSharingScope(sdp.sharingScope);
      setConversationConfirmedAt(sdp.conversationConfirmedAt);
      setLastSavedAt(new Date(sdp.lastSavedAt));
      setSaveStatus('saved');
    }).catch(() => {
      setSaveStatus('error');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_EXTRAS_KEY, JSON.stringify(extras));
  }, [extras]);

  function flushReflection() {
    const patch = pendingReflectionRef.current;
    if (Object.keys(patch).length === 0) return;
    pendingReflectionRef.current = {};
    setSaveStatus('saving');
    api.sdp.patchReflection(patch as Partial<Reflection>).then((sdp) => {
      setStatus(sdp.status);
      setLastSavedAt(new Date(sdp.lastSavedAt));
      setSaveStatus('saved');
    }).catch(() => {
      setSaveStatus('error');
      pendingReflectionRef.current = { ...patch, ...pendingReflectionRef.current };
      window.setTimeout(flushReflection, 4000);
    });
  }

  function flushGoal(id: string) {
    const patch = pendingGoalRef.current[id];
    if (!patch || Object.keys(patch).length === 0) return;
    delete pendingGoalRef.current[id];
    setSaveStatus('saving');
    api.sdp.patchGoal(id, goalPatchBody(patch)).then(() => {
      setLastSavedAt(new Date());
      setSaveStatus('saved');
    }).catch(() => {
      setSaveStatus('error');
      pendingGoalRef.current[id] = { ...patch, ...pendingGoalRef.current[id] };
      window.setTimeout(() => flushGoal(id), 4000);
    });
  }

  const value: SdpContextValue = {
    state: { reflection, goals, status, sharingScope, conversationConfirmedAt, ...extras },
    lastSavedAt,
    saveStatus,
    loading,

    updateReflection: (patch) => {
      setStatus((s) => (s === 'NOT_STARTED' ? 'DRAFT' : s));
      setReflection((r) => ({ ...r, ...patch }));
      pendingReflectionRef.current = { ...pendingReflectionRef.current, ...patch };
      clearTimeout(reflectionDebounceRef.current);
      reflectionDebounceRef.current = setTimeout(flushReflection, 800);
    },

    addGoal: (minimumCount) => {
      const target = minimumCount ?? goalsRef.current.length + 1;
      if (goalsRef.current.length >= target || goalsRef.current.length >= 3 || creatingGoalRef.current) return;
      creatingGoalRef.current = true;
      setSaveStatus('saving');
      api.sdp.createGoal({}).then((raw) => {
        setStatus((s) => (s === 'NOT_STARTED' ? 'DRAFT' : s));
        setGoals((g) => (g.some((existing) => existing.id === raw.goalId) ? g : [...g, toGoalDraft(raw)]));
        setLastSavedAt(new Date());
        setSaveStatus('saved');
      }).catch(() => {
        setSaveStatus('error');
      }).finally(() => {
        creatingGoalRef.current = false;
      });
    },

    updateGoal: (id, patch) => {
      setGoals((g) => g.map((goal) => (goal.id === id ? { ...goal, ...patch } : goal)));
      setSaveStatus('saving');
      pendingGoalRef.current[id] = { ...pendingGoalRef.current[id], ...patch };
      clearTimeout(goalDebounceRef.current[id]);
      goalDebounceRef.current[id] = setTimeout(() => flushGoal(id), 800);
    },

    removeGoal: (id) => {
      clearTimeout(goalDebounceRef.current[id]);
      delete pendingGoalRef.current[id];
      setGoals((g) => g.filter((goal) => goal.id !== id));
      setExtras((e) => ({ ...e, checkIns: Object.fromEntries(Object.entries(e.checkIns).filter(([key]) => !key.startsWith(`${id}:`))) }));
      setSaveStatus('saving');
      api.sdp.removeGoal(id).then(() => {
        setLastSavedAt(new Date());
        setSaveStatus('saved');
      }).catch(() => {
        setSaveStatus('error');
      });
    },

    submitPlan: async (scope) => {
      setSaveStatus('saving');
      const sdp = await api.sdp.submit(scope);
      setStatus(sdp.status);
      setSharingScope(sdp.sharingScope);
      setLastSavedAt(new Date(sdp.lastSavedAt));
      setSaveStatus('saved');
    },

    confirmConversation: async () => {
      setSaveStatus('saving');
      const sdp = await api.sdp.confirmConversation();
      setStatus(sdp.status);
      setConversationConfirmedAt(sdp.conversationConfirmedAt);
      setLastSavedAt(new Date(sdp.lastSavedAt));
      setSaveStatus('saved');
    },

    toggleChecklistItem: (id) => {
      setExtras((e) => ({ ...e, checklist: { ...e.checklist, [id]: !e.checklist[id] } }));
    },
    resetChecklist: () => {
      setExtras((e) => ({ ...e, checklist: {} }));
    },
    submitCheckIn: (period, goalId, note, status2) => {
      setStatus((s) => (s === 'CONVERSATION_CONFIRMED' ? 'IN_PROGRESS' : s));
      setExtras((e) => ({
        ...e,
        checkIns: { ...e.checkIns, [`${goalId}:${period}`]: { progressNote: note, status: status2, submittedAt: new Date().toISOString() } },
      }));
    },
    setCheckInDate: (period, date) => {
      setExtras((e) => ({ ...e, checkInDates: { ...e.checkInDates, [period]: date } }));
    },
    addSupportNeed: (body) => {
      setExtras((e) => ({ ...e, supportNeeds: [...e.supportNeeds, { id: crypto.randomUUID(), body, createdAt: new Date().toISOString() }] }));
    },
  };

  return <SdpContext.Provider value={value}>{children}</SdpContext.Provider>;
}

export function useSdp(): SdpContextValue {
  const ctx = useContext(SdpContext);
  if (!ctx) throw new Error('useSdp must be used within SdpProvider');
  return ctx;
}
