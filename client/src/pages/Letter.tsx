import { useSdp } from '../state/SdpContext';
import { useMe } from '../lib/useMe';
import { q1WordChips } from '../content/reflection';

const sections: { key: keyof ReturnType<typeof useSdp>['state']['reflection']; letterPrompt: string }[] = [
  { key: 'q1Text', letterPrompt: 'Currently, I define myself as' },
  { key: 'q2Text', letterPrompt: 'More than anything, I want to be known as' },
  { key: 'q3Text', letterPrompt: 'The work that truly energises me is' },
  { key: 'q4Text', letterPrompt: 'This year, I showed up at my best when' },
  { key: 'q5Text', letterPrompt: 'The place I most want to grow is' },
  { key: 'q6Text', letterPrompt: 'And so, the professional I am becoming is' },
];

/**
 * FR-EMP-090 to FR-EMP-096. Deterministic template assembly from the
 * employee's own words, never journal content (FR-X-083). Auto-refreshes
 * because it reads directly from SdpContext state, no manual regenerate step.
 */
export function Letter() {
  const { state } = useSdp();
  const { me } = useMe();

  // Debug: log q1Words
  console.log('Q1 Words:', state.reflection.q1Words);
  console.log('Q1 Text:', state.reflection.q1Text);

  const hasAnyContent = sections.some((s) => state.reflection[s.key]) || state.goals.length > 0;
  const today = new Date();
  const letterDate = today.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="screen-inner letter-page">
      <h1 className="page-title">A letter to myself</h1>
      <p className="page-sub" style={{ marginBottom: 24 }}>
        Composed from your own reflection and goals. This is the artefact you carry forward into next year.
      </p>

      {!hasAnyContent ? (
        <div className="placeholder-card">
          <p>Your letter will appear here once you have written some of your reflection or set a goal.</p>
        </div>
      ) : (
        <div className="letter-modal letter-page-card" style={{ margin: '0 auto', maxWidth: 'none' }}>
          <div className="letter-top">
            <div className="letter-eyebrow">Self Development Plan &middot; Bajaj Auto &middot; 2026-27</div>
            <div className="letter-heading">A letter to myself</div>
            <div className="letter-meta">From: {me?.employee.fullName ?? 'You'}</div>
          </div>
          <div className="letter-body">
            <div className="letter-date">{letterDate}</div>
            <div className="letter-salutation">Dear {me?.employee.fullName?.split(' ')[0] ?? 'You'},</div>

            {sections.map((s, idx) => {
              const content = state.reflection[s.key];
              const text = (typeof content === 'string' ? content : '').trim();
              const isQ1 = idx === 0;
              // Filter q1Words to only include valid chip options
              const validQ1Words = isQ1
                ? state.reflection.q1Words?.filter((w) => q1WordChips.includes(w)) ?? []
                : [];
              const q1WordsStr = validQ1Words.length > 0 ? validQ1Words.join(', ') : '';
              const answer = isQ1
                ? [q1WordsStr, text].filter(Boolean).join('. ')
                : text;

              return (
                <div className="letter-sec" key={s.key}>
                  <div className="letter-text">
                    <span className="letter-stem">{s.letterPrompt} </span>
                    <span>{answer || '[not yet answered]'}</span>
                  </div>
                </div>
              );
            })}

            <div className="letter-sec" style={{ marginTop: 26 }}>
              <div className="letter-text">And so these are the goals I am holding myself to this year:</div>
              <div className="letter-enclosure">
                {state.goals.length === 0 ? (
                  <div className="letter-goal-item"><h4>No goals set yet.</h4></div>
                ) : (
                  state.goals.map((g) => (
                    <div className="letter-goal-item" key={g.id}>
                      <h4>{g.title || 'Untitled goal'}</h4>
                      <p>{g.whyItMatters || 'No description provided'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="letter-signoff">
              <div className="so-close">Onwards,</div>
              <div className="so-name">{me?.employee.fullName ?? 'You'}</div>
              <div className="so-org">Bajaj Auto &middot; 2026-27</div>
            </div>
          </div>
          <div className="letter-footer">
            <button className="btn btn-secondary" onClick={() => window.print()}>&#8681; Download as PDF</button>
            <button className="btn btn-ghost" onClick={() => window.history.back()}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
