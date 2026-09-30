import { useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { StageDeadlineSetup } from '../lib/api';

export function BuhrDeadlines() {
  const [setup, setSetup] = useState<StageDeadlineSetup | null>(null);
  const [bu, setBu] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(selectedBu?: string) {
    setLoading(true); setError('');
    try { const result = await api.hr.stageDeadlines(selectedBu); setSetup(result); setBu(selectedBu || result.businessUnits[0] || ''); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Deadlines could not be loaded.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  return <section className="bu-deadlines buhr-deadlines"><div className="bu-deadlines-heading"><div><h2>Check-in deadlines</h2><p>Deadlines for your mapped business unit.</p></div>{(setup?.businessUnits.length ?? 0) > 1 && <label>Business unit<select value={bu} onChange={(event) => void load(event.target.value)}>{setup?.businessUnits.map((item) => <option key={item}>{item}</option>)}</select></label>}</div>
    {loading ? <p className="bu-deadlines-loading" role="status">Loading deadlines...</p> : error ? <p className="bu-deadlines-empty" role="alert">{error}</p> : !setup?.stages.length ? <div className="bu-deadlines-empty"><p>No deadlines have been configured yet.</p></div> : <div className="bu-deadlines-table"><div className="bu-deadlines-context"><div><strong>{setup.cohortName}</strong>{setup.inheritedFrom && <small>Shared all-BU deadlines</small>}</div><span>{bu}</span></div><table><thead><tr><th>Check-in or stage</th><th>Deadline</th></tr></thead><tbody>{setup.stages.map((stage) => <tr key={stage.id ?? stage.name}><td>{stage.name}</td><td>{stage.deadline}</td></tr>)}</tbody></table></div>}
  </section>;
}
