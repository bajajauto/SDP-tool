import { useEffect, useState } from 'react';
import { CalendarDays, Plus, Upload, X } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { CohortConfig, StageDeadline } from '../lib/api';

const emptyCohort: CohortConfig = { name: '', dcType: 'EX_TO_LX', eventStart: '', eventEnd: '', participantFileName: null };
const starterStages: StageDeadline[] = [
  { name: 'Role Interview', deadline: '' }, { name: 'Photograph', deadline: '' },
  { name: 'Self Reflection', deadline: '' }, { name: 'Nomination', deadline: '' },
  { name: '360 Cutoff', deadline: '' },
];

export function StageDeadlineSetup() {
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [bu, setBu] = useState('');
  const [cycleLabel, setCycleLabel] = useState('');
  const [cohort, setCohort] = useState<CohortConfig>(emptyCohort);
  const [stages, setStages] = useState<StageDeadline[]>(starterStages);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load(selectedBu?: string) {
    setLoading(true); setError('');
    try {
      const setup = await api.admin.stageDeadlines(selectedBu);
      setBusinessUnits(setup.businessUnits); setBu(selectedBu || setup.businessUnits[0] || ''); setCycleLabel(setup.cycle.label);
      setCohort(setup.cohort ?? { ...emptyCohort });
      setStages(setup.stages.length ? setup.stages : starterStages.map((stage) => ({ ...stage })));
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Cohort setup could not be loaded.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  function updateStage(index: number, deadline: string) {
    setStages((current) => current.map((stage, i) => i === index ? { ...stage, deadline } : stage));
  }
  async function save(applyToAll: boolean) {
    if (!bu || !cohort.name.trim() || !cohort.eventStart || !cohort.eventEnd || stages.some((stage) => !stage.deadline)) {
      setError('Complete the cohort details and every stage deadline before creating the cohort.'); return;
    }
    setSaving(true); setError('');
    try {
      const result = await api.admin.saveStageDeadlines(bu, cohort, stages, applyToAll);
      await load(bu); setOpen(false);
      setMessage(applyToAll ? `Cohort applied to all ${result.appliedBusinessUnits} business units.` : `Cohort saved for ${bu}.`);
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Cohort could not be saved.'); }
    finally { setSaving(false); }
  }

  return <section className="cohort-page">
    <header className="cohort-page-header"><div><p>TD ADMIN / {cycleLabel || 'ACTIVE CYCLE'}</p><h1>Cohort setup</h1><span>Create and manage development-centre cohorts and their stage deadlines.</span></div><button type="button" className="tracking-primary" disabled={loading} onClick={() => setOpen(true)}><Plus size={16} />Create cohort</button></header>
    <div className="cohort-toolbar"><label>Business unit<select value={bu} disabled={loading} onChange={(event) => void load(event.target.value)}>{businessUnits.map((item) => <option key={item}>{item}</option>)}</select></label></div>
    {message && <p className="stage-success" role="status">{message}</p>}
    {error && !open && <p className="stage-error" role="alert">{error}</p>}
    {!loading && cohort.name ? <article className="cohort-summary"><div><span>ACTIVE COHORT</span><h2>{cohort.name}</h2><p>{cohort.dcType === 'EX_TO_LX' ? 'EX to LX' : 'LX to Leader'} · {cohort.eventStart} to {cohort.eventEnd}</p></div><button type="button" onClick={() => setOpen(true)}>Edit cohort</button></article> : !loading && <div className="cohort-empty"><CalendarDays size={30} /><h2>No cohort configured for {bu}</h2><p>Create a cohort to set its event window and stage deadlines.</p></div>}
    {open && <div className="cohort-modal-backdrop"><section className="cohort-modal" role="dialog" aria-modal="true" aria-labelledby="create-cohort-title">
      <header><h2 id="create-cohort-title">{cohort.name ? 'Edit Cohort' : 'Create Cohort'}</h2><button type="button" aria-label="Close" onClick={() => { setOpen(false); setError(''); }}><X size={17} /></button></header>
      <div className="cohort-modal-body">
        <label className="full">Cohort name<input value={cohort.name} placeholder="e.g. EX to LX Cohort '26" onChange={(event) => setCohort({ ...cohort, name: event.target.value })} /></label>
        <label className="full">DC type<select value={cohort.dcType} onChange={(event) => setCohort({ ...cohort, dcType: event.target.value as CohortConfig['dcType'] })}><option value="EX_TO_LX">EX to LX</option><option value="LX_TO_LEADER">LX to Leader</option></select></label>
        <label>DC event start<input type="date" value={cohort.eventStart} onChange={(event) => setCohort({ ...cohort, eventStart: event.target.value })} /></label>
        <label>DC event end<input type="date" value={cohort.eventEnd} onChange={(event) => setCohort({ ...cohort, eventEnd: event.target.value })} /></label>
        <div className="cohort-divider full"><strong>Stage deadlines</strong><p>Every stage deadline must be on or before the DC event end date.</p></div>
        {stages.map((stage, index) => <label key={stage.id ?? index}>{stage.name} deadline<input type="date" max={cohort.eventEnd || undefined} value={stage.deadline} onChange={(event) => updateStage(index, event.target.value)} /></label>)}
        <div className="cohort-divider full"><strong>Participant master sheet</strong><p>Upload the completed participant spreadsheet. Participant accounts and BUHR access will be created with the cohort.</p></div>
        <label className="cohort-upload full"><Upload size={18} /><span>{cohort.participantFileName || 'Choose participant master sheet (.xlsx)'}</span><input type="file" accept=".xlsx,.xls" onChange={(event) => setCohort({ ...cohort, participantFileName: event.target.files?.[0]?.name ?? null })} /></label>
        {error && <p className="stage-error full" role="alert">{error}</p>}
      </div>
      <footer><button type="button" onClick={() => setOpen(false)}>Cancel</button><button type="button" disabled={saving} onClick={() => void save(true)}>Apply to all BUs</button><button type="button" className="tracking-primary" disabled={saving} onClick={() => void save(false)}>{saving ? 'Saving...' : 'Create cohort'}</button></footer>
    </section></div>}
  </section>;
}
