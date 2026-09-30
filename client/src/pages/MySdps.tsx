import { useEffect, useState } from 'react';
import { CalendarDays, ChevronRight, FileText } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { HistoricalSdp } from '../lib/api';

const reflectionLabels = [
  ['q1Text', 'Who I am'], ['q2Text', 'What gives me energy'], ['q3Text', 'What drains my energy'],
  ['q4Text', 'The professional I want to become'], ['q5Text', 'What I want to build'], ['q6Text', 'What could get in my way'],
] as const;

export function MySdps() {
  const [plans, setPlans] = useState<HistoricalSdp[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.sdp.history().then((items) => { if (active) { setPlans(items); setSelectedId(items[0]?.sdpId ?? ''); } }).catch((err) => { if (active) setError(err instanceof ApiError ? err.message : 'Your previous SDPs could not be loaded.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const selected = plans.find((plan) => plan.sdpId === selectedId);

  if (loading) return <div className="screen-inner my-sdps-page"><p role="status">Loading your SDPs...</p></div>;
  return <div className="screen-inner wide my-sdps-page">
    <header><p>MY WORKSPACE</p><h1 className="page-title">My SDPs</h1><span>Review the development plans you created across annual cohorts.</span></header>
    {error && <p className="my-sdps-error" role="alert">{error}</p>}
    {!error && !plans.length ? <div className="my-sdps-empty"><FileText size={34} /><h2>No SDPs yet</h2><p>Your annual plans will appear here after you begin your first SDP.</p></div> : <div className="my-sdps-layout">
      <aside aria-label="Annual SDP plans">{plans.map((plan) => <button type="button" className={selectedId === plan.sdpId ? 'active' : ''} key={plan.sdpId} onClick={() => setSelectedId(plan.sdpId)}><CalendarDays size={17} /><span><strong>{plan.cohort?.name || `SDP ${plan.cycle.label}`}</strong><small>{plan.cycle.label} · {plan.status.replaceAll('_', ' ')}</small></span><ChevronRight size={16} /></button>)}</aside>
      {selected && <article className="historical-sdp">
        <div className="historical-sdp-heading"><div><span>{selected.cycle.label}</span><h2>{selected.cohort?.name || 'Annual SDP'}</h2><p>{selected.submittedAt ? `Submitted ${new Date(selected.submittedAt).toLocaleDateString()}` : 'Draft plan'}</p></div><span className="historical-readonly">Read only</span></div>
        {selected.reflection && <section><h3>Reflection</h3>{selected.reflection.q1Words.length > 0 && <div className="historical-answer"><strong>Words that describe me</strong><p>{selected.reflection.q1Words.join(', ')}</p></div>}{reflectionLabels.map(([key, label]) => selected.reflection?.[key] ? <div className="historical-answer" key={key}><strong>{label}</strong><p>{selected.reflection[key]}</p></div> : null)}</section>}
        <section><h3>Development goals</h3>{selected.goals.length ? selected.goals.map((goal, index) => <div className="historical-goal" key={goal.goalId}><span>Goal {index + 1} · {goal.domain}</span><h4>{goal.title}</h4><p><strong>Why it matters:</strong> {goal.whyItMatters}</p><p><strong>I will know I have grown when:</strong> {goal.grownWhen}</p><div><p><strong>Do:</strong> {goal.actionPlan.do}</p><p><strong>Learn:</strong> {goal.actionPlan.learn}</p><p><strong>Connect:</strong> {goal.actionPlan.connect}</p></div><p><strong>Support needed:</strong> {goal.supportNeeded}</p></div>) : <p className="historical-none">No goals were added to this plan.</p>}</section>
      </article>}
    </div>}
  </div>;
}
