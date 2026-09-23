import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, SlidersHorizontal, BarChart3, Plus, Trash2 } from 'lucide-react';
import { MILESTONE_ORDER } from '@sdp/shared';
import type { TrackingRow } from '@sdp/shared';
import { api, ApiError } from '../lib/api';
import './TrackingInsights.css';

type Dimension = 'jobLevel' | 'positionLevel' | 'company' | 'sector' | 'bu' | 'function' | 'department' | 'designation' | 'baseLocation' | 'circle' | 'ro' | 'hub' | 'managerName' | 'buHeadName' | 'buhrName' | 'gender' | 'topPotential';
const dimensionLabels: Record<Dimension, string> = {
  jobLevel: 'Job Level', positionLevel: 'Position Level', company: 'Company', sector: 'Sector',
  bu: 'Business Unit', function: 'Function', department: 'Department', designation: 'Designation',
  baseLocation: 'Base Location', circle: 'Circle', ro: 'RO', hub: 'Hub', managerName: 'Manager Name',
  buHeadName: 'BU-Head', buhrName: 'BU-HR Mapped', gender: 'Gender', topPotential: 'Top Potential Tag',
};
const defaultDimensions: Dimension[] = ['bu', 'department', 'designation', 'managerName'];
const sharedDimensions: Dimension[] = ['jobLevel', 'positionLevel', 'company', 'sector', 'bu', 'function', 'department', 'designation', 'baseLocation', 'circle', 'ro', 'hub', 'managerName', 'buHeadName', 'gender', 'topPotential'];
type Filters = Record<Dimension, string>;
const emptyFilters = Object.fromEntries(Object.keys(dimensionLabels).map((key) => [key, ''])) as Filters;
const MILESTONE_LABELS = {
  SDP_SUBMITTED: 'SDP submitted', GROWTH_CONVERSATION: 'Growth conversation',
  MGR_PLAN_FEEDBACK: 'Manager plan feedback', Q1_CHECKIN: 'Q1 check-in',
  MID_YEAR_CHECKIN: 'Mid-year check-in', MGR_MID_FEEDBACK: 'Manager mid-year feedback',
  Q2_CHECKIN: 'Q2 check-in', YEAR_END_CHECKIN: 'Year-end check-in',
  MGR_YEAR_FEEDBACK: 'Manager year-end feedback',
};
const valueOf = (row: TrackingRow, key: Dimension) => row[key] || 'Unspecified';
const hasValue = (row: TrackingRow, key: Dimension) => {
  const value = row[key];
  return typeof value === 'string' && !!value.trim() && value.trim() !== '-';
};

