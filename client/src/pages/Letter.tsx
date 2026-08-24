import { useSdp } from '../state/SdpContext';
import { useMe } from '../lib/useMe';

const sections: { key: keyof ReturnType<typeof useSdp>['state']['reflection']; label: string }[] = [
  { key: 'q1Text', label: 'Who I am' },
  { key: 'q2Text', label: 'Who I want to be known as' },
  { key: 'q3Text', label: 'The work that energises me' },
  { key: 'q4Text', label: 'Where I showed up well this year' },
  { key: 'q5Text', label: 'Where I want to grow' },
  { key: 'q6Text', label: 'The professional I am becoming' },
];

/**
 * FR-EMP-090 to FR-EMP-096. Deterministic template assembly from the
 * employee's own words, never journal content (FR-X-083). Auto-refreshes
 * because it reads directly from SdpContext state, no manual regenerate step.
 */
export function Letter() {
  const { state } = useSdp();
  const { me } = useMe();

  const hasAnyContent = sections.some((s) => state.reflection[s.key]) || state.goals.length > 0;

  return (
    <div className="screen-inner">
      <div className="pillar-tag" style={{ background: 'var(--blue-l)', color: 'var(--blue)' }}>My Letter</div>
      <h1 className="page-title">A letter to myself</h1>
      <p className="page-sub" style={{ marginBottom: 24 }}>
        Composed from your own reflection and goals. This is the artefact you carry forward into next year.
      </p>

      {!hasAnyContent ? (
        <div className="placeholder-card">
          <p>Your letter will appear here once you have written some of your reflection or set a goal.</p>
        </div>
      ) : (
        <div className="letter-modal" style={{ margin: '0 auto', maxWidth: 'none' }}>
          <div className="letter-top">
            <div className="letter-eyebrow">Self Development Plan &middot; Bajaj Auto &middot; 2026-27</div>
            <div className="letter-heading">A letter to myself</div>
            <div className="letter-meta">From: {me?.employee.fullName ?? 'You'}</div>
          </div>
          <div className="letter-body">
            {sections.map((s) => (
              <div className="letter-sec" key={s.key}>
                <div className="letter-sec-lbl">{s.label}</div>
                <div className="letter-text" style={!state.reflection[s.key] ? { color: 'var(--mid)' } : undefined}>
                  {state.reflection[s.key] || `You have not answered "${s.label}" yet.`}
                </div>
              </div>
            ))}
            <div className="letter-sec">
              <div className="letter-sec-lbl">My development goals for this year</div>
              {state.goals.length === 0 ? (
                <div className="letter-goal-item"><h4>No goals set yet.</h4></div>
              ) : (
                state.goals.map((g) => (
                  <div className="letter-goal-item" key={g.id}>
                    <h4>{g.title || 'Untitled goal'}</h4>
                    <p>{g.whyItMatters}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="letter-footer">
            <button className="btn btn-secondary" onClick={() => window.print()}>&#8681; Download as PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
