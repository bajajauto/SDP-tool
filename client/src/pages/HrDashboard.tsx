import { useEffect, useMemo, useState } from 'react';
import { MILESTONE_ORDER } from '@sdp/shared';
import type { TrackingRow } from '@sdp/shared';
import { api, ApiError } from '../lib/api';
import { TrackingTable } from '../components/TrackingTable';

/**
 * FR-HR-006 / FR-NFR-018: this page can only ever render what `TrackingRow`
 * carries, and that type has no field capable of holding reflection, goal,
 * feedback or check-in text. There is nothing to accidentally show here.
 */
export function HrDashboard() {
  const [rows, setRows] = useState<TrackingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [manager, setManager] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.hr.tracking().then((data) => { setRows(data); setLoading(false); }).catch((err) => {
      setError(err instanceof ApiError && err.status === 403
        ? "Your account isn't mapped as a BUHR for any business unit."
        : 'Could not load the tracking dashboard. Please try again.');
      setLoading(false);
    });
  }, []);

  const managers = useMemo(() => [...new Set(rows.map((row) => row.managerName))].sort(), [rows]);
  const departments = useMemo(() => [...new Set(rows.map((row) => row.department))].sort(), [rows]);
  const filteredRows = useMemo(() => rows.filter((row) => {
    const query = search.trim().toLowerCase();
    return (!query || row.employeeName.toLowerCase().includes(query) || row.employeeId.toLowerCase().includes(query))
      && (!manager || row.managerName === manager)
      && (!department || row.department === department);
  }), [rows, search, manager, department]);

  const submitted = rows.filter((row) => row.milestones.SDP_SUBMITTED.state === 'DONE').length;
  const pendingActions = rows.filter((row) => MILESTONE_ORDER.some((key) => row.milestones[key].state === 'PENDING')).length;
  const onTrack = rows.filter((row) => MILESTONE_ORDER.slice(0, 6).every((key) => row.milestones[key].state === 'DONE')).length;
  const feedbackPending = rows.filter((row) => ['MGR_PLAN_FEEDBACK', 'MGR_MID_FEEDBACK', 'MGR_YEAR_FEEDBACK']
    .some((key) => row.milestones[key as keyof typeof row.milestones].state === 'PENDING')).length;

  function exportCsv() {
    const header = ['Employee', 'Manager', 'Business unit', 'Department', ...MILESTONE_ORDER];
    const lines = filteredRows.map((row) => [row.employeeName, row.managerName, row.bu, row.department,
      ...MILESTONE_ORDER.map((key) => row.milestones[key].state)]);
    const csv = [header, ...lines].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = 'buhr-sdp-tracking.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="buhr-wrap">
      <div className="buhr-banner">
        <div className="buhr-banner-eyebrow">BU HR VIEW</div>
        <div className="buhr-banner-title">SDP Tracking Dashboard</div>
        <div className="buhr-banner-sub">Track every SDP, growth conversation, and check-in across the business unit. Send nudge emails when something is pending.</div>
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}
      {!loading && error && <div className="placeholder-card" role="alert"><p>{error}</p></div>}
      {!loading && !error && <>
        <div className="buhr-stats">
          <div className="buhr-stat ok"><div className="buhr-stat-lbl">SDPs submitted</div><div className="buhr-stat-val">{submitted} <span>/ {rows.length}</span></div><small>{rows.length - submitted} remaining</small></div>
          <div className="buhr-stat warn"><div className="buhr-stat-lbl">Pending actions</div><div className="buhr-stat-val">{pendingActions}</div><small>Employees with overdue steps</small></div>
          <div className="buhr-stat ok"><div className="buhr-stat-lbl">On track (through mid-year)</div><div className="buhr-stat-val">{onTrack}</div><small>Core mid-year milestones done</small></div>
          <div className="buhr-stat warn"><div className="buhr-stat-lbl">Manager feedback pending</div><div className="buhr-stat-val">{feedbackPending}</div><small>Plan, mid-year, or year-end</small></div>
        </div>
        <div className="buhr-filters">
          <input className="buhr-filter" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employee..." aria-label="Search employee" />
          <select className="buhr-filter" value={manager} onChange={(event) => setManager(event.target.value)} aria-label="Filter by manager"><option value="">All managers</option>{managers.map((name) => <option key={name}>{name}</option>)}</select>
          <select className="buhr-filter" aria-label="Filter by business unit head"><option>All BU Heads</option></select>
          <select className="buhr-filter" value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department"><option value="">All departments</option>{departments.map((name) => <option key={name}>{name}</option>)}</select>
          <div className="buhr-toolbar"><button className="buhr-toolbar-btn" type="button">&#9993; Email templates</button><button className="buhr-toolbar-btn" type="button" onClick={exportCsv}>&#8595; Export to Excel</button></div>
        </div>
        <TrackingTable rows={filteredRows} />
      </>}
    </div>
  );
}
