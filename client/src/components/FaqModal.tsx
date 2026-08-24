import { PanelModal } from './Modal';
import { faq } from '../content/toolkit';

export function FaqModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  let counter = 0;
  return (
    <PanelModal open={open} onClose={onClose} maxWidth={760}>
      <div style={{ background: 'var(--blue-d)', color: '#fff', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>
            Support Toolkit
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 23, fontWeight: 500 }}>Frequently Asked Questions</div>
        </div>
        <button onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer' }}>
          &#10005;
        </button>
      </div>
      <div className="faq-modal-body" style={{ overflowY: 'auto' }}>
        {faq.map((section) => (
          <div key={section.heading}>
            <div className="faq-section-h">{section.heading}</div>
            {section.questions.map((qd) => {
              counter += 1;
              return (
                <div className="faq-q" key={qd.q}>
                  <div className="faq-q-num">{String(counter).padStart(2, '0')}</div>
                  <div>
                    <div className="faq-q-question">{qd.q}</div>
                    <div className="faq-q-answer">{qd.a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </PanelModal>
  );
}
