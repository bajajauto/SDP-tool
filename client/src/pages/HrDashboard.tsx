import { useEffect, useState } from 'react';
import type { TrackingRow } from '@sdp/shared';
import { api } from '../lib/api';
import { TrackingTable } from '../components/TrackingTable';

/**
 * FR-HR-006 / FR-NFR-018: this page can only ever render what `TrackingRow`
 * carries, and that type has no field capable of holding reflection, goal,
 * feedback or check-in text. There is nothing to accidentally show here.
 */
export function HrDashboard() {
  const [rows, setRows] = useState<TrackingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.hr.tracking().then((data) => { setRows(data); setLoading(false); });
  }, []);

  return (
    <div className="buhr-wrap">
      <div className="buhr-banner">
        <div className="buhr-banner-title">SDP Tracking Dashboard</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>
          Scoped to your business unit. Milestone status only, never reflection, goal, feedback, or check-in text.
        </div>
      </div>

      {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : <TrackingTable rows={rows} />}
    </div>
  );
}
