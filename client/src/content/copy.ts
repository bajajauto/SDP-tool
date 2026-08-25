/**
 * All product copy lives here, not inline in components. This is what
 * makes the em-dash and en-dash lint rule (FR-DS-004) enforceable and lets
 * TD review copy without reading JSX. See scripts/lint-copy.js.
 */
export const copy = {
  appTitle: 'Self Development Plan 2026-27',
  landing: {
    heroHeadline: 'A plan you write for yourself, in your own words.',
    heroSubtext:
      'This is your space to reflect on who you are today, who you aspire to become, and what it will take to get there. Your Self Development Plan (SDP) is your commitment to turning that aspiration into action.',
    beginCta: 'Begin reflection',
    continueCta: 'Continue reflection',
    viewPlanCta: 'View my plan',
  },
  nav: {
    home: 'Home',
    reflect: 'Reflect',
    goals: 'Goals',
    dashboard: 'Dashboard',
    toolkit: 'Toolkit',
    journal: 'My Journal',
    letter: 'My Letter',
    team: 'My Team',
    hrDashboard: 'SDP Tracking',
    adminDashboard: 'Admin',
    signOut: 'Sign out',
  },
  accessPending: {
    title: 'Your access is being set up',
    body: 'We could not find your employee record yet. Please contact TD if this does not resolve shortly.',
  },
  placeholder: {
    comingSoon: 'This content is coming soon.',
  },
} as const;
