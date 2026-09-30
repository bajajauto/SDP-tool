import { TrackingInsights } from '../components/TrackingInsights';
import { StageDeadlineSetup } from '../components/StageDeadlineSetup';
import { EmailCentre } from '../components/EmailCentre';

export function TdAdminDashboard({ section }: { section: 'tracking' | 'cohort' | 'email' }) {
  if (section === 'tracking') return <TrackingInsights orgWide />;
  if (section === 'email') return <EmailCentre />;
  return <div className="td-admin-stage-wrap"><StageDeadlineSetup /></div>;
}
