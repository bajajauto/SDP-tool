import { MILESTONE_LABELS, MILESTONE_ORDER } from '@sdp/shared';
import type { TrackingRow } from '@sdp/shared';

/**
 * Shared by the BUHR and TD Admin dashboards (FR-HR-006 / FR-TDA-005). Both
 * roles get the identical status-only projection; TD Admin just sees more
 * rows (org-wide instead of BU-scoped). Nothing here can render content.
 */
export function TrackingTable({ rows, showBu }: { rows: TrackingRow[]; showBu?: boolean }) {
  const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  return (
    <div className="buhr-tablewrap">
      <div className="buhr-table-scroll">
        <table className="buhr-table">
          <thead>
            <tr>
              <th className="col-emp">Employee</th>
              <th className="col-mgr">Manager</th>
              {showBu && <th>BU</th>}
              {MILESTONE_ORDER.map((m) => <th key={m}>{MILESTONE_LABELS[m]}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.employeeId}>
                <td className="col-emp">
                  <div className="buhr-emp-name">{row.employeeName}</div>
                  <div className="buhr-emp-dept">{row.department}</div>
                  {row.sharingScope && (
                    <span className={`buhr-scope-tag ${row.sharingScope === 'FULL' ? 'all' : 'goals'}`}>
                      {row.sharingScope === 'FULL' ? 'Full' : 'Goals only'}
                    </span>
                  )}
                </td>
                <td><div className="buhr-mgr">{row.managerName}</div></td>
                {showBu && <td><div className="buhr-mgr">{row.bu}</div></td>}
                {MILESTONE_ORDER.map((m) => {
                  const cell = row.milestones[m];
                  return (
                    <td key={m}>
                      <span className={`buhr-chip ${cell.state === 'DONE' ? 'done' : cell.state === 'PENDING' ? 'pending' : 'notdue'}`}>
                        {cell.state === 'DONE' && cell.completedAt ? `✓ ${formatDate(cell.completedAt)}` : cell.state === 'DONE' ? '✓ Done' : cell.state === 'PENDING' ? 'Pending' : '-'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
