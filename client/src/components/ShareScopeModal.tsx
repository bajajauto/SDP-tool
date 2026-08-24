import { useState } from 'react';
import { Modal } from './Modal';
import type { SharingScope } from '@sdp/shared';

/** FR-X-050 to FR-X-053: required choice, no default, immutable after submit. */
export function ShareScopeModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (scope: SharingScope) => void }) {
  const [scope, setScope] = useState<SharingScope>('FULL');

  return (
    <Modal open={open} onClose={onClose} maxWidth={580}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 12 }}>
        Share with your manager
      </div>
      <h2 style={{ fontSize: 26, marginBottom: 10, lineHeight: 1.25 }}>What would you like to share?</h2>
      <p style={{ fontSize: 13.5, color: 'var(--mid)', lineHeight: 1.7, marginBottom: 22 }}>
        Decide the portion you want your manager to see. This choice cannot be changed after submission.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
        <label style={{ display: 'flex', gap: 12, padding: '16px 18px', border: `1.5px solid ${scope === 'FULL' ? 'var(--blue)' : 'var(--cream-border)'}`, background: scope === 'FULL' ? 'var(--blue-xl)' : '#fff', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>
          <input type="radio" name="scope" checked={scope === 'FULL'} onChange={() => setScope('FULL')} style={{ marginTop: 3 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>Share full SDP</div>
            <div style={{ fontSize: 12.5, color: 'var(--mid)', lineHeight: 1.6 }}>Your full reflection and your development goals.</div>
          </div>
        </label>
        <label style={{ display: 'flex', gap: 12, padding: '16px 18px', border: `1.5px solid ${scope === 'GOALS_ONLY' ? 'var(--blue)' : 'var(--cream-border)'}`, background: scope === 'GOALS_ONLY' ? 'var(--blue-xl)' : '#fff', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>
          <input type="radio" name="scope" checked={scope === 'GOALS_ONLY'} onChange={() => setScope('GOALS_ONLY')} style={{ marginTop: 3 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>Share only goals and action plan</div>
            <div style={{ fontSize: 12.5, color: 'var(--mid)', lineHeight: 1.6 }}>Keep your reflection private. Your manager sees only the goals section.</div>
          </div>
        </label>
      </div>
      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onConfirm(scope)}>
        Submit for manager review &rarr;
      </button>
    </Modal>
  );
}
