import { useEffect, useRef, useState } from 'react';
import type { JournalEntry } from '@sdp/shared';
import { api } from '../lib/api';

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [creating, setCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    api.journal.list().then((list) => { setEntries(list); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!focusedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocusedId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [focusedId]);

  const focusedIndex = entries.findIndex((entry) => entry.entryId === focusedId);
  const focusedEntry = focusedIndex >= 0 ? entries[focusedIndex] : null;

  async function handleNew() {
    const body = draft.trim();
    if (!body || creating) return;
    setCreating(true);
    try {
      const entry = await api.journal.create(body);
      setEntries((prev) => [entry, ...prev]);
      setDraft('');
    } finally {
      setCreating(false);
    }
  }

  function handleChange(entryId: string, body: string) {
    setEntries((prev) => prev.map((entry) => (entry.entryId === entryId ? { ...entry, body } : entry)));
    setSaveStatus((prev) => {
      const next = { ...prev };
      delete next[entryId];
      return next;
    });
    clearTimeout(debounceRef.current[entryId]);
    debounceRef.current[entryId] = setTimeout(() => api.journal.update(entryId, body), 1500);
  }

  async function handleSaveNow(entryId: string, body: string) {
    clearTimeout(debounceRef.current[entryId]);
    setSaveStatus((prev) => ({ ...prev, [entryId]: 'saving' }));
    try {
      const savedEntry = await api.journal.update(entryId, body);
      if (!savedEntry) throw new Error('Journal entry not found');
      setEntries((prev) => prev.map((entry) => (entry.entryId === entryId ? savedEntry : entry)));
      setSaveStatus((prev) => ({ ...prev, [entryId]: 'saved' }));
    } catch {
      setSaveStatus((prev) => ({ ...prev, [entryId]: 'error' }));
    }
  }

  async function handleDelete(entryId: string): Promise<boolean> {
    if (!confirm('Delete this journal entry?')) return false;
    await api.journal.remove(entryId);
    setEntries((prev) => prev.filter((entry) => entry.entryId !== entryId));
    return true;
  }

  return (
    <div className="screen-inner wide journal-screen">
      <h1 className="page-title">My Journal</h1>
      <p className="page-sub journal-intro">Private notes, never shared with your manager, HR, or anyone else.</p>

      <section className="journal-composer" aria-labelledby="new-note-heading">
        <div className="journal-composer-pin" aria-hidden="true" />
        <h2 id="new-note-heading">Add a new note</h2>
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Capture a thought, learning, moment, or observation..." rows={4} />
        <div className="journal-composer-actions">
          <span>{draft.trim() ? `${draft.trim().length} characters` : 'Only you can see this'}</span>
          <button type="button" className="journal-add-button" disabled={!draft.trim() || creating} onClick={handleNew} aria-label="Add note" title="Add note">
            {creating ? <span className="journal-add-spinner" aria-hidden="true" /> : <span aria-hidden="true">+</span>}
          </button>
        </div>
      </section>

      {loading && <p className="journal-loading">Loading your notes...</p>}
      {!loading && entries.length === 0 && (
        <div className="journal-empty"><span aria-hidden="true">&#128221;</span><h3>Your notes will live here</h3><p>Add your first private note above.</p></div>
      )}

      {!loading && entries.length > 0 && <h2 className="journal-entries-heading">Journal entries <span>{entries.length}</span></h2>}
      {!loading && entries.length > 0 && (
      <div className="journal-board">
        <span className="journal-board-label">Pinned</span>
        <div className="journal-notes-grid">
        {entries.map((entry, index) => (
          <article
            className={`journal-note journal-note-${index % 5}`}
            key={entry.entryId}
            onClick={() => setFocusedId(entry.entryId)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => { if (event.key === 'Enter') setFocusedId(entry.entryId); }}
            aria-label="Open note"
          >
            {index % 2 === 0 ? (
              <div className="journal-pin" aria-hidden="true" />
            ) : (
              <div className="journal-tape" aria-hidden="true" />
            )}
            <div className="journal-note-fold" aria-hidden="true" />
            <span className="journal-note-expand-hint" aria-hidden="true">&#10021; Open</span>
            <div className="journal-note-date">
              {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(entry.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className={`journal-note-preview${entry.body ? '' : ' journal-note-preview-empty'}`}>{entry.body || 'Empty note, click to write...'}</p>
          </article>
        ))}
        </div>
      </div>
      )}

      {focusedEntry && (
        <div className="journal-focus-overlay" onClick={() => setFocusedId(null)}>
          <article
            className={`journal-note journal-note-expanded journal-note-${focusedIndex % 5}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="journal-focus-close" onClick={() => setFocusedId(null)} aria-label="Close note">&#10005;</button>
            {focusedIndex % 2 === 0 ? (
              <div className="journal-pin" aria-hidden="true" />
            ) : (
              <div className="journal-tape" aria-hidden="true" />
            )}
            <div className="journal-note-date">
              {new Date(focusedEntry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(focusedEntry.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <textarea
              autoFocus
              rows={12}
              value={focusedEntry.body}
              aria-label={`Journal note from ${new Date(focusedEntry.createdAt).toLocaleDateString('en-IN')}`}
              onChange={(event) => handleChange(focusedEntry.entryId, event.target.value)}
            />
            <div className="journal-note-actions">
              <button type="button" className="journal-note-save" disabled={saveStatus[focusedEntry.entryId] === 'saving'} onClick={() => handleSaveNow(focusedEntry.entryId, focusedEntry.body)}>{saveStatus[focusedEntry.entryId] === 'saving' ? 'Saving...' : 'Save'}</button>
              <button type="button" className="journal-note-delete" onClick={async () => { if (await handleDelete(focusedEntry.entryId)) setFocusedId(null); }}>Delete</button>
              {saveStatus[focusedEntry.entryId] === 'saved' && <span className="journal-note-status">Saved &#10003;</span>}
              {saveStatus[focusedEntry.entryId] === 'error' && <span role="alert" className="journal-note-error">Try again</span>}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
