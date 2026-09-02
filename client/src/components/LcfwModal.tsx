import { Modal } from './Modal';
import { lcfw } from '../content/reflection';

const tints = ['#EBF2FA', '#DBE7F6', '#C5D5F0', '#A6BFE5'];

export function LcfwModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={600}>
      <h2 style={{ fontSize: 24, marginBottom: 6, color: 'var(--ink)' }}>The Leadership Competency Framework</h2>
      <p style={{ fontSize: 14, color: 'var(--mid)', marginBottom: 24, lineHeight: 1.6 }}>
        These four attributes are the lens through which Bajaj Auto thinks about leadership and
        growth. They are not boxes to tick, they are a way of thinking about who you want to become.
      </p>
      <div style={{ display: 'grid', gap: 16, maxHeight: '60vh', overflowY: 'auto' }}>
        {lcfw.pillars.map((pillar, i) => (
          <div key={pillar.key} style={{ background: tints[i], border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, color: 'var(--blue-d)', fontSize: 15 }}>{pillar.name}</div>
              <div style={{ fontSize: 12, color: 'var(--blue-d)', opacity: 0.75, fontStyle: 'italic' }}>{pillar.subtitle}</div>
            </div>
            <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {pillar.subs.map((sub) => (
                <div key={sub.name}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-d)', marginBottom: 4 }}>{sub.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.6 }}>{sub.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
