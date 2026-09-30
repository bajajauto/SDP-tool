import { growthChecklist } from '../content/toolkit';
import { PanelModal } from './Modal';

export function GrowthChecklistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <PanelModal open={open} onClose={onClose}>
      <div style={{ background: 'var(--blue-d)', color: '#fff', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>
            Support Toolkit
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500 }}>Growth Conversation Checklist</div>
        </div>
        <button onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer' }}>
          &#10005;
        </button>
      </div>
      <div style={{ padding: '6px 28px 28px', maxHeight: '74vh', overflowY: 'auto' }}>
        <div className="gcl-banner">Review these requirements before your growth conversation. Track your completion from the Growth Conversation page.</div>
        {growthChecklist.map((section) => (
          <div key={section.heading}>
            <h3 className="gcl-section-h">{section.heading}</h3>
            {section.items.map((item) => (
              <div key={item.id} className="gcl-item gcl-reference-item">
                <span className="gcl-reference-dot" aria-hidden="true" />
                <div className="gcl-text">{item.text}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </PanelModal>
  );
}
