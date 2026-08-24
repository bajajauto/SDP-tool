import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSdp } from '../state/SdpContext';
import { copy } from '../content/copy';
import { Modal } from '../components/Modal';

export function Landing() {
  const { state } = useSdp();
  const navigate = useNavigate();
  const [beginOpen, setBeginOpen] = useState(false);
  const ctaLabel =
    state.status === 'NOT_STARTED' ? copy.landing.beginCta
    : state.status === 'DRAFT' ? copy.landing.continueCta
    : copy.landing.viewPlanCta;
  const ctaTarget = state.status === 'NOT_STARTED' || state.status === 'DRAFT' ? '/reflect' : '/dashboard';

  function handleCta() {
    if (state.status === 'NOT_STARTED') setBeginOpen(true);
    else navigate(ctaTarget);
  }

  return (
    <div>
      <div style={{ background: 'var(--blue-d)', padding: '64px 0 56px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 18 }}>
            Bajaj Auto &middot; 2026-27
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 400, color: '#fff', lineHeight: 1.12, marginBottom: 20 }}>
            Your Self Development Plan
          </h1>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.72)', lineHeight: 1.75, maxWidth: 640, margin: '0 auto 32px' }}>
            {copy.landing.heroSubtext}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', maxWidth: 680, margin: '0 auto' }}>
            {[
              'Self-reflect on who you are and who you want to become',
              'Set one to three development goals for yourself',
              'Build a concrete action plan and track your growth',
            ].map((text, i) => (
              <div key={i} style={{ flex: 1, minWidth: 180, padding: '0 16px', borderRight: i < 2 ? '1px solid rgba(255,255,255,.12)' : undefined }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: '#fff', marginBottom: 4 }}>0{i + 1}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.65)', lineHeight: 1.55 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', padding: '52px 0', borderBottom: '1px solid var(--cream-border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              Your reflection journey
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 500 }}>Four chapters of self-discovery</h2>
          </div>
          <div style={{ display: 'flex', gap: 0, maxWidth: 920, margin: '0 auto' }}>
            {[
              { tint: '#EBF2FA', border: '#C5D5F0', name: 'Who I am', sub: 'Identity & personality' },
              { tint: '#DBE7F6', border: '#A6BFE5', name: 'What drives me', sub: 'Energy & values' },
              { tint: '#C5D5F0', border: '#A6BFE5', name: 'Where I stand', sub: 'Strengths & growth' },
              { tint: '#A6BFE5', border: '#95ADD5', name: 'Who I want to become', sub: 'Future professional' },
            ].map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? undefined : 1 }}>
                <div style={{ flex: 1, background: c.tint, border: `1px solid ${c.border}`, borderRadius: 'var(--r)', padding: '18px 14px', textAlign: 'center', minHeight: 90 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1E5FBA', textTransform: 'uppercase', marginBottom: 6 }}>Chapter {i + 1}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{c.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--mid)' }}>{c.sub}</div>
                </div>
                {i < 3 && (
                  <div style={{ width: 22, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid var(--pale)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '52px 0', borderBottom: '1px solid var(--cream-border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>
            <div style={{ background: 'var(--cream-d)', border: '1px solid var(--cream-border)', borderRadius: 'var(--r)', padding: '26px 28px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 10 }}>
                About The Art of Possibility
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.75, marginBottom: 10 }}>
                In the book, <em>The Art of Possibility</em>, Rosamund Stone Zander, a family systems
                therapist, and Benjamin Zander, the longtime conductor of the Boston Philharmonic,
                explore a simple yet powerful idea: the way we see ourselves shapes what we believe
                is possible.
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--mid)', lineHeight: 1.75, marginBottom: 10 }}>
                One of their most well-known practices is called "Giving an A." On the very first
                day of class, Benjamin would give every student an A, not as a reward for past
                achievement, but as an invitation to step beyond the fear of failure. He would then
                ask them to write a letter from the future, describing the person they had already
                become. Not a wish. Not a goal. A declaration.
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--mid)', lineHeight: 1.75, marginBottom: 10 }}>
                <strong style={{ color: 'var(--ink)' }}>At Bajaj Auto, your Self Development Plan (SDP) is that same declaration.</strong>{' '}
                It is an opportunity to reflect on who you aspire to be, the strengths you want to
                build, and the impact you want to create.
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.75, marginBottom: 0, fontWeight: 500 }}>
                We are giving you the A. Who will you choose to become?
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <button
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue)', color: '#fff', fontSize: 12.5, fontWeight: 500, padding: '9px 16px', borderRadius: 20, border: 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 11 }}>&#9654;</span> Watch: Giving an A
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--blue-d)', borderRadius: 'var(--r)', padding: '22px 26px', color: '#fff', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>
                  Tool walkthrough
                </div>
                <h3 style={{ fontSize: 20, color: '#fff', marginBottom: 8 }}>Understanding your SDP</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.72)', lineHeight: 1.7, marginBottom: 14 }}>
                  A short walkthrough of the SDP process: how the four chapters fit together, how to
                  write a strong reflection, and how to translate it into goals that matter.
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 'var(--r-sm)', padding: '11px 14px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.18)', border: '2px solid rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
                      &#9654;
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>
                        Video guide &middot; 8 min
                      </div>
                      <div style={{ fontSize: 12.5, color: '#fff' }}>Watch the walkthrough</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', boxShadow: 'var(--sh)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: 'var(--ink)', padding: '11px 18px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>
                    A sample from our leadership
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Sample Bajaj Leader</div>
                </div>
                <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 5 }}>
                    Who I want to be known as
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--mid)', lineHeight: 1.65, marginBottom: 12 }}>
                    "Someone who leads from genuine curiosity rather than certainty, and grows the
                    people around them rather than managing them."
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 'auto' }}>
                    <div style={{ background: 'var(--cream)', borderRadius: 'var(--r-sm)', padding: '9px 12px', border: '1px solid var(--cream-border)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 1, lineHeight: 1.3 }}>Build deeper coaching</div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>Leadership &middot; Sep 2026</div>
                    </div>
                    <div style={{ background: 'var(--cream)', borderRadius: 'var(--r-sm)', padding: '9px 12px', border: '1px solid var(--cream-border)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 1, lineHeight: 1.3 }}>Cross-functional influence</div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>Behavioural &middot; Dec 2026</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '56px 0', textAlign: 'center' }}>
        <button className="btn btn-primary btn-lg" onClick={handleCta} style={{ fontSize: 16, padding: '16px 44px' }}>
          {ctaLabel} &rarr;
        </button>
      </div>

      <Modal open={beginOpen} onClose={() => setBeginOpen(false)} maxWidth={440}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 12 }}>Before you begin</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)', marginBottom: 10 }}>An honest conversation<br />with yourself</h2>
          <p style={{ fontSize: 14, color: 'var(--mid)', lineHeight: 1.7 }}>About who you are, what drives you, and who you are capable of becoming.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {[
            ['At your pace', 'Responses are auto-saved. Complete it in one sitting or return whenever convenient.'],
            ['Be honest', 'Write the honest draft, not the one that sounds good.'],
            ['Private by default', 'Your responses remain private until you decide to share them.'],
          ].map(([title, body]) => (
            <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13.5, color: 'var(--mid)' }}>
              <div style={{ color: 'var(--blue)', fontWeight: 600 }}>{title}</div>
              <div>{body}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setBeginOpen(false); navigate('/reflect'); }}>
          Begin my reflection
        </button>
      </Modal>
    </div>
  );
}
