import { useEffect, useRef, useState } from 'react';
import type { JournalEntry } from '@sdp/shared';
import { api } from '../lib/api';

/**
 * FR-EMP-080 to FR-EMP-088. Journal entries are never shared with anyone
 * else, never appear in any export, the Letter, the PDF, or the DC Tool
 * payload. Enforced server side (server/src/routes/journal.ts), not just
 * by this screen omitting a share action.
 */
export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    api.journal.list().then((list) => { setEntries(list); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function handleNew() {
    const entry = await api.journal.create('');
    setEntries((prev) => [entry, ...prev]);
    requestAnimationFrame(() => {
      document.getElementById(`journal-body-${entry.entryId}`)?.focus();
    });
  }

  function handleChange(entryId: string, body: string) {
    setEntries((prev) => prev.map((e) => (e.entryId === entryId ? { ...e, body } : e)));
    clearTimeout(debounceRef.current[entryId]);
    debounceRef.current[entryId] = setTimeout(() => {
      api.journal.update(entryId, body);
    }, 1500);
  }

  async function handleSaveNow(entryId: string, body: string) {
    clearTimeout(debounceRef.current[entryId]);
    await api.journal.update(entryId, body);
  }

  async function handleDelete(entryId: string) {
    if (!confirm('Delete this journal entry?')) return;
    await api.journal.remove(entryId);
    setEntries((prev) => prev.filter((e) => e.entryId !== entryId));
  }

  return (
    <div className="screen-inner">
      <div className="pillar-tag" style={{ background: 'var(--blue-l)', color: 'var(--blue)' }}>My Journal</div>
      <h1 className="page-title">My Journal</h1>
      <p className="page-sub" style={{ marginBottom: 24 }}>
        Private notes, never shared with your manager, HR, or anyone else. Not part of your SDP.
      </p>

      <button className="btn btn-primary" onClick={handleNew} style={{ marginBottom: 24 }}>+ New entry</button>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}
      {!loading && entries.length === 0 && (
        <div className="placeholder-card">
          <p>No entries yet. Start with "+ New entry".</p>
        </div>
      )}

      {entries.map((entry) => (
        <div className="q-card" key={entry.entryId}>
          <div className="q-num">
            {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' · '}
            {new Date(entry.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <textarea
            id={`journal-body-${entry.entryId}`}
            className="q-input"
            rows={4}
            value={entry.body}
            placeholder="Notes, moments, observations, just for you."
            onChange={(e) => handleChange(entry.entryId, e.target.value)}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn btn-secondary" onClick={() => handleSaveNow(entry.entryId, entry.body)}>Save note</button>
            <button className="btn btn-ghost" onClick={() => handleDelete(entry.entryId)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
