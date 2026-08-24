import { Link, useLocation } from 'react-router-dom';
import { useSdp } from '../state/SdpContext';

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
        <Link to="/journal" className="journal-fab">
          <span>&#128211;</span> My Journal
        </Link>
      )}
    </>
  );
}
