import { TrackingInsights } from '../components/TrackingInsights';
import { BuhrDeadlines } from '../components/BuhrDeadlines';

export function HrDashboard({ exportsOnly = false }: { exportsOnly?: boolean }) {
  return exportsOnly ? <TrackingInsights exportOnly /> : <><div className="buhr-deadlines-wrap"><BuhrDeadlines /></div><TrackingInsights /></>;
}
