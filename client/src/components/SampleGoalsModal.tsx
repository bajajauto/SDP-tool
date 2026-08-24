import { PanelModal } from './Modal';
import { sampleGoals } from '../content/reflection';
import type { GoalDomain } from '@sdp/shared';

const domainStyle: Record<GoalDomain, { bg: string; border: string; color: string; label: string }> = {
  FUNCTIONAL: { bg: '#EBF2FA', border: '#D6E4F7', color: '#1E5FBA', label: 'Functional' },
  BEHAVIOURAL: { bg: '#95ADD5', border: '#7BA6E0', color: '#0E3F87', label: 'Behavioural' },
  LEADERSHIP: { bg: '#1E5FBA', border: '#0E3F87', color: '#FFFFFF', label: 'Leadership' },
};

export function SampleGoalsModal({ domain, onClose }: { domain: GoalDomain | null; onClose: () => void }) {
  const g = domain ? sampleGoals[domain] : null;
  const style = domain ? domainStyle[domain] : null;
  return (
    <PanelModal open={!!g} onClose={onClose} maxWidth={620}>
      {g && style && (
        <>
          <div style={{ background: 'var(--ink)', padding: '18px 26px 16px' }}>
            <button className="panel-modal-close" type="button" onClick={onClose} aria-label="Close sample goal">
              &#10005;
            </button>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>
              Sample goal for goal setting
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', padding: '4px 12px', borderRadius: 20, background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
              {style.label}
            </span>
          </div>
          <div style={{ padding: '6px 26px 22px', overflowY: 'auto' }}>
            <Section label="What I want to build" value={g.whatBuild} />
            <Section label="Why does this matter to me" value={g.whyMatters} />
            <Section label="I will know I have grown when" value={g.grownWhen} />
            <div style={{ padding: '16px 0', borderBottom: '1px solid var(--cream-border)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 12 }}>Action Plan</div>
              <ActionRow label="Do &middot; 70%" bg="var(--blue-xl)" color="var(--blue)" value={g.actionDo} />
              <ActionRow label="Learn &middot; 10%" bg="#95ADD5" color="#0E3F87" value={g.actionLearn} />
              <ActionRow label="Connect &middot; 20%" bg="var(--blue)" color="#fff" value={g.actionConnect} />
            </div>
            <div style={{ padding: '16px 0 4px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 6 }}>Support I need</div>
              <div style={{ fontSize: 13, color: 'var(--mid)', lineHeight: 1.7 }}>{g.support}</div>
            </div>
          </div>
          <p style={{ padding: '0 26px 20px', fontSize: 12, color: 'var(--pale)', fontStyle: 'italic' }}>
            Use this as a reference, not a template. Your goal should be yours.
          </p>
        </>
      )}
    </PanelModal>
  );
}

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--cream-border)' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: 'var(--mid)', lineHeight: 1.7 }}>{value}</div>
    </div>
  );
}

function ActionRow({ label, bg, color, value }: { label: string; bg: string; color: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
      <span
        dangerouslySetInnerHTML={{ __html: label }}
        style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', padding: '4px 10px', borderRadius: 4, background: bg, color, whiteSpace: 'nowrap', flexShrink: 0, minWidth: 96, textAlign: 'center' }}
      />
      <div style={{ fontSize: 13, color: 'var(--mid)', lineHeight: 1.7, flex: 1 }}>{value}</div>
    </div>
  );
}
