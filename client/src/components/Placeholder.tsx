import { copy } from '../content/copy';

/**
 * Content not yet supplied never renders as a broken or empty screen
 * (PRD 21.1). Use this instead of leaving a route blank.
 */
export function Placeholder({ title }: { title: string }) {
  return (
    <div className="placeholder-card">
      <h2>{title}</h2>
      <p>{copy.placeholder.comingSoon}</p>
    </div>
  );
}
