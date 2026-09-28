import { TrackingInsights } from '../components/TrackingInsights';
import { StageDeadlineSetup } from '../components/StageDeadlineSetup';

export function TdAdminDashboard({ section }: { section: 'tracking' | 'cohort' }) {
  return section === 'tracking'
    ? <TrackingInsights orgWide />
    : <div className="td-admin-stage-wrap"><StageDeadlineSetup /></div>;
}
