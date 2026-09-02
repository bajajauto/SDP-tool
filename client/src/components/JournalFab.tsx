import { Link, useLocation } from 'react-router-dom';
import { useSdp } from '../state/SdpContext';
import journalIcon from '../assets/journal icon.png';

export function JournalFab() {
  const location = useLocation();
  const { state } = useSdp();
  const showLetter = location.pathname !== '/letter' && state.status !== 'NOT_STARTED';
  const showJournal = location.pathname !== '/journal';

  return (
    <>
      {showLetter && (
        <Link to="/letter" className="journal-fab" style={{ bottom: 74, background: 'var(--blue)' }}>
          <span>&#128220;</span> My Letter
        </Link>
      )}
      {showJournal && (
        <Link to="/journal" className="journal-fab journal-entry-fab" aria-label="Open My Journal — something on your mind?">
          <img className="journal-fab-icon" src={journalIcon} alt="" aria-hidden="true" />
          <span className="journal-labels">
            <span className="journal-label-default">My Journal</span>
            <span className="journal-label-hover">Something on your mind?</span>
          </span>
        </Link>
      )}
    </>
  );
}
