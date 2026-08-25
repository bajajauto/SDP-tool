export function SubmissionNotice({ open, title, message, onClose }: { open: boolean; title: string; message: string; onClose: () => void }) {
  if (!open) return null;
  return <div className="overlay open submission-notice-overlay" role="dialog" aria-modal="true" aria-labelledby="submission-notice-title" onClick={onClose}>
    <div className="submission-notice" onClick={(event) => event.stopPropagation()}>
      <div className="submission-notice-check" aria-hidden="true">&#10003;</div>
      <div className="submission-notice-eyebrow">Submitted successfully</div>
      <h2 id="submission-notice-title">{title}</h2>
      <p>{message}</p>
      <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
    </div>
  </div>;
}
