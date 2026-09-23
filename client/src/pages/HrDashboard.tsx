import { TrackingInsights } from '../components/TrackingInsights';

export function HrDashboard({ exportsOnly = false }: { exportsOnly?: boolean }) {
  return <TrackingInsights exportOnly={exportsOnly} />;
}
