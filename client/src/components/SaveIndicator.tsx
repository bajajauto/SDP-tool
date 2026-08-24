/** FR-X-006: reflects the last successful save, not the local attempt. */
export function SaveIndicator({ lastSavedAt }: { lastSavedAt: Date | null }) {
  if (!lastSavedAt) {
    return <span style={{ fontSize: 12, color: 'var(--muted)' }}>Not saved yet</span>;
  }
  const hh = String(lastSavedAt.getHours()).padStart(2, '0');
  const mm = String(lastSavedAt.getMinutes()).padStart(2, '0');
  return <span style={{ fontSize: 12, color: 'var(--muted)' }}>Last saved at {hh}:{mm}</span>;
}
