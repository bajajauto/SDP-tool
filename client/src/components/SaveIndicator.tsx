import type { SaveStatus } from '../state/SdpContext';

/** FR-X-006/FR-X-007: reflects the last server acknowledgement, never a
 * local-only attempt, and makes a failed save visible rather than silent. */
export function SaveIndicator({ lastSavedAt, saveStatus }: { lastSavedAt: Date | null; saveStatus?: SaveStatus }) {
  if (saveStatus === 'error') {
    return <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>Not saved, retrying...</span>;
  }
  if (saveStatus === 'saving') {
    return <span style={{ fontSize: 12, color: 'var(--muted)' }}>Saving...</span>;
  }
  if (!lastSavedAt) {
    return <span style={{ fontSize: 12, color: 'var(--muted)' }}>Not saved yet</span>;
  }
  const hh = String(lastSavedAt.getHours()).padStart(2, '0');
  const mm = String(lastSavedAt.getMinutes()).padStart(2, '0');
  const ss = String(lastSavedAt.getSeconds()).padStart(2, '0');
  return <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>&#10003; All changes saved at {hh}:{mm}:{ss}</span>;
}
