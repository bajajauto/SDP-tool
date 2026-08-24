import { useState } from 'react';

/** FR-X-060/061/062: collapsible priming prompts, independent per question. */
export function AskPrompt({ prompts }: { prompts: string[] }) {
  const [open, setOpen] = useState(false);
  if (prompts.length === 0) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--blue-xl)',
          border: '1px solid var(--blue-l)', color: 'var(--blue)', fontSize: 12.5, padding: '7px 14px',
          borderRadius: 20, cursor: 'pointer', fontWeight: 500,
        }}
      >
        Not sure where to start? Ask yourself:
        <span style={{ fontSize: 10, transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }}>&#9660;</span>
      </button>
      {open && (
        <div style={{ marginTop: 10, padding: '14px 16px', background: 'var(--blue-xl)', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--blue)' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {prompts.map((p) => (
              <li key={p} style={{ fontSize: 13, color: 'var(--mid)', lineHeight: 1.6, display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--blue)', fontWeight: 700, flexShrink: 0 }}>&#9658;</span>{p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
