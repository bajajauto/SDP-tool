import { PanelModal } from './Modal';
import { responseGuides } from '../content/reflection';

export function ResponseGuideModal({ qNum, onClose }: { qNum: number | null; onClose: () => void }) {
  const guide = qNum != null ? responseGuides[qNum] : null;
  return (
    <PanelModal open={!!guide} onClose={onClose}>
      {guide && (
        <>
          <div style={{ background: 'var(--blue-d)', color: '#fff', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>
                {guide.label} &middot; Response Guide
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, lineHeight: 1.35 }}>{guide.question}</div>
            </div>
            <button onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', flexShrink: 0 }}>
              &#10005;
            </button>
          </div>
          <div style={{ padding: '22px 28px 28px', overflowY: 'auto' }}>
            {guide.bestTip && (
              <div className="rg-tip">
                <div style={{ color: '#C99412', fontSize: 12 }}>&#9733;</div>
                <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.55 }}>{guide.bestTip}</div>
              </div>
            )}
            {guide.examples.map((ex, idx) => (
              <div className="rg-example" key={idx}>
                <div className="rg-example-h">Example {idx + 1}</div>
                <div className="rg-weak">
                  <div className="rg-lbl weak">&#10007; Weak answer</div>
                  <div className="rg-quote">{ex.weak}</div>
                  <div className="rg-why"><span style={{ fontWeight: 700, color: '#A04545' }}>Why &middot;</span> {ex.whyWeak}</div>
                </div>
                <div className="rg-better"><span style={{ fontWeight: 700, color: 'var(--blue)' }}>&rarr; Better thinking &middot;</span> {ex.better}</div>
                <div className="rg-strong">
                  <div className="rg-lbl strong">&#10003; Strong answer</div>
                  <div className="rg-quote">{ex.strong}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </PanelModal>
  );
}
