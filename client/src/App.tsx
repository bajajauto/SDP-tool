import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import type { Me } from '@sdp/shared';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
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
const validViews: ViewRole[] = ['employee', 'manager', 'buhr', 'tdadmin'];

function loadSavedView(): ViewRole | null {
  try {
    const savedView = localStorage.getItem(SESSION_VIEW_KEY);
    return validViews.includes(savedView as ViewRole) ? savedView as ViewRole : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  // The identity must be resolved synchronously, in the same tick as
  // restoring/setting `view` - not in a reactive effect. Effects for a
  // newly-mounted tree run children-first, so any child that fetches on
  // mount (Team, HrDashboard...) would otherwise race ahead of an
  // App-level effect and fire its first request under the previous
  // (or default) identity. Resolving it inside the state initializer, and
  // again synchronously inside handleSelectView before setView(), closes
  // that race for both the "restored session" and "just logged in" paths.
  const [view, setView] = useState<ViewRole | null>(() => {
    const restored = loadSavedView();
    if (restored) setDevEmployeeId(DEMO_IDENTITIES[restored]);
    return restored;
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!view) return;
    setAccessDenied(false);
    api.me().then(setMe).catch(() => setAccessDenied(true));
  }, [view]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.querySelector('.app-main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  if (accessDenied) {
    return <AccessPending />;
  }

  function handleSelectView(role: ViewRole) {
    setDevEmployeeId(DEMO_IDENTITIES[role]);
    localStorage.setItem(SESSION_VIEW_KEY, role);
    setView(role);
    if (role === 'employee') navigate('/');
    if (role === 'manager') navigate('/home');
  }

  function handleSignOut() {
    localStorage.removeItem(SESSION_VIEW_KEY);
    clearDevEmployeeId();
    setView(null);
    setMe(null);
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
        <TopBar me={me} view={view} onSwitchView={handleSelectView} onSignOut={handleSignOut} />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Sidebar roles={me?.roles ?? []} onSignOut={handleSignOut} />
          {view === 'buhr' ? (
            <main className="app-main" style={{ flex: 1, minWidth: 0 }}><HrDashboard /></main>
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
