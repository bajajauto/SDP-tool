import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
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
import { Toolkit } from './pages/Toolkit';
import { Journal } from './pages/Journal';
import { Letter } from './pages/Letter';
import { Team } from './pages/Team';
import { ReporteeDetail } from './pages/ReporteeDetail';
import { HrDashboard } from './pages/HrDashboard';
import { TdAdminDashboard } from './pages/TdAdminDashboard';
import { RouteStub } from './pages/RouteStub';
import { SdpProvider } from './state/SdpContext';
import { api } from './lib/api';

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
  const [view, setView] = useState<ViewRole | null>(loadSavedView);
  const navigate = useNavigate();

  useEffect(() => {
    api.me().then(setMe).catch(() => setAccessDenied(true));
  }, []);

  if (accessDenied) {
    return <AccessPending />;
  }

  function handleSelectView(role: ViewRole) {
    localStorage.setItem(SESSION_VIEW_KEY, role);
    setView(role);
    if (role === 'employee') navigate('/');
    if (role === 'manager') navigate('/team');
  }

  function handleSignOut() {
    localStorage.removeItem(SESSION_VIEW_KEY);
    setView(null);
    navigate('/');
  }

  if (!view) {
    return <Login onSelect={handleSelectView} />;
  }

  return (
    <SdpProvider>
      <div className="app-shell">
        <TopBar me={me} view={view} onSwitchView={handleSelectView} onSignOut={handleSignOut} />
        {view === 'buhr' ? (
          <main className="app-main"><HrDashboard /></main>
        ) : view === 'tdadmin' ? (
          <main className="app-main"><TdAdminDashboard /></main>
        ) : (
          <div style={{ display: 'flex', flex: 1 }}>
            <Sidebar roles={me?.roles ?? []} onSignOut={handleSignOut} />
            <main className="app-main" style={{ flex: 1, minWidth: 0 }}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/reflect" element={<Reflect />} />
                <Route path="/vision" element={<Vision />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/submit" element={<Submit />} />
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
          </div>
        )}
      </div>
    </SdpProvider>
  );
}
