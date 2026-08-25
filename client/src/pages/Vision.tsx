import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSdp } from '../state/SdpContext';
import { SaveIndicator } from '../components/SaveIndicator';
import { ResponseGuideModal } from '../components/ResponseGuideModal';
import { Modal } from '../components/Modal';
import { q6Prompts } from '../content/reflection';

const MIN_LEN = 80;

const chapters = [
  { label: 'Chapter 1', name: 'Who I am' },
  { label: 'Chapter 2', name: 'What drives me' },
  { label: 'Chapter 3', name: 'Where I stand' },
];

export function Vision() {
  const { state, updateReflection, lastSavedAt } = useSdp();
  const navigate = useNavigate();
  const [guideOpen, setGuideOpen] = useState(false);
  const [error, setError] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const submitted = state.status !== 'NOT_STARTED' && state.status !== 'DRAFT';

  function handleContinue() {
    if (state.reflection.q6Text.trim().length < MIN_LEN) {
      setError(true);
      return;
    }
    setError(false);
    if (state.goals.length > 0) {
      navigate('/goals');
      return;
    }
    setPauseOpen(true);
  }

  return (
    <div className="screen-inner">
      <div style={{ marginBottom: 20 }}>
        <div className="pillar-tag" style={{ background: 'var(--blue-l)', color: 'var(--blue)' }}>Who I want to become</div>
        <h1 className="page-title">Your future vision</h1>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '22px 24px', boxShadow: 'var(--sh)', marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>Your reflection so far</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {chapters.map((c) => (
            <div key={c.label} style={{ flex: 1, background: 'var(--blue-xl)', border: '1px solid var(--blue-l)', borderRadius: 'var(--r-sm)', padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 4 }}>{c.label} &#10003;</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
            </div>
          ))}
          <div style={{ flex: 1, background: '#fff', border: '2px solid var(--blue-d)', borderRadius: 'var(--r-sm)', padding: '14px 12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(31,41,55,.1)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue-d)', textTransform: 'uppercase', marginBottom: 4 }}>Chapter 4 &middot; Now</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>Who I want to become</div>
          </div>
        </div>
      </div>

      <div className="q-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="q-num">Question 6</div>
          <button onClick={() => setGuideOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--cream-d)', border: '1px solid var(--cream-border)', color: 'var(--ink)', fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: 500 }}>
            Response Guide
          </button>
        </div>
        <p style={{ fontSize: 15.5, color: 'var(--ink)', lineHeight: 1.75, marginBottom: 18 }}>
          You have reflected on your strengths, your growth areas, and the experiences that have shaped you. Now let's put it all together.
        </p>
        <p style={{ fontSize: 14, color: 'var(--mid)', lineHeight: 1.85, marginBottom: 18 }}>
          Imagine that three years have passed and you have become the person you aspire to be.
        </p>
        <ul style={{ listStyle: 'none', marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q6Prompts.map((p) => (
            <li key={p} style={{ fontSize: 14, color: 'var(--mid)', lineHeight: 1.6, display: 'flex', gap: 10 }}>
              <span style={{ color: 'var(--blue)', fontWeight: 700, flexShrink: 0 }}>&#9658;</span>{p}
            </li>
          ))}
        </ul>
        <p style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.75, marginBottom: 14, fontWeight: 500 }}>Describe that version of yourself.</p>
        <textarea
          className="q-input"
          rows={8}
          value={state.reflection.q6Text}
          disabled={submitted}
          onChange={(e) => updateReflection({ q6Text: e.target.value })}
          placeholder="Draw on everything you have reflected on so far. Be as detailed as you wish."
        />
        <div style={{ fontSize: 11, color: state.reflection.q6Text.trim().length >= MIN_LEN ? 'var(--green)' : 'var(--muted)', marginTop: 6 }}>
          {state.reflection.q6Text.trim().length} characters entered &middot; minimum {MIN_LEN} characters required
        </div>
        {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>Please write at least {MIN_LEN} characters before continuing.</div>}
      </div>

      <div className="nav-row">
        <button className="btn btn-ghost" onClick={() => navigate('/reflect')}>&larr; Back to Reflection</button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SaveIndicator lastSavedAt={lastSavedAt} />
          <button className="btn btn-primary" onClick={handleContinue}>Continue to Goal Setting &rarr;</button>
        </div>
      </div>

      <ResponseGuideModal qNum={guideOpen ? 6 : null} onClose={() => setGuideOpen(false)} />
      <Modal open={pauseOpen} onClose={() => setPauseOpen(false)} maxWidth={500}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 12 }}>Take a moment</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)', marginBottom: 10 }}>Before you move to Goal Setting</h2>
        <p style={{ fontSize: 14, color: 'var(--mid)', lineHeight: 1.7, marginBottom: 16 }}>The value of reflection is not in the answers themselves, but in the patterns they reveal. Take a moment to read through your responses. What do they tell you about who you are today, and who you are working towards becoming?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          {[
            ['A recurring theme', 'Did the same strength or gap show up more than once? Your most meaningful goal is usually hiding there.'],
            ['The gap that matters most', 'Look at the best version you described and where you placed yourself today. Which part of that distance is most honest to close?'],
            ['What you almost did not write', 'Was there a moment where you wrote something safe instead of something true? That is usually where the real goal lives.'],
          ].map(([title, body]) => <div key={title} style={{ background: 'var(--cream)', borderRadius: 'var(--r-sm)', padding: '13px 16px' }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{title}</div><div style={{ fontSize: 13, color: 'var(--mid)', lineHeight: 1.6 }}>{body}</div></div>)}
        </div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/goals')}>Continue to Goal Setting</button>
      </Modal>
    </div>
  );
}
