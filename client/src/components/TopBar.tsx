import { useState } from 'react';
import { copy } from '../content/copy';
import type { Me } from '@sdp/shared';
import type { ViewRole } from '../pages/Login';
import bajajLogo from '../assets/bajaj-logo.png';

interface TopBarProps {
  me: Me | null;
  view: ViewRole;
  onSwitchView: (view: ViewRole) => void;
  onSignOut: () => void;
}

const viewLabels: Record<ViewRole, string> = {
  employee: 'Employee view',
  manager: 'Manager view',
  buhr: 'BU HR view',
  tdadmin: 'TD Admin view',
};

const viewOptions: { role: ViewRole; icon: string; sub: string }[] = [
  { role: 'employee', icon: '\u{1F464}', sub: 'Your own SDP' },
  { role: 'manager', icon: '\u{1F465}', sub: 'Your team’s development plans' },
  { role: 'buhr', icon: '\u{1F4CA}', sub: 'Track completion across your BU' },
  { role: 'tdadmin', icon: '\u{2699}\u{FE0F}', sub: 'Org-wide tracking and cycle config' },
];

export function TopBar({ me, view, onSwitchView, onSignOut }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="tb-brand">
        <div style={{ background: '#1e4d8c', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
          <img src={bajajLogo} alt="Bajaj Auto" style={{ height: 34, width: 'auto', display: 'block' }} />
        </div>
        <div className="tb-sep" />
        <div className="tb-label">{copy.appTitle}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(30,95,186,.10)',
            border: '1px solid var(--blue-l)', color: 'var(--blue)', fontSize: 12.5, fontWeight: 600,
            padding: '7px 13px', borderRadius: 18, cursor: 'pointer',
          }}
        >
          <span>&#128065;</span>
          <span>{viewLabels[view]}</span>
          <span style={{ fontSize: 9, opacity: 0.7 }}>&#9660;</span>
        </button>
        <div className="tb-user">
          {me && (
            <>
              <div className="tb-avatar">{initials(me.employee.fullName)}</div>
              <div className="tb-name">{me.employee.fullName}</div>
            </>
          )}
        </div>
        {menuOpen && (
          <div className="user-dropdown open" style={{ top: 44 }}>
            <div className="ud-header">Switch view</div>
            {viewOptions.map((opt) => (
              <button
                key={opt.role}
                className={`ud-option${view === opt.role ? ' active' : ''}`}
                onClick={() => { onSwitchView(opt.role); setMenuOpen(false); }}
              >
                <div className="ud-icon">{opt.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="ud-label">{viewLabels[opt.role]}</div>
                  <div className="ud-sub">{opt.sub}</div>
                </div>
                {view === opt.role && <span className="ud-check">&#10003;</span>}
              </button>
            ))}
            <button className="ud-option" onClick={() => { onSignOut(); setMenuOpen(false); }}>
              <div className="ud-icon">&#128682;</div>
              <div style={{ flex: 1 }}>
                <div className="ud-label">Sign out</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function initials(fullName: string): string {
  return fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}
