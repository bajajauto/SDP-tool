import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}

/** FR-A11Y-002: closes on Escape, returns focus to trigger is handled by callers. */
export function Modal({ open, onClose, children, maxWidth = 460 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay open" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &#10005;
        </button>
        {children}
      </div>
    </div>
  );
}

/** Wider modal variant for content-heavy dialogs (FAQ, checklist, response guide). */
export function PanelModal({ open, onClose, children, maxWidth = 680 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay open" onClick={onClose}>
      <div
        style={{
          position: 'relative', background: '#fff', borderRadius: 18, maxWidth, width: '96%',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(31,41,55,.22)', overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
