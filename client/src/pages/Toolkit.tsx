import { useState } from 'react';
import { FaqModal } from '../components/FaqModal';
import { GrowthChecklistModal } from '../components/GrowthChecklistModal';
import { Placeholder } from '../components/Placeholder';

export function Toolkit() {
  const [faqOpen, setFaqOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [showResponses, setShowResponses] = useState(false);
  const [showActionGuide, setShowActionGuide] = useState(false);

  return (
    <div className="screen-inner">
      <h1 className="page-title">Support Toolkit</h1>
      <p className="page-sub" style={{ marginBottom: 32 }}>
        Resources to help you reflect more effectively and have meaningful development conversations.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <Tile title="FAQ Document" desc="Common questions about the SDP process, timelines, and how to make the most of your reflection." onClick={() => setFaqOpen(true)} />
        <Tile title="Growth Conversation Checklist" desc="A guide to having a meaningful development conversation with your manager." onClick={() => setChecklistOpen(true)} />
        <Tile title="Sample Responses" desc="Real examples of strong SDP reflections." onClick={() => setShowResponses(true)} />
        <Tile title="Action Plan Guide" desc="How to write an action plan using the Do, Learn, Connect framework." onClick={() => setShowActionGuide(true)} />
      </div>

      {showResponses && <Placeholder title="Sample Responses" />}
      {showActionGuide && <Placeholder title="Action Plan Guide" />}

      <FaqModal open={faqOpen} onClose={() => setFaqOpen(false)} />
      <GrowthChecklistModal open={checklistOpen} onClose={() => setChecklistOpen(false)} />
    </div>
  );
}

function Tile({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '24px 26px', boxShadow: 'var(--sh)', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>Open &rarr;</div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--mid)', lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}
