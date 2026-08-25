import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSdp } from '../state/SdpContext';
import { SaveIndicator } from '../components/SaveIndicator';
import { AskPrompt } from '../components/AskPrompt';
import { LcfwModal } from '../components/LcfwModal';
import { ResponseGuideModal } from '../components/ResponseGuideModal';
import { q1WordChips, primingPrompts } from '../content/reflection';

const MIN_LEN = 80;

export function Reflect() {
  const { state, updateReflection, lastSavedAt } = useSdp();
  const navigate = useNavigate();
  const [lcfwOpen, setLcfwOpen] = useState(false);
  const [guideQ, setGuideQ] = useState<number | null>(null);
  const [errors, setErrors] = useState<number[]>([]);
  const [section, setSection] = useState<'will' | 'understanding'>('will');
  const submitted = state.status !== 'NOT_STARTED' && state.status !== 'DRAFT';

  const answeredCount = [
    state.reflection.q1Words.length > 0 || state.reflection.q1Text.trim().length > 0,
    state.reflection.q2Text.trim().length >= MIN_LEN,
    state.reflection.q3Text.trim().length >= MIN_LEN,
    state.reflection.q4Text.trim().length >= MIN_LEN,
    state.reflection.q5Text.trim().length >= MIN_LEN,
    state.reflection.q6Text.trim().length >= MIN_LEN,
  ].filter(Boolean).length;

  function toggleWord(word: string) {
    if (submitted) return;
    const has = state.reflection.q1Words.includes(word);
    const next = has
      ? state.reflection.q1Words.filter((w) => w !== word)
      : state.reflection.q1Words.length < 3
        ? [...state.reflection.q1Words, word]
        : state.reflection.q1Words;
    const additionalText = state.reflection.q1Text.replace(/^Selected:[^\n]+\n?/, '');
    const q1Text = next.length > 0
      ? `Selected: ${next.join(', ')}${additionalText ? `\n${additionalText}` : ''}`
      : additionalText;
    updateReflection({ q1Words: next, q1Text });
  }

  function handleContinue() {
    const missing: number[] = [];
    if (state.reflection.q2Text.trim().length < MIN_LEN) missing.push(2);
    if (state.reflection.q3Text.trim().length < MIN_LEN) missing.push(3);
    if (state.reflection.q4Text.trim().length < MIN_LEN) missing.push(4);
    if (state.reflection.q5Text.trim().length < MIN_LEN) missing.push(5);
    if (missing.length > 0) {
      setErrors(missing);
      window.alert(`Please write at least ${MIN_LEN} characters for question ${missing.join(', ')} before moving on. A short, honest paragraph is usually enough.`);
      const firstMissing = missing[0];
      if (firstMissing <= 3) setSection('will');
      window.setTimeout(() => {
        const card = document.getElementById(`q-card-${firstMissing}`);
        card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card?.querySelector('textarea')?.focus();
      }, 0);
      return;
    }
    setErrors([]);
    navigate('/vision');
  }

  function handleSectionContinue() {
    const missing = [
      state.reflection.q2Text.trim().length < MIN_LEN ? 2 : null,
      state.reflection.q3Text.trim().length < MIN_LEN ? 3 : null,
    ].filter((q): q is number => q !== null);
    if (missing.length > 0) {
      setErrors(missing);
      window.alert(`Please write at least ${MIN_LEN} characters for question ${missing.join(', ')} before moving on. A short, honest paragraph is usually enough.`);
      window.setTimeout(() => {
        const card = document.getElementById(`q-card-${missing[0]}`);
        card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card?.querySelector('textarea')?.focus();
      }, 0);
      return;
    }
    setErrors([]);
    setSection('understanding');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAnswerChange(key: 'q2Text' | 'q3Text' | 'q4Text' | 'q5Text', qNum: number, value: string) {
    updateReflection({ [key]: value });
    if (value.trim().length >= MIN_LEN) {
      setErrors((current) => current.filter((q) => q !== qNum));
    }
  }

  const counter = (text: string) => {
    const length = text.trim().length;
    return (
      <div style={{ fontSize: 11, color: length >= MIN_LEN ? 'var(--green)' : 'var(--muted)', marginTop: 6 }}>
        {length} characters entered &middot; minimum {MIN_LEN} characters required
      </div>
    );
  };

  return (
    <div className="screen-inner">
      {submitted && <div className="deadline-lock" role="status"><span aria-hidden="true">&#128274;</span><div><strong>Submission deadline has passed</strong><p>Your submitted reflection is now locked and cannot be edited.</p></div></div>}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '12px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--mid)', whiteSpace: 'nowrap' }}>Reflection progress</div>
        <div style={{ flex: 1, background: 'var(--cream-d)', borderRadius: 20, height: 7, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--blue)', borderRadius: 20, width: `${(answeredCount / 6) * 100}%`, transition: 'width .4s ease' }} />
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--blue)', whiteSpace: 'nowrap' }}>{answeredCount} of 6</div>
      </div>

      {section === 'will' && <><div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button onClick={() => setLcfwOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--blue-xl)', border: '1px solid var(--blue-l)', color: 'var(--blue)', fontSize: 12, padding: '5px 11px', borderRadius: 20, cursor: 'pointer', fontWeight: 500 }}>
            LCFW Overview
          </button>
        </div>
        <h1 className="page-title" style={{ fontSize: 28 }}>Who I am and what drives me</h1>
        <p className="page-sub">These questions invite you to reflect on who you are, what you value, and what drives you.</p>
      </div>

      {/* Q1 */}
      <div className="q-card">
        <div className="q-num">Question 1</div>
        <div className="q-text"><em style={{ fontStyle: 'italic', color: 'var(--mid)', fontWeight: 400, fontSize: 15 }}>"Who I am"</em><br />In three words, I would describe myself as...</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 9 }}>Select up to three</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
            {q1WordChips.map((word) => {
              const selected = state.reflection.q1Words.includes(word);
              return (
                <button
                  key={word}
                  disabled={submitted}
                  onClick={() => toggleWord(word)}
                  style={{
                    padding: '6px 13px', borderRadius: 20, fontSize: 12.5, fontWeight: 500, cursor: submitted ? 'default' : 'pointer',
                    border: '1.5px solid ' + (selected ? 'var(--blue)' : 'var(--cream-border)'),
                    background: selected ? 'var(--blue)' : '#fff', color: selected ? '#fff' : 'var(--mid)',
                  }}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
        <textarea
          className="q-input"
          rows={3}
          placeholder="Your own words, or build on the options selected above..."
          value={state.reflection.q1Text}
          disabled={submitted}
          onChange={(e) => updateReflection({ q1Text: e.target.value })}
        />
      </div>

      {/* Q2-Q3 */}
      {[2, 3].map((qNum) => {
        const key = `q${qNum}Text` as 'q2Text' | 'q3Text' | 'q4Text' | 'q5Text';
        const value = state.reflection[key];
        const prompts = primingPrompts[qNum] ?? [];
        const hasError = errors.includes(qNum) && value.trim().length < MIN_LEN;
        const questionText: Record<number, string> = {
          2: 'The qualities I want to be known for at work are...',
          3: 'The work I genuinely enjoy doing is...',
          4: 'Looking back on the past year, what moments best reflect who you are at your best?',
          5: 'Looking back on the past year, what moments best reflect where you still have room to grow?',
        };
        return (
          <div className="q-card" id={`q-card-${qNum}`} key={qNum} style={hasError ? { borderColor: 'var(--red)' } : undefined}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="q-num">Question {qNum}</div>
              <button onClick={() => setGuideQ(qNum)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--cream-d)', border: '1px solid var(--cream-border)', color: 'var(--ink)', fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Response Guide
              </button>
            </div>
            <div className="q-text">{questionText[qNum]}</div>
            <textarea
              className="q-input"
              rows={4}
              value={value}
              disabled={submitted}
              onChange={(e) => handleAnswerChange(key, qNum, e.target.value)}
            />
            {counter(value)}
            {hasError && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>Please write at least {MIN_LEN} characters before continuing.</div>}
            <AskPrompt prompts={prompts} />
          </div>
        );
      })}

      <div className="nav-row">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>&larr; Back</button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SaveIndicator lastSavedAt={lastSavedAt} />
          <button className="btn btn-primary" onClick={handleSectionContinue}>Continue &rarr;</button>
        </div>
      </div>
      </>}

      {section === 'understanding' && <>
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title" style={{ fontSize: 28 }}>Where I stand today</h1>
          <p className="page-sub">Honest reflection on where you have done well, where you could grow, and where you want to go.</p>
        </div>
        {[4, 5].map((qNum) => {
          const key = `q${qNum}Text` as 'q4Text' | 'q5Text';
          const value = state.reflection[key];
          const hasError = errors.includes(qNum) && value.trim().length < MIN_LEN;
          const question = qNum === 4
            ? 'Looking back on the past year, what moments best reflect who you are at your best?'
            : 'Looking back on the past year, what moments best reflect where you still have room to grow?';
          return <div className="q-card" id={`q-card-${qNum}`} key={qNum} style={hasError ? { borderColor: 'var(--red)' } : undefined}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="q-num">Question {qNum}</div>
              <button onClick={() => setGuideQ(qNum)} style={{ background: 'var(--cream-d)', border: '1px solid var(--cream-border)', color: 'var(--ink)', fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: 500 }}>Response Guide</button>
            </div>
            <div className="q-text"><em style={{ fontStyle: 'italic', color: 'var(--mid)', fontWeight: 400, fontSize: 15 }}>&quot;Where I stand today&quot;</em><br />{question}</div>
            <textarea className="q-input" rows={6} value={value} disabled={submitted} placeholder="Start with the situations, not the answer. Reflect on real experiences from the past year, then consider what those experiences reveal about your strengths and areas for growth." onChange={(e) => handleAnswerChange(key, qNum, e.target.value)} />
            {counter(value)}
            {hasError && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>Please write at least {MIN_LEN} characters before continuing.</div>}
            <AskPrompt prompts={primingPrompts[qNum] ?? []} />
          </div>;
        })}
        <div className="nav-row">
          <button className="btn btn-ghost" onClick={() => { setSection('will'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>&larr; Back</button>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <SaveIndicator lastSavedAt={lastSavedAt} />
            <button className="btn btn-primary" onClick={handleContinue}>Continue to your future vision &rarr;</button>
          </div>
        </div>
      </>}

      <LcfwModal open={lcfwOpen} onClose={() => setLcfwOpen(false)} />
      <ResponseGuideModal qNum={guideQ} onClose={() => setGuideQ(null)} />
    </div>
  );
}
