import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { CheckInQuestion, CohortSummary, StageDeadline, StageDeadlineSetup } from '../lib/api';

const questionTemplates: CheckInQuestion[] = [
  { id: 'progress-rating', prompt: 'How well am I progressing on this goal?', type: 'SCALE' },
  { id: 'quarter-progress', prompt: 'What have I done this quarter?', type: 'TEXT', placeholder: 'Reflect on actual progress, not intentions.' },
  { id: 'course-correction', prompt: 'Any course correction needed?', type: 'TEXT', placeholder: 'Any adjustments to the goal or your approach...' },
  { id: 'working-well', prompt: 'What is working well?', type: 'TEXT', placeholder: 'Strengths used, progress made...' },
  { id: 'needs-change', prompt: 'What needs to change?', type: 'TEXT', placeholder: 'Course corrections or adjustments...' },
  { id: 'manager-support', prompt: 'What support do I need from my manager?', type: 'TEXT', placeholder: 'Be specific about what would help most.' },
  { id: 'what-worked', prompt: 'What worked?', type: 'TEXT', placeholder: 'Honest reflection on the year...' },
  { id: 'not-worked', prompt: 'What did not work?', type: 'TEXT', placeholder: 'What would you do differently...' },
  { id: 'growth-achieved', prompt: 'What strengths did I use and what growth did I achieve?', type: 'TEXT', placeholder: 'What did you actually build this year...' },
];
const templates = (...ids: string[]) => questionTemplates.filter((question) => ids.includes(question.id));
const starterStages: StageDeadline[] = [
  { name: 'Q1 check-in', deadline: '', questions: templates('progress-rating', 'quarter-progress', 'course-correction') },
  { name: 'Mid-year check-in', deadline: '', questions: templates('working-well', 'needs-change', 'manager-support') },
  { name: 'Q2 check-in', deadline: '', questions: templates('progress-rating', 'quarter-progress', 'course-correction') },
  { name: 'Year-end check-in', deadline: '', questions: templates('what-worked', 'not-worked', 'growth-achieved') },
];

