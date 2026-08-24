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
  { to: '/dashboard', label: 'Manager Feedback', dot: '✉' },
  { to: '/dashboard', label: 'Track Progress', dot: '4' },
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
  const goalsComplete = state.goals.length > 0 && state.goals.every(
    (g) => g.title && g.domain && g.whyItMatters && g.grownWhen && g.actionDo && g.actionLearn && g.actionConnect && g.supportNeeded,
  );
  const submitted = state.status !== 'NOT_STARTED' && state.status !== 'DRAFT';
  const conversationDone = !!state.conversationConfirmedAt;

  const percent = Math.round(
    (reflectionCount / 6) * 40 + (goalsComplete ? 30 : 0) + (submitted ? 15 : 0) + (conversationDone ? 15 : 0),
  );

  function stateFor(item: NavItemDef): 'active' | 'done' | 'locked' | '' {
    if (item.label === 'Reflect') return reflectionCount >= 6 ? 'done' : '';
    if (item.label === 'Set Goals') {
      return goalsComplete ? 'done' : '';
    }
    if (item.label === 'Review and Submit') {
      if (!goalsComplete) return 'locked';
      return submitted ? 'done' : '';
    }
    if (item.label === 'Manager Feedback') return submitted ? '' : 'locked';
    if (item.label === 'Track Progress') return submitted ? '' : 'locked';
    return '';
  }

  return (
    <nav className="sidebar visible">
      <div className="sidebar-label">My SDP</div>
      <NavLink to="/" className="snav-item" style={{ color: 'var(--muted)' }}>
        <div className="snav-dot" style={{ background: 'var(--cream-d)', color: 'var(--muted)' }}>&#8505;</div>
        Philosophy &amp; Overview
      </NavLink>
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
      {roles.includes('MANAGER') && (
        <NavLink to="/team" className="snav-item" style={{ color: 'var(--muted)', marginTop: 8 }}>
          <div className="snav-dot" style={{ background: 'var(--cream-d)', color: 'var(--muted)' }}>&#128101;</div>
          My Team
        </NavLink>
      )}
      <NavLink to="/toolkit" className="snav-item" style={{ color: 'var(--muted)' }}>
        <div className="snav-dot" style={{ background: 'var(--cream-d)', color: 'var(--muted)' }}>&#128218;</div>
        Support Toolkit
      </NavLink>
      <div className="snav-progress">
        <div className="snav-prog-label">{percent}% complete</div>
        <div className="snav-prog-bar"><div className="snav-prog-fill" style={{ width: `${percent}%` }} /></div>
      </div>
      <button type="button" className="sidebar-signout" onClick={onSignOut}>
        <span aria-hidden="true">&#8592;</span>
        Sign out
      </button>
    </nav>
  );
}
