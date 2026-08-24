import { useEffect, useState } from 'react';
import type { TrackingRow } from '@sdp/shared';
import { api } from '../lib/api';
import { TrackingTable } from '../components/TrackingTable';

/**
 * FR-TDA-001/005: identical projection to BUHR, scoped to the whole
 * organisation instead of one BU. Same status-only DTO, so TD Admin has no
 * more access to content than BUHR does.
 */
export function TdAdminDashboard() {
  const [rows, setRows] = useState<TrackingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.hr.tracking().then((data) => { setRows(data); setLoading(false); });
  }, []);

  const submitted = rows.filter((r) => r.sharingScope !== null).length;

  return (
    <div className="buhr-wrap">
      <div className="buhr-banner">
        <div className="buhr-banner-title">Org-wide SDP Dashboard</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>
          All business units. Milestone status only, never reflection, goal, feedback, or check-in text.
        </div>
      </div>

      <div className="buhr-stats">
        <div className="buhr-stat ok">
          <div className="buhr-stat-lbl">SDPs submitted</div>
          <div className="buhr-stat-val">{submitted} <span style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 500 }}>/ {rows.length}</span></div>
        </div>
        <div className="buhr-stat">
          <div className="buhr-stat-lbl">Employees tracked</div>
          <div className="buhr-stat-val">{rows.length}</div>
        </div>
      </div>

      {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : <TrackingTable rows={rows} showBu />}

      <div className="placeholder-card">
        Cycle configuration, email templates, audit log, and bulk announcements are not built yet.
      </div>
    </div>
  );
}
