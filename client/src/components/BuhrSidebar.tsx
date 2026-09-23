import { BarChart3, Download } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function BuhrSidebar({ onSignOut }: { onSignOut: () => void }) {
  return <nav className="sidebar buhr-sidebar" aria-label="BUHR navigation">
    <div className="sidebar-label">Workspace</div>
    <NavLink to="/buhr/tracking" className={({ isActive }) => `snav-item${isActive ? ' active' : ''}`}>
      <span className="snav-dot"><BarChart3 size={13} /></span>
      Tracking
    </NavLink>
    <NavLink to="/buhr/exports" className={({ isActive }) => `snav-item${isActive ? ' active' : ''}`}>
      <span className="snav-dot"><Download size={13} /></span>
      Exports
    </NavLink>
    <button type="button" className="sidebar-signout" onClick={onSignOut}>
      <span aria-hidden="true">&#8592;</span>
      Sign out
    </button>
  </nav>;
}
