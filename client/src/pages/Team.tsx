import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError, type TeamReportee } from '../lib/api';

export function Team() {
  const [reportees, setReportees] = useState<TeamReportee[]>([]);
  const [activeTab, setActiveTab] = useState<'submitted' | 'awaiting'>('submitted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.team.list().then((list) => { setReportees(list); setLoading(false); }).catch((err) => {
      setError(err instanceof ApiError && err.status === 403
        ? "Your account isn't mapped as a manager for any reportees."
        : 'Could not load your team. Please try again.');
      setLoading(false);
    });
  }, []);

  const submittedCount = reportees.filter((reportee) => reportee.submittedAt).length;
  const awaitingCount = reportees.length - submittedCount;
  const visibleReportees = reportees.filter((reportee) => activeTab === 'submitted' ? !!reportee.submittedAt : !reportee.submittedAt);

  return (
    <div className="screen-inner wide">
      <h1 className="page-title">My Team's Development Plans</h1>
      <p className="page-sub" style={{ marginBottom: 24 }}>
        Review each reportee's SDP, offer thoughtful feedback, and support the goals they have set for themselves.
      </p>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}
      {!loading && error && (
        <div className="placeholder-card" role="alert">
          <p>{error}</p>
        </div>
      )}
      {!loading && !error && reportees.length === 0 && (
        <div className="placeholder-card">
          <p>No direct reportees mapped to you yet.</p>
        </div>
      )}

      {!loading && !error && reportees.length > 0 && <div className="team-tabs" role="tablist" aria-label="Filter development plans by status">
        <button type="button" role="tab" aria-selected={activeTab === 'submitted'} className={activeTab === 'submitted' ? 'active submitted' : ''} onClick={() => setActiveTab('submitted')}>
          Submitted <span>{submittedCount}</span>
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'awaiting'} className={activeTab === 'awaiting' ? 'active awaiting' : ''} onClick={() => setActiveTab('awaiting')}>
          Awaiting submission <span>{awaitingCount}</span>
        </button>
      </div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
        {visibleReportees.map((r) => (
          <Link to={`/team/${r.employeeId}`} className="team-card" key={r.employeeId} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div className="team-avatar">{initials(r.fullName)}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{r.fullName}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{r.designation}</div>
              </div>
            </div>
            <div>
              <span className={`team-status ${r.submittedAt ? 'active' : 'pending'}`}>
                {r.submittedAt ? 'Submitted' : 'Awaiting'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--cream-border)' }}>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                {r.submittedAt ? `Submitted ${new Date(r.submittedAt).toLocaleDateString()}` : 'Awaiting submission'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>View SDP &rarr;</div>
            </div>
          </Link>
        ))}
      </div>
      {!loading && !error && reportees.length > 0 && visibleReportees.length === 0 && <div className="placeholder-card"><p>No {activeTab === 'submitted' ? 'submitted' : 'awaiting'} development plans.</p></div>}
    </div>
  );
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}
