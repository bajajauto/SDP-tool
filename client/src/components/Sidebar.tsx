import { NavLink } from 'react-router-dom';
import type { Role } from '@sdp/shared';
import { useSdp } from '../state/SdpContext';

interface NavItemDef {
  to: string;
  label: string;
  dot: string;
  requiresGoalsOrSubmit?: boolean;
}

const steps: NavItemDef[] = [
  { to: '/reflect', label: 'Reflect', dot: '1' },
  { to: '/goals', label: 'Set Goals', dot: '2' },
  { to: '/submit', label: 'Review and Submit', dot: '3' },
  { to: '/growth-conversation', label: 'Growth Conversation', dot: '4' },
  { to: '/manager-feedback', label: 'Manager Feedback', dot: '5' },
  { to: '/dashboard', label: 'Track Progress', dot: '↗' },
];

export function Sidebar({ roles, onSignOut }: { roles: Role[]; onSignOut: () => void }) {
  const { state } = useSdp();

  const reflectionCount = [
    state.reflection.q1Words.length > 0 || state.reflection.q1Text.trim().length > 0,
    state.reflection.q2Text.trim().length >= 80,
    state.reflection.q3Text.trim().length >= 80,
    state.reflection.q4Text.trim().length >= 80,
    state.reflection.q5Text.trim().length >= 80,
    state.reflection.q6Text.trim().length >= 80,
  ].filter(Boolean).length;
  const goalsComplete = state.goals.length >= 2 && state.goals.every(
    (g) => g.title && g.domain && g.whyItMatters && g.grownWhen && g.actionDo && g.actionLearn && g.actionConnect && g.supportNeeded,
  );
  const submitted = state.status !== 'NOT_STARTED' && state.status !== 'DRAFT';
  const conversationDone = !!state.conversationConfirmedAt;
  const journeyDone = [reflectionCount >= 6, goalsComplete, submitted, conversationDone].filter(Boolean).length;

  function stateFor(item: NavItemDef): 'active' | 'done' | 'locked' | '' {
    if (item.label === 'Reflect') return reflectionCount >= 6 ? 'done' : '';
    if (item.label === 'Set Goals') {
      if (reflectionCount < 6) return 'locked';
      return goalsComplete ? 'done' : '';
    }
    if (item.label === 'Review and Submit') {
      if (!goalsComplete) return 'locked';
      return submitted ? 'done' : '';
    }
    if (item.label === 'Growth Conversation') return submitted ? (conversationDone ? 'done' : '') : 'locked';
    if (item.label === 'Manager Feedback') return conversationDone ? '' : 'locked';
    if (item.label === 'Track Progress') return conversationDone ? '' : 'locked';
    return '';
  }

  return (
    <nav className="sidebar visible">
      <div className="sidebar-label">Workspace</div>
      <NavLink to="/" className="snav-item" style={{ color: 'var(--muted)' }}>
        <div className="snav-dot" style={{ background: 'var(--cream-d)', color: 'var(--muted)' }}>&#8505;</div>
        Philosophy &amp; Overview
      </NavLink>
      <NavLink to="/home" className={({ isActive }) => `snav-item snav-dashboard${isActive ? ' active' : ''}`}>
        <div className="snav-dot">&#9638;</div>
        Dashboard
      </NavLink>
      <div className="sidebar-label sidebar-section-label">My Journey</div>
      <div className="sidebar-progress" aria-label={`${journeyDone} of 4 journey stages complete`}>
        <span><i style={{ width: `${journeyDone * 25}%` }} /></span>
        <small>{journeyDone} of 4 complete</small>
      </div>
      {steps.map((item) => {
        const s = stateFor(item);
        const locked = s === 'locked';
        return locked ? (
          <div className="snav-item locked" key={item.label}>
            <div className="snav-dot">{item.dot}</div>
            {item.label}
          </div>
        ) : (
          <NavLink to={item.to} className={({ isActive }) => `snav-item${isActive ? ' active' : ''}${s === 'done' ? ' done' : ''}`} key={item.label}>
            <div className="snav-dot">{s === 'done' ? '✓' : item.dot}</div>
            {item.label}
          </NavLink>
        );
      })}
      <div className="sidebar-label sidebar-section-label">People &amp; Support</div>
      {roles.includes('MANAGER') && (
        <NavLink to="/team" className="snav-item" style={{ color: 'var(--muted)' }}>
          <div className="snav-dot" style={{ background: 'var(--cream-d)', color: 'var(--muted)' }}>&#128101;</div>
          My Team
        </NavLink>
      )}
      <NavLink to="/toolkit" className="snav-item" style={{ color: 'var(--muted)' }}>
        <div className="snav-dot" style={{ background: 'var(--cream-d)', color: 'var(--muted)' }}>&#128218;</div>
        Support Toolkit
      </NavLink>
      <button type="button" className="sidebar-signout" onClick={onSignOut}>
        <span aria-hidden="true">&#8592;</span>
        Sign out
      </button>
    </nav>
  );
}