export function TrackingInsights({ orgWide = false, exportOnly = false }: { orgWide?: boolean; exportOnly?: boolean }) {
  const [rows, setRows] = useState<TrackingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters | null>(null);
  const [activeDimensions, setActiveDimensions] = useState<Dimension[]>(defaultDimensions);
  const [addingFilter, setAddingFilter] = useState(false);
  const pendingFilterFocus = useRef<Dimension | null>(null);
  const [groupBy, setGroupBy] = useState<Dimension>('department');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const dimensions = useMemo(() => orgWide ? [...sharedDimensions, 'buhrName' as Dimension] : sharedDimensions, [orgWide]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.hr.tracking().then((data) => { if (active) setRows(data); }).catch((err) => {
      if (active) setError(err instanceof ApiError && err.status === 403
        ? 'Your account does not have access to this tracking view.'
        : 'Tracking could not be loaded. Please try again.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  const filterOptions = useMemo(() => {
    let candidates = rows;
    const result = {} as Record<Dimension, string[]>;
    activeDimensions.forEach((key) => {
      const options = [...new Set(candidates.filter((row) => hasValue(row, key)).map((row) => valueOf(row, key)))].sort();
      result[key] = options;
      if (draft[key]) candidates = candidates.filter((row) => valueOf(row, key) === draft[key]);
    });
    return result;
  }, [rows, draft, activeDimensions]);

  const availableDimensions = useMemo(() => {
    const candidates = rows.filter((row) => activeDimensions.every((key) => !draft[key] || valueOf(row, key) === draft[key]));
    return dimensions.filter((key) => !activeDimensions.includes(key) && candidates.some((row) => hasValue(row, key)));
  }, [rows, draft, activeDimensions, dimensions]);

  useEffect(() => {
    if (!availableDimensions.length) setAddingFilter(false);
  }, [availableDimensions]);

  function changeFilter(key: Dimension, value: string) {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      let candidates = rows;
      // Validate in display order so resetting one filter widens the next one's choices.
      for (const dimension of activeDimensions) {
        if (next[dimension] && !candidates.some((row) => valueOf(row, dimension) === next[dimension])) {
          next[dimension] = '';
        }
        if (next[dimension]) candidates = candidates.filter((row) => valueOf(row, dimension) === next[dimension]);
      }
      return next;
    });
  }

  const selected = useMemo(() => applied ? rows.filter((row) => dimensions.every((key) => !applied[key] || valueOf(row, key) === applied[key])) : [], [rows, applied, dimensions]);
  const submitted = selected.filter((row) => row.milestones.SDP_SUBMITTED.state === 'DONE').length;
  const pending = selected.filter((row) => MILESTONE_ORDER.some((key) => row.milestones[key].state === 'PENDING')).length;
  const milestoneSummary = useMemo(() => MILESTONE_ORDER.map((key) => {
    const done = selected.filter((row) => row.milestones[key].state === 'DONE').length;
    const waiting = selected.filter((row) => row.milestones[key].state === 'PENDING').length;
    return { key, done, waiting, notDue: selected.length - done - waiting };
  }), [selected]);
  const visibleMilestones = useMemo(() => milestoneSummary.filter((milestone) => milestone.done > 0 || milestone.waiting > 0).map((milestone) => milestone.key), [milestoneSummary]);
  const heatmapGridStyle = { gridTemplateColumns: `140px repeat(${visibleMilestones.length}, minmax(100px, 1fr))` };
  const completedSteps = milestoneSummary.reduce((total, milestone) => total + milestone.done, 0);
  const pendingSteps = milestoneSummary.reduce((total, milestone) => total + milestone.waiting, 0);
  const dueSteps = completedSteps + pendingSteps;
  const completionRate = dueSteps ? Math.round(completedSteps / dueSteps * 100) : 0;
  const bottleneck = milestoneSummary.reduce<(typeof milestoneSummary)[number] | null>((highest, milestone) =>
    !highest || milestone.waiting > highest.waiting ? milestone : highest, null);
  const groups = useMemo(() => {
    const result = new Map<string, { total: number; done: number }>();
    selected.forEach((row) => {
      const label = valueOf(row, groupBy);
      const entry = result.get(label) ?? { total: 0, done: 0 };
      entry.total++;
      if (row.milestones.SDP_SUBMITTED.state === 'DONE') entry.done++;
      result.set(label, entry);
    });
    return [...result].sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]));
  }, [selected, groupBy]);
  const changed = applied && dimensions.some((key) => draft[key] !== applied[key]);

  function addFilter(dimensionToAdd: Dimension) {
    if (!dimensionToAdd || !availableDimensions.includes(dimensionToAdd)) return;
    pendingFilterFocus.current = dimensionToAdd;
    setActiveDimensions((current) => [...current, dimensionToAdd]);
    setAddingFilter(false);
  }

  function removeFilter(key: Dimension) {
    setActiveDimensions((current) => current.filter((dimension) => dimension !== key));
    setDraft((current) => ({ ...current, [key]: '' }));
  }

  async function exportExcel(all: boolean) {
    setExporting(true);
    setExportError('');
    try {
      const { Workbook } = await import('exceljs');
      const workbook = new Workbook();
      const sheet = workbook.addWorksheet('Employee tracking');
      const exportMilestones = MILESTONE_ORDER.filter((key) => (all ? rows : selected).some((row) => row.milestones[key].state !== 'NOT_DUE'));
      sheet.addRow(['Employee ID', 'Employee', ...dimensions.map((key) => dimensionLabels[key]), 'Sharing scope', ...exportMilestones.flatMap((key) => [MILESTONE_LABELS[key], `${MILESTONE_LABELS[key]} completed at`])]);
      (all ? rows : selected).forEach((row) => sheet.addRow([row.employeeId, row.employeeName, ...dimensions.map((key) => valueOf(row, key)), row.sharingScope ?? '', ...exportMilestones.flatMap((key) => [row.milestones[key].state, row.milestones[key].completedAt ?? ''])]));
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
      sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: sheet.rowCount, column: sheet.columnCount } };
      sheet.getRow(1).font = { bold: true };
      sheet.columns.forEach((column) => { column.width = 26; });
      const scope = workbook.addWorksheet('Export scope');
      scope.addRow(['View', orgWide ? 'TD Admin' : 'BUHR']);
      scope.addRow(['Exported at', new Date().toISOString()]);
      scope.addRow(['Employees', all ? rows.length : selected.length]);
      dimensions.forEach((key) => scope.addRow([dimensionLabels[key], all ? 'All authorized employees' : applied?.[key] || 'All']));
      scope.columns.forEach((column) => { column.width = 30; });
      const buffer = await workbook.xlsx.writeBuffer();
      const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${orgWide ? 'td-admin' : 'buhr'}-tracking-${all ? 'all' : 'filtered'}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setExportError('Excel export failed. Please try again.');
    } finally { setExporting(false); }
  }

  if (exportOnly) return <div className="tracking-insights tracking-exports">
    <header className="tracking-header"><div><p>BUHR / YOUR BUSINESS UNITS</p><h1>Exports</h1></div></header>
    {loading ? <p role="status">Loading export data...</p> : error ? <div role="alert"><p>{error}</p><button onClick={() => setAttempt(attempt + 1)}>Retry</button></div> : (
      <section className="tracking-export-card">
        <div><h2>Employee tracking report</h2><p>Download milestone status and organization fields for all employees in your authorized business units.</p></div>
        <button type="button" disabled={!rows.length || exporting} onClick={() => void exportExcel(true)}><Download size={16} />{exporting ? 'Exporting...' : 'Export all to Excel'}</button>
      </section>
    )}
    {exportError && <p role="alert">{exportError}</p>}
  </div>;

  return <div className="tracking-insights">
    <header className="tracking-header"><div><p>{orgWide ? 'TD ADMIN / ALL BUSINESS UNITS' : 'BUHR / YOUR BUSINESS UNITS'}</p><h1>SDP tracking</h1></div>
      {orgWide && <button type="button" disabled={loading || !!error || !rows.length || exporting} onClick={() => void exportExcel(true)}><Download size={16} />{exporting ? 'Exporting...' : 'Export all to Excel'}</button>}
    </header>
    {loading ? <p role="status">Loading tracking data...</p> : error ? <div role="alert"><p>{error}</p><button onClick={() => setAttempt(attempt + 1)}>Retry</button></div> : <>
      <form className="tracking-filters" onSubmit={(event) => { event.preventDefault(); setApplied({ ...draft }); }}>
        <h2><SlidersHorizontal size={18} />Filter selection</h2>
        <div className="tracking-filter-grid">{activeDimensions.map((key) => {
          const label = dimensionLabels[key];
          const removable = !defaultDimensions.includes(key);
          return <div className="tracking-filter-field" key={key}><label htmlFor={`tracking-filter-${key}`}>{label}</label><div className="tracking-filter-control"><select id={`tracking-filter-${key}`} ref={(element) => { if (element && pendingFilterFocus.current === key) { element.focus(); pendingFilterFocus.current = null; } }} aria-label={label} value={draft[key]} onChange={(event) => changeFilter(key, event.target.value)}>
            <option value="">All {label.toLowerCase()}</option>
            {(filterOptions[key] ?? []).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>{removable && <button className="tracking-remove-filter" type="button" onClick={() => removeFilter(key)} aria-label={`Remove ${label} filter`} title={`Remove ${label} filter`}><Trash2 size={16} /></button>}</div></div>;
        })}</div>
        {!!availableDimensions.length && <div className="tracking-add-filter">{addingFilter ? <select autoFocus aria-label="Filter category to add" value="" onChange={(event) => addFilter(event.target.value as Dimension)} onKeyDown={(event) => { if (event.key === 'Escape') setAddingFilter(false); }}><option value="">Select a category</option>{availableDimensions.map((key) => <option key={key} value={key}>{dimensionLabels[key]}</option>)}</select> : <button type="button" onClick={() => setAddingFilter(true)}><Plus size={16} />Add filter</button>}</div>}
        <div className="tracking-filter-actions"><button className="tracking-primary" type="submit" disabled={!rows.length}>Apply filters</button><button className="tracking-clear" type="button" onClick={() => { setDraft({ ...emptyFilters }); setApplied(null); setActiveDimensions(defaultDimensions); setAddingFilter(false); }}>Clear</button>{changed && <span role="status">Unapplied filter changes</span>}</div>
      </form>
      {!rows.length ? <div className="tracking-empty"><h2>No employees available</h2></div> : !applied ? <div className="tracking-empty"><BarChart3 size={32} /><h2>No selection applied</h2></div> : <>
        <div className="tracking-result-header"><div><h2>Tracking insights</h2><p>{dimensions.map((key) => applied[key] ? `${dimensionLabels[key]}: ${applied[key]}` : null).filter(Boolean).join(' / ') || 'All authorized employees'}</p></div>{orgWide && <button disabled={!selected.length || exporting} onClick={() => void exportExcel(false)}><Download size={16} />Export selection</button>}</div>
        {!selected.length ? <div className="tracking-empty"><h2>No employees match these filters</h2></div> : <>
          <section className="tracking-alerts">
            {bottleneck && bottleneck.waiting > 0 && <div className="tracking-alert tracking-alert-bottleneck">
              <div className="tracking-alert-icon">!</div>
              <div className="tracking-alert-content">
                <strong>Action needed: {MILESTONE_LABELS[bottleneck.key]}</strong>
                <p>{bottleneck.waiting} {bottleneck.waiting === 1 ? 'employee is' : 'employees are'} still pending on this step</p>
              </div>
            </div>}
            {pending > 0 && <div className="tracking-alert tracking-alert-pending">
              <div className="tracking-alert-icon">•</div>
              <div className="tracking-alert-content">
                <strong>{pending} {pending === 1 ? 'employee needs' : 'employees need'} attention</strong>
                <p>{pendingSteps} total actions pending across all milestones</p>
              </div>
            </div>}
          </section>

          <div className="tracking-summary-cards">
            <div className="summary-card">
              <span className="summary-label">Overall progress</span>
              <div className="summary-metric"><strong>{completionRate}%</strong> complete</div>
              <p className="summary-detail">{dueSteps > 0 ? `${completedSteps} of ${dueSteps} due milestones done` : 'No milestones due yet'}</p>
            </div>
            <div className="summary-card">
              <span className="summary-label">Employees</span>
              <div className="summary-metric"><strong>{selected.length}</strong> in view</div>
              <p className="summary-detail">{submitted} have submitted SDPs</p>
            </div>
            <div className="summary-card">
              <span className="summary-label">Attention needed</span>
              <div className="summary-metric"><strong>{pending}</strong> employees</div>
              <p className="summary-detail">{pendingSteps} total actions pending</p>
            </div>
          </div>

          <section className="tracking-heatmap-section">
            <div className="tracking-section-header">
              <div>
                <h2>Completion by group</h2>
                <p>See which {dimensionLabels[groupBy]?.toLowerCase()}s need attention for each milestone</p>
              </div>
              <select className="tracking-group-select" aria-label="View by" value={groupBy} onChange={(event) => setGroupBy(event.target.value as Dimension)}>
                {dimensions.map((key) => <option key={key} value={key}>{dimensionLabels[key]}</option>)}
              </select>
            </div>
            <div className="tracking-heatmap">
              <div className="heatmap-header" style={heatmapGridStyle}>
                <div className="heatmap-corner" />
                {visibleMilestones.map((key) => {
                  const milestoneData = milestoneSummary.find((m) => m.key === key);
                  const isNotDue = milestoneData && milestoneData.done === 0 && milestoneData.waiting === 0;
                  return <div key={key} className={`heatmap-milestone-header ${isNotDue ? 'not-due' : ''}`}>{MILESTONE_LABELS[key]}</div>;
                })}
              </div>
              <div className="heatmap-body">
                {groups.map(([groupLabel]) => {
                  const groupRows = selected.filter((row) => valueOf(row, groupBy) === groupLabel);
                  return <div key={groupLabel} className="heatmap-row" style={heatmapGridStyle}>
                    <div className="heatmap-group-label">{groupLabel}</div>
                    {visibleMilestones.map((milestoneKey) => {
                      const milestoneData = milestoneSummary.find((m) => m.key === milestoneKey);
                      const isNotDue = milestoneData && milestoneData.done === 0 && milestoneData.waiting === 0;
                      const done = groupRows.filter((row) => row.milestones[milestoneKey].state === 'DONE').length;
                      const total = groupRows.length;
                      const rate = total > 0 ? Math.round(done / total * 100) : 0;
                      const intensity = rate / 100;
                      const bgColor = isNotDue ? '#f3f4f6' : `rgba(36, 129, 107, ${intensity * 0.7 + 0.15})`;
                      return <div key={milestoneKey} className={`heatmap-cell ${isNotDue ? 'not-due' : ''}`} style={{ backgroundColor: isNotDue ? '#f3f4f6' : rate === 100 ? '#24816b' : rate === 0 ? '#fff7f7' : bgColor }} title={`${groupLabel} - ${MILESTONE_LABELS[milestoneKey]}: ${rate}% (${done}/${total})`}>
                        <span className="heatmap-percent">{rate}%</span>
                      </div>;
                    })}
                  </div>;
                })}
              </div>
            </div>
          </section>

          <section className="tracking-milestone-bars">
            <div className="tracking-section-header">
              <h2>Milestone progress</h2>
              <p>Completion across all nine milestones</p>
            </div>
            <div className="tracking-legend"><span><i className="done" />Done</span><span><i className="pending" />Pending</span></div>
            <div className="tracking-bars-list">
              {milestoneSummary.map(({ key, done, waiting }) => {
                const total = done + waiting;
                const rate = total > 0 ? Math.round(done / total * 100) : 0;
                const doneWidth = total > 0 ? (done / total) * 100 : 0;
                return <div className="tracking-bar-item" key={key}>
                  <div className="bar-label">
                    <h4>{MILESTONE_LABELS[key]}</h4>
                    <span className="bar-rate">{rate}%</span>
                  </div>
                  <div className="bar-container">
                    <div className="tracking-bar" role="img" aria-label={`${MILESTONE_LABELS[key]}: ${done} done, ${waiting} pending`}>
                      <div className="done-segment" style={{ width: `${doneWidth}%` }} />
                      <div className="pending-segment" style={{ width: `${100 - doneWidth}%` }} />
                    </div>
                    <span className="bar-counts">{done} done, {waiting} pending</span>
                  </div>
                </div>;
              })}
            </div>
          </section>
        </>}
      </>}
    </>}
    {exportError && <p role="alert">{exportError}</p>}
  </div>;
}
