import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type ReporteeDetail as ReporteeDetailDto } from '../lib/api';

/**
 * FR-MGR-010/011/012: renders exactly what the server sends. If scope is
 * GOALS_ONLY the `reflection` field is simply absent from the response
 * (server/src/routes/team.ts), so there is nothing here to accidentally
 * render, blur, or tease. Journal entries never appear on this page in any
 * form, and the API has no route that could return them here.
 */
export function ReporteeDetail() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [detail, setDetail] = useState<ReporteeDetailDto | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    api.team.detail(employeeId).then(setDetail).catch(() => setNotFound(true));
  }, [employeeId]);

  if (notFound) {
    return (
      <div className="screen-inner">
        <Link to="/team">&larr; Back to My Team</Link>
        <div className="placeholder-card">Could not find this reportee's SDP.</div>
      </div>
    );
  }

  if (!detail) {
    return <div className="screen-inner"><p style={{ color: 'var(--muted)' }}>Loading...</p></div>;
  }

  const scopeChip = detail.sharingScope === 'FULL'
    ? <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', padding: '3px 10px', borderRadius: 20, background: 'var(--blue-xl)', color: 'var(--blue)', border: '1px solid var(--blue-l)' }}>Shared: full SDP</span>
    : <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', padding: '3px 10px', borderRadius: 20, background: 'var(--cream-d)', color: 'var(--ink)', border: '1px solid var(--cream-border)' }}>Shared: goals only</span>;

  return (
    <div className="screen-inner wide">
      <div style={{ marginBottom: 18 }}>
        <Link to="/team" className="btn btn-ghost">&larr; Back to My Team</Link>
      </div>

      <div className="rep-section" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <div className="team-avatar" style={{ width: 62, height: 62, fontSize: 22 }}>
          {detail.employeeName.split(' ').map((p) => p[0]).slice(0, 2).join('')}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500 }}>{detail.employeeName}</div>
          <div style={{ marginTop: 8 }}>{scopeChip}</div>
        </div>
      </div>

      {detail.sharingScope === 'FULL' && detail.reflection ? (
        <div className="rep-section">
          <div className="rep-section-label">Their letter to themselves</div>
          <ReflectionRow label="Who I am" value={detail.reflection.q1Text ?? detail.reflection.q1Words.join(', ')} />
          <ReflectionRow label="Qualities I want to be known for" value={detail.reflection.q2Text} />
          <ReflectionRow label="What energises me" value={detail.reflection.q3Text} />
          <ReflectionRow label="Where I am at my best" value={detail.reflection.q4Text} />
          <ReflectionRow label="Where I want to grow" value={detail.reflection.q5Text} />
          <ReflectionRow label="Who I want to become" value={detail.reflection.q6Text} />
        </div>
      ) : (
        <div className="rep-section">
          <div className="rep-section-label">Their letter to themselves</div>
          <div style={{ background: 'var(--cream)', border: '1px dashed var(--cream-border)', borderRadius: 'var(--r-sm)', padding: 22, textAlign: 'center', color: 'var(--pale)', fontStyle: 'italic' }}>
            {detail.employeeName} has chosen to keep their reflection private. Only their development goals are shared with you.
          </div>
        </div>
      )}

      <div className="rep-section">
        <div className="rep-section-label">Their development goals</div>
        {detail.goals.length === 0 && <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No goals set yet.</p>}
        {detail.goals.map((g) => (
          <div key={g.goalId} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 14, boxShadow: 'var(--sh)' }}>
            <div style={{ background: 'var(--ink)', padding: '14px 20px' }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', padding: '3px 10px', borderRadius: 20, background: 'var(--blue-xl)', color: 'var(--blue)' }}>{g.domain}</span>
              <div style={{ color: '#fff', fontFamily: 'var(--serif)', fontSize: 17, marginTop: 6 }}>{g.title}</div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <ReflectionRow label="Why this matters to them" value={g.whyItMatters} />
              <ReflectionRow label="They will know they have grown when" value={g.grownWhen} />
              <ReflectionRow label="Action plan: Do" value={g.actionPlan.do} />
              <ReflectionRow label="Action plan: Learn" value={g.actionPlan.learn} />
              <ReflectionRow label="Action plan: Connect" value={g.actionPlan.connect} />
              <ReflectionRow label="Support they need" value={g.supportNeeded} />
            </div>
          </div>
        ))}
      </div>

      <div className="rep-section">
        <div className="rep-section-label">Your feedback on this plan</div>
        <p style={{ fontSize: 13, color: 'var(--mid)', lineHeight: 1.65, marginBottom: 14 }}>
          Share what you see clearly, what you would push them on, and how you plan to support.
        </p>
        <textarea className="rep-feedback-ta" placeholder="What is strong in this plan. What you would push them on. How you plan to support." />
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12.5, color: 'var(--pale)', fontStyle: 'italic' }}>Not yet shared with {detail.employeeName.split(' ')[0]}</div>
          <button className="btn btn-primary">Share with {detail.employeeName.split(' ')[0]}</button>
        </div>
      </div>
    </div>
  );
}

function ReflectionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rep-letter-q">
      <div className="rep-letter-q-lbl">{label}</div>
      <div className="rep-letter-q-ans">{value || <span style={{ color: 'var(--pale)' }}>Not written yet.</span>}</div>
    </div>
  );
}
