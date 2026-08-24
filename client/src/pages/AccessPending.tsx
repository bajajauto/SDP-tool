import { copy } from '../content/copy';

/** FR-SYS-011: unresolved identity sees a clear message, never a blank screen. */
export function AccessPending() {
  return (
    <div className="placeholder-card">
      <h2>{copy.accessPending.title}</h2>
      <p>{copy.accessPending.body}</p>
    </div>
  );
}
