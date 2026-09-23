import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import type { Me } from '@sdp/shared';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { BuhrSidebar } from './components/BuhrSidebar';
import { JournalFab } from './components/JournalFab';
import { AccessPending } from './pages/AccessPending';
import { Login, type ViewRole } from './pages/Login';
import { Landing } from './pages/Landing';
import { Reflect } from './pages/Reflect';
import { Vision } from './pages/Vision';
import { Goals } from './pages/Goals';
import { Submit } from './pages/Submit';
import { Dashboard } from './pages/Dashboard';
import { ManagerFeedback } from './pages/ManagerFeedback';
import { GrowthConversation } from './pages/GrowthConversation';
import { Toolkit } from './pages/Toolkit';
import { Journal } from './pages/Journal';
import { Letter } from './pages/Letter';
import { Team } from './pages/Team';
import { ReporteeDetail } from './pages/ReporteeDetail';
import { HrDashboard } from './pages/HrDashboard';
import { TdAdminDashboard } from './pages/TdAdminDashboard';
import { HomeDashboard } from './pages/HomeDashboard';
import { RouteStub } from './pages/RouteStub';
import { SdpProvider } from './state/SdpContext';
import { api, clearDevEmployeeId, DEMO_IDENTITIES, setDevEmployeeId } from './lib/api';

const SESSION_VIEW_KEY = 'sdp_authenticated_view_v1';

function restoreSessionView(): ViewRole | null {
  try {
    const role = sessionStorage.getItem(SESSION_VIEW_KEY);
    if (role === 'employee' || role === 'manager' || role === 'buhr' || role === 'tdadmin') {
      return role;
    }
  } catch {
    // Login still works when browser storage is unavailable.
  }
  return null;
}

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  // Keep login across refreshes within this tab, without a permanent saved role.
  const [view, setView] = useState<ViewRole | null>(restoreSessionView);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!view) return;
    let active = true;
    setAccessDenied(false);
    api.me().then((profile) => {
      if (active) setMe(profile);
    }).catch(() => {
      if (active) setAccessDenied(true);
    });
    return () => { active = false; };
  }, [view]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.querySelector('.app-main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    if (view === 'buhr' && !location.pathname.startsWith('/buhr/')) navigate('/buhr/tracking', { replace: true });
  }, [location.pathname, navigate, view]);

  if (accessDenied) {
    return <AccessPending />;
  }

  function handleSelectView(role: ViewRole) {
    // Set identity before mounting children that fetch account data.
    setDevEmployeeId(DEMO_IDENTITIES[role]);
    try {
      sessionStorage.setItem(SESSION_VIEW_KEY, role);
    } catch {
      // Continue with an in-memory session if storage is unavailable.
    }
    if (role !== view) setMe(null);
    setAccessDenied(false);
    setView(role);
    if (role === 'employee') navigate('/');
    if (role === 'manager') navigate('/home');
    if (role === 'buhr') navigate('/buhr/tracking');
  }

  function handleSwitchView(role: ViewRole) {
    const requiredRole = role === 'manager' ? 'MANAGER' : role === 'buhr' ? 'BUHR' : role === 'tdadmin' ? 'TD_ADMIN' : 'EMPLOYEE';
    const switchingWithinOwnAccount = me?.roles.includes(requiredRole);
    if (!switchingWithinOwnAccount) {
      setDevEmployeeId(DEMO_IDENTITIES[role]);
      setMe(null);
    }
    try {
      sessionStorage.setItem(SESSION_VIEW_KEY, role);
    } catch {
      // Continue with the active in-memory view if storage is unavailable.
    }
    setAccessDenied(false);
    setView(role);
    navigate(role === 'employee' ? '/' : role === 'manager' ? '/home' : role === 'buhr' ? '/buhr/tracking' : '/');
  }

  function handleSignOut() {
    try {
      sessionStorage.removeItem(SESSION_VIEW_KEY);
    } catch {
      // Always clear the active in-memory session.
    }
    clearDevEmployeeId();
    setView(null);
    setMe(null);
    setAccessDenied(false);
    navigate('/');
  }

  function handleBack() {
    navigate('/home');
  }

  if (!view) {
    return <Login onSelect={handleSelectView} />;
  }

  return (
    // Keyed on `view` so switching identity (Employee/Manager/BUHR/TD Admin)
    // fully remounts the SDP data layer instead of continuing to show
    // whichever identity's reflection/goals happened to load first.
    <SdpProvider key={view}>
      <div className="app-shell">
        <TopBar me={me} view={view} onSwitchView={handleSwitchView} onSignOut={handleSignOut} />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {view === 'buhr' ? <BuhrSidebar onSignOut={handleSignOut} /> : <Sidebar roles={me?.roles ?? []} onSignOut={handleSignOut} hideJourney={view === 'tdadmin'} hideSupport={view === 'tdadmin'} />}
          {view === 'buhr' ? (
            <main className="app-main" style={{ flex: 1, minWidth: 0 }}><HrDashboard exportsOnly={location.pathname === '/buhr/exports'} /></main>
          ) : view === 'tdadmin' ? (
            <main className="app-main" style={{ flex: 1, minWidth: 0 }}><TdAdminDashboard /></main>
          ) : (
            <>
            <main className="app-main" style={{ flex: 1, minWidth: 0 }}>
              {location.pathname !== '/home' && location.pathname !== '/' && <div className="section-back-wrap"><button type="button" className="section-back" onClick={handleBack}>&larr; Back</button></div>}
              <Routes>
                <Route path="/home" element={<HomeDashboard roles={me?.roles ?? []} />} />
                <Route path="/" element={<Landing />} />
                <Route path="/reflect" element={<Reflect />} />
                <Route path="/vision" element={<Vision />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/submit" element={<Submit />} />
                <Route path="/growth-conversation" element={<GrowthConversation />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/manager-feedback" element={<ManagerFeedback />} />
                <Route path="/toolkit" element={<Toolkit />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/letter" element={<Letter />} />
                <Route path="/team" element={<Team />} />
                <Route path="/team/:employeeId" element={<ReporteeDetail />} />
                <Route path="*" element={<RouteStub title="Not found" />} />
              </Routes>
            </main>
            <JournalFab />
            </>
          )}
        </div>
      </div>
    </SdpProvider>
  );
}
