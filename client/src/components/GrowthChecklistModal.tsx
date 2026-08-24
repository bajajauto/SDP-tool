import { PanelModal } from './Modal';
import { growthChecklist } from '../content/toolkit';
import { useSdp } from '../state/SdpContext';

export function GrowthChecklistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, toggleChecklistItem, resetChecklist } = useSdp();
  const totalItems = growthChecklist.reduce((n, s) => n + s.items.length, 0);
  const doneCount = Object.values(state.checklist).filter(Boolean).length;

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
        <div className="gcl-banner">Use this checklist to prepare for your growth conversation. Tick items as you go.</div>
        {growthChecklist.map((section) => (
          <div key={section.heading}>
            <h3 className="gcl-section-h">{section.heading}</h3>
            {section.items.map((item) => {
              const checked = !!state.checklist[item.id];
              return (
                <div key={item.id} className={`gcl-item${checked ? ' checked' : ''}`} onClick={() => toggleChecklistItem(item.id)}>
                  <div className="gcl-box">{checked ? '✓' : ''}</div>
                  <div className="gcl-text">{item.text}</div>
                </div>
              );
            })}
          </div>
        ))}
        <div className="gcl-meta">
          <div style={{ fontSize: 12.5, color: 'var(--mid)', fontWeight: 600 }}>{doneCount} of {totalItems} complete</div>
          <button className="gcl-reset" onClick={resetChecklist}>Reset checklist</button>
        </div>
      </div>
    </PanelModal>
  );
}
