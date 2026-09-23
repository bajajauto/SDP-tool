import { Link, useLocation } from 'react-router-dom';
import { Mail, NotebookPen } from 'lucide-react';
import { useSdp } from '../state/SdpContext';

export function JournalFab() {
  const location = useLocation();
  const { state } = useSdp();
  const showLetter = location.pathname !== '/letter' && state.status !== 'NOT_STARTED';
  const showJournal = location.pathname !== '/journal';

  return (
    <div className="reflection-fabs">
      {showLetter && (
        <Link to="/letter" className="journal-fab letter-fab" style={{ background: 'var(--blue)' }}>
          <span className="fab-icon-wrap"><Mail aria-hidden="true" size={19} strokeWidth={2.25} /></span>
          My Letter
        </Link>
      )}
      {showJournal && (
        <Link to="/journal" className="journal-fab journal-entry-fab" aria-label="Open My Journal — something on your mind?">
          <span className="fab-icon-wrap"><NotebookPen aria-hidden="true" size={19} strokeWidth={2.25} /></span>
          <span className="journal-labels">
            <span className="journal-label-default">My Journal</span>
            <span className="journal-label-hover">Something on your mind?</span>
          </span>
        </Link>
      )}
    </div>
  );
}