export function StageDeadlineSetup() {
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [bu, setBu] = useState('');
  const [cycleLabel, setCycleLabel] = useState('');
  const [cohortName, setCohortName] = useState('');
  const [cohortId, setCohortId] = useState<string | null>(null);
  const [stages, setStages] = useState<StageDeadline[]>(starterStages);
  const [targetBusinessUnits, setTargetBusinessUnits] = useState<string[]>([]);
  const [cohorts, setCohorts] = useState<CohortSummary[]>([]);
  const [deadlineBuQuery, setDeadlineBuQuery] = useState('');
  const [deadlineCohortFilter, setDeadlineCohortFilter] = useState('');
  const [deadlineViews, setDeadlineViews] = useState<{ bu: string; setup: StageDeadlineSetup }[]>([]);
  const [expandedDeadlineBu, setExpandedDeadlineBu] = useState<string | null>(null);
  const [deadlineLoading, setDeadlineLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load(selectedBu?: string) {
    setLoading(true); setError(''); setMessage('');
    try {
      const setup = await api.admin.stageDeadlines(selectedBu);
      setBusinessUnits(setup.businessUnits);
      setBu(selectedBu || setup.businessUnits[0] || '');
      setCycleLabel(setup.cycle.label);
      setCohortName(setup.cohortName);
      setCohortId(setup.cohortId);
      setStages(setup.stages.length ? setup.stages.map((stage, index) => ({ ...stage, questions: stage.questions?.length ? stage.questions : starterStages[index]?.questions ?? templates('quarter-progress') })) : starterStages.map((stage) => ({ ...stage, questions: [...stage.questions] })));
      return setup;
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Cohort setup could not be loaded.'); }
    finally { setLoading(false); }
  }
  async function loadCohorts() {
    const result = await api.admin.cohorts();
    setCohorts(result.cohorts); setCycleLabel(result.cycle.label);
    return result;
  }
  async function loadDeadlineViews(items: string[]) {
    setDeadlineLoading(true);
    try {
      const views = await Promise.all(items.map(async (itemBu) => ({ bu: itemBu, setup: await api.admin.stageDeadlines(itemBu) })));
      setDeadlineViews(views);
    }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Deadlines could not be loaded.'); }
    finally { setDeadlineLoading(false); }
  }
  async function refreshCohortsAndDeadlineViews() {
    await loadCohorts();
    await loadDeadlineViews(businessUnits);
  }
  useEffect(() => {
    void Promise.all([load(), loadCohorts()]).then(([setup]) => {
      if (setup) void loadDeadlineViews(setup.businessUnits);
    });
  }, []);

  function update(index: number, patch: Partial<StageDeadline>) {
    setStages((current) => current.map((stage, i) => i === index ? { ...stage, ...patch } : stage));
  }
  async function save(applyToAll: boolean) {
    if (!bu || !cohortName.trim() || stages.some((stage) => !stage.name.trim() || !stage.deadline || !stage.questions.length)) {
      setError('Add a cohort name, deadline, and at least one question for every check-in.'); return;
    }
    setSaving(true); setError('');
    try {
      const result = await api.admin.saveStageDeadlines(bu, cohortId, cohortName, stages, editing ? targetBusinessUnits : undefined, applyToAll);
      await Promise.all([load(bu), refreshCohortsAndDeadlineViews()]); setOpen(false);
      setMessage(applyToAll ? `Setup applied to all ${result.appliedBusinessUnits} business units.` : `Cohort setup saved for ${bu}.`);
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Cohort setup could not be saved.'); }
    finally { setSaving(false); }
  }

  async function editCohort(cohortToEdit: CohortSummary) {
    await load(cohortToEdit.bu);
    setEditing(true); setTargetBusinessUnits([cohortToEdit.bu]); setOpen(true);
  }

  async function editDeadlineView(itemBu: string) {
    await load(itemBu);
    setEditing(true); setTargetBusinessUnits([itemBu]); setOpen(true);
  }

  async function deleteCohort(cohortToDelete: CohortSummary) {
    if (!window.confirm(`Delete ${cohortToDelete.cohortName} for ${cohortToDelete.bu}?`)) return;
    setError('');
    try { await api.admin.deleteCohort(cohortToDelete.bu); await refreshCohortsAndDeadlineViews(); setMessage(`${cohortToDelete.cohortName} deleted.`); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Cohort could not be deleted.'); }
  }

  const deadlineCohortOptions = [...new Set(deadlineViews.map(({ setup }) => setup.cohortName).filter(Boolean))].sort();
  const filteredDeadlineViews = deadlineViews.filter(({ bu: itemBu, setup }) => itemBu.toLowerCase().includes(deadlineBuQuery.trim().toLowerCase()) && (!deadlineCohortFilter || setup.cohortName === deadlineCohortFilter));

  return <section className="cohort-page">
    <header className="cohort-page-header"><div><p>TD ADMIN / {cycleLabel || 'ACTIVE CYCLE'}</p><h1>Cohort setup</h1><span>Add check-ins and manage deadlines by business unit.</span></div><button type="button" className="tracking-primary" disabled={loading} onClick={() => { setEditing(false); setCohortId(null); setCohortName(''); setStages(starterStages.map((stage) => ({ ...stage }))); setOpen(true); }}><Plus size={16} />Set up cohort</button></header>
    {message && <p className="stage-success" role="status">{message}</p>}
    {error && !open && <p className="stage-error" role="alert">{error}</p>}
    <section className="cohort-kpis"><article><CalendarDays size={20} /><div><strong>{cohorts.length}</strong><span>Active cohorts</span></div></article><article><Users size={20} /><div><strong>{cohorts.reduce((total, item) => total + item.participants, 0)}</strong><span>Participants</span></div></article></section>
    <section className="your-cohorts"><div className="your-cohorts-heading"><div><h2>Your cohorts</h2><p>Manage cohort check-ins, deadlines and business-unit coverage.</p></div></div>
      {!loading && !cohorts.length ? <div className="cohort-empty"><CalendarDays size={30} /><h2>No cohorts created</h2><p>Use Set up cohort to create the first one.</p></div> : <div className="cohort-table-wrap"><table><thead><tr><th>Cohort</th><th>Check-ins</th><th>Participants</th><th>Next deadline</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{cohorts.map((item) => <tr key={item.bu}><td><strong>{item.cohortName}</strong></td><td>{item.checkInCount}</td><td>{item.participants}</td><td>{item.nextDeadline ?? '—'}</td><td><span className="cohort-status">Active</span></td><td className="cohort-row-actions"><button type="button" aria-label={`Edit ${item.cohortName}`} title="Edit" onClick={() => void editCohort(item)}><Pencil size={15} /></button><button type="button" aria-label={`Delete ${item.cohortName}`} title="Delete" onClick={() => void deleteCohort(item)}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>}
    </section>
    <section className="bu-deadlines"><div className="bu-deadlines-heading"><div><h2>BU deadlines</h2><p>View every check-in deadline configured across business units.</p></div><div className="bu-deadline-filters"><label>Business unit<span className="bu-search-control"><Search size={15} aria-hidden="true" /><input type="search" value={deadlineBuQuery} placeholder="Search business units" aria-label="Search business units" onChange={(event) => setDeadlineBuQuery(event.target.value)} /></span></label><label>Cohort<select value={deadlineCohortFilter} aria-label="Filter by cohort" onChange={(event) => setDeadlineCohortFilter(event.target.value)}><option value="">All cohorts</option>{deadlineCohortOptions.map((name) => <option key={name} value={name}>{name}</option>)}</select></label></div></div>
      {deadlineLoading ? <p className="bu-deadlines-loading" role="status">Loading deadlines...</p> : !deadlineViews.length ? <div className="bu-deadlines-empty"><p>No deadlines have been configured yet.</p></div> : !filteredDeadlineViews.length ? <div className="bu-deadlines-empty"><p>No business units match the selected filters.</p></div> : <div className="bu-deadline-list">{filteredDeadlineViews.map(({ bu: itemBu, setup }) => { const expanded = expandedDeadlineBu === itemBu; const nextDeadline = setup.stages.map((stage) => stage.deadline).filter(Boolean).sort()[0] ?? '—'; return <article className={`bu-deadline-card${expanded ? ' expanded' : ''}`} key={itemBu}><div className="bu-deadline-card-header"><button type="button" className="bu-deadline-toggle" aria-expanded={expanded} aria-controls={`deadlines-${itemBu.replace(/[^a-z0-9]/gi, '-')}`} onClick={() => setExpandedDeadlineBu(expanded ? null : itemBu)}><span><small>Business unit</small><strong>{itemBu}</strong></span><span className="bu-deadline-card-detail"><small>Cohort</small><strong>{setup.cohortName || '—'}</strong></span><span className="bu-deadline-card-detail"><small>Next deadline</small><strong>{nextDeadline}</strong></span><span className="bu-deadline-card-detail"><small>Status</small><strong className="cohort-status">Active</strong></span><span className="bu-deadline-summary">{setup.stages.length} check-in{setup.stages.length === 1 ? '' : 's'}<ChevronDown size={17} aria-hidden="true" /></span></button><button type="button" className="bu-deadline-edit" onClick={() => void editDeadlineView(itemBu)}><Pencil size={14} aria-hidden="true" />Edit</button></div>{expanded && <div className="bu-deadlines-table" id={`deadlines-${itemBu.replace(/[^a-z0-9]/gi, '-')}`}><div className="bu-deadlines-context"><div><strong>{setup.cohortName}</strong>{setup.inheritedFrom && <small>Shared all-BU deadlines</small>}</div></div><table><thead><tr><th>Check-in or stage</th><th>Deadline</th></tr></thead><tbody>{setup.stages.map((stage) => <tr key={stage.id ?? stage.name}><td>{stage.name}</td><td>{stage.deadline}</td></tr>)}</tbody></table></div>}</article>; })}</div>}
    </section>
    {open && <div className="cohort-modal-backdrop"><section className="cohort-modal" role="dialog" aria-modal="true" aria-labelledby="cohort-setup-title">
      <header><h2 id="cohort-setup-title">Cohort setup</h2><button type="button" aria-label="Close" onClick={() => { setOpen(false); setError(''); }}><X size={17} /></button></header>
      <div className="cohort-modal-body">
        <label className="full">Cohort name<input value={cohortName} placeholder="e.g. Leadership Cohort 2026" onChange={(event) => setCohortName(event.target.value)} /></label>
        {editing && <div className="cohort-bu-dropdown full"><span>Apply changes to</span><details><summary>{targetBusinessUnits.length === businessUnits.length ? 'All business units' : targetBusinessUnits.length === 1 ? targetBusinessUnits[0] : `${targetBusinessUnits.length} business units selected`}</summary><div className="cohort-bu-options">{businessUnits.map((item) => <label key={item}><input type="checkbox" checked={targetBusinessUnits.includes(item)} onChange={(event) => setTargetBusinessUnits((current) => event.target.checked ? [...current, item] : current.filter((value) => value !== item))} />{item}</label>)}</div></details></div>}
        <div className="cohort-divider full"><strong>Check-ins and deadlines</strong><p>Add each check-in or stage and choose its deadline.</p></div>
        {stages.map((stage, index) => <div className="cohort-stage-row full" key={stage.id ?? index}>
          <label>Check-in or stage<input value={stage.name} placeholder="e.g. Q1 check-in" onChange={(event) => update(index, { name: event.target.value })} /></label>
          <label>Deadline<input type="date" value={stage.deadline} onChange={(event) => update(index, { deadline: event.target.value })} /></label>
          <button type="button" aria-label={`Remove ${stage.name || 'stage'}`} disabled={stages.length === 1} onClick={() => setStages((current) => current.filter((_, i) => i !== index))}><Trash2 size={16} /></button>
          <div className="question-template-picker"><details><summary>{stage.questions.length} question{stage.questions.length === 1 ? '' : 's'} selected</summary><div>{questionTemplates.map((question) => <label key={question.id}><input type="checkbox" checked={stage.questions.some((selected) => selected.id === question.id)} onChange={(event) => update(index, { questions: event.target.checked ? [...stage.questions, question] : stage.questions.filter((selected) => selected.id !== question.id) })} /><span>{question.prompt}<small>{question.type === 'SCALE' ? '1–5 scale' : 'Written response'}</small></span></label>)}</div></details></div>
        </div>)}
        <button type="button" className="cohort-add-stage full" disabled={stages.length >= 30} onClick={() => setStages((current) => [...current, { name: '', deadline: '', questions: [] }])}><Plus size={16} />Add check-in or stage</button>
        {error && <p className="stage-error full" role="alert">{error}</p>}
      </div>
      <footer><button type="button" onClick={() => setOpen(false)}>Cancel</button>{editing && <button type="button" disabled={saving} onClick={() => void save(true)}>Apply to all BUs</button>}<button type="button" className="tracking-primary" disabled={saving || (editing && !targetBusinessUnits.length)} onClick={() => void save(false)}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Save'}</button></footer>
    </section></div>}
  </section>;
}
