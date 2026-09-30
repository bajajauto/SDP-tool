import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Eye, RefreshCw, Save, Search, Send } from 'lucide-react';
import { api, ApiError, type EmailRecipient, type EmailTemplate } from '../lib/api';
import './EmailCentre.css';

const details = {
  AUTO_SDP_SUBMITTED: { order: 1, trigger: 'Reportee submits SDP / Goals', recipient: 'Manager', variables: ['{employee}', '{manager}', '{LINK to login}'] },
  AUTO_FEEDBACK_SHARED: { order: 2, trigger: 'Manager submits feedback on SDP / Goals', recipient: 'Reportee', variables: ['{employee}', '{manager}', '{LINK to login}'] },
  AUTO_CHECKIN_COMPLETED: { order: 3, trigger: 'Reportee completes any check-in', recipient: 'Manager', variables: ['{employee}', '{manager}', '{check_in}', '{LINK to login}'] },
} as const;
type TemplateKey = keyof typeof details;

export function EmailCentre() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState<TemplateKey>('AUTO_SDP_SUBMITTED');
  const [subject, setSubject] = useState(''); const [bodyHtml, setBodyHtml] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(''); const [saved, setSaved] = useState(false);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]); const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [cohort, setCohort] = useState(''); const [recipientSearch, setRecipientSearch] = useState(''); const [bulkEmails, setBulkEmails] = useState('');
  const [sending, setSending] = useState(false); const [sendStatus, setSendStatus] = useState('');
  const effective = useMemo(() => (Object.keys(details) as TemplateKey[]).map((key) => templates.find((t) => t.key === key && t.scope === 'TD_ADMIN') ?? templates.find((t) => t.key === key)).filter((t): t is EmailTemplate => !!t).sort((a, b) => details[a.key as TemplateKey].order - details[b.key as TemplateKey].order), [templates]);
  const selected = effective.find((t) => t.key === selectedKey); const dirty = !!selected && (subject !== selected.subject || bodyHtml !== selected.bodyHtml);

  useEffect(() => { let active = true; Promise.all([api.admin.emailTemplates(), api.admin.emailRecipients()]).then(([templateData, recipientData]) => { if (active) { setTemplates(templateData); setRecipients(recipientData); } }).catch((err) => { if (active) setError(err instanceof ApiError ? err.message : 'Email centre data could not be loaded.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  useEffect(() => { if (selected) { setSubject(selected.subject); setBodyHtml(selected.bodyHtml); setSaved(false); setError(''); } }, [selectedKey, selected?.templateId]);
  async function save() { if (!subject.trim() || !bodyHtml.trim()) return; setSaving(true); setSaved(false); setError(''); try { const updated = await api.admin.saveEmailTemplate(selectedKey, subject.trim(), bodyHtml.trim()); setTemplates((current) => [...current.filter((t) => !(t.key === updated.key && t.scope === 'TD_ADMIN')), updated]); setSubject(updated.subject); setBodyHtml(updated.bodyHtml); setSaved(true); } catch (err) { setError(err instanceof ApiError ? err.message : 'The email template could not be saved.'); } finally { setSaving(false); } }
  const detail = details[selectedKey];
  const cohorts = [...new Map(recipients.filter((recipient) => recipient.cohortId).map((recipient) => [recipient.cohortId!, recipient.cohortName!])).entries()];
  const shownRecipients = recipients.filter((recipient) => (!cohort || recipient.cohortId === cohort) && `${recipient.fullName} ${recipient.email} ${recipient.designation} ${recipient.bu}`.toLowerCase().includes(recipientSearch.trim().toLowerCase()));
  const bulk = bulkEmails.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean);
  const allRecipientEmails = [...new Set([...selectedRecipients, ...bulk])];
  async function sendEmail() { if (!allRecipientEmails.length) return; setSending(true); setSendStatus(''); setError(''); try { const result = await api.admin.sendEmail(selectedKey, allRecipientEmails, subject, bodyHtml); setSendStatus(`${result.queued} email${result.queued === 1 ? '' : 's'} queued for delivery`); } catch (err) { setError(err instanceof ApiError ? err.message : 'The email could not be queued.'); } finally { setSending(false); } }

  return <div className="email-centre"><header className="email-centre-header"><p>Talent Development / Communications</p><h1>Email Centre</h1><span>Review the emails that run automatically across the SDP journey.</span></header>
    {loading ? <div className="email-centre-state"><RefreshCw className="spin" size={22} />Loading email templates...</div> : error && !templates.length ? <div className="email-centre-state error" role="alert">{error}</div> : <div className="email-centre-layout">
      <section className="email-automation-card"><div className="email-card-title"><strong>SDP Journey</strong><span>{effective.length} automatic emails</span></div><div className="email-table-wrap"><table><thead><tr><th>Trigger</th><th>Recipient</th><th>Subject</th><th>Delivery</th><th /></tr></thead><tbody>{effective.map((template) => { const item = details[template.key as TemplateKey]; return <tr className={selectedKey === template.key ? 'selected' : ''} key={template.key}><td><strong>{item.trigger}</strong>{template.key === 'AUTO_CHECKIN_COMPLETED' && <small>Q1, Mid-Year, Q2 or Year-End</small>}</td><td><span className="recipient-pill">{item.recipient}</span></td><td>{template.subject}</td><td><span className="automatic-status"><i />Automatic</span></td><td><button type="button" onClick={() => setSelectedKey(template.key as TemplateKey)}><Eye size={14} />Review</button></td></tr>; })}</tbody></table></div></section>
      <section className="email-compose-card"><div className="email-card-title email-compose-title"><div><strong>Review &amp; send email</strong><span>{recipients.length} active employees · {detail.recipient}</span></div><Bell size={17} /></div>{!selected ? <div className="email-centre-state error">This template is not configured. Apply the latest database migration.</div> : <>
        <label>Filter by cohort<select value={cohort} onChange={(e) => setCohort(e.target.value)}><option value="">All cohorts</option>{cohorts.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select></label>
        <label>Select recipients<div className="email-recipient-search"><Search size={14} /><input value={recipientSearch} onChange={(e) => setRecipientSearch(e.target.value)} placeholder="Search name, email, role or BU" /></div></label>
        <div className="email-recipient-tools"><span>Tick recipients to include; untick anyone to exclude.</span><button type="button" onClick={() => setSelectedRecipients((current) => [...new Set([...current, ...shownRecipients.map((recipient) => recipient.email)])])}>Select all shown</button><button type="button" onClick={() => setSelectedRecipients((current) => current.filter((email) => !shownRecipients.some((recipient) => recipient.email === email)))}>Clear shown</button></div>
        <div className="email-recipient-list">{shownRecipients.map((recipient) => <label key={recipient.employeeId}><input type="checkbox" checked={selectedRecipients.includes(recipient.email)} onChange={(e) => setSelectedRecipients((current) => e.target.checked ? [...new Set([...current, recipient.email])] : current.filter((email) => email !== recipient.email))} /><span><strong>{recipient.fullName}</strong><small>{recipient.email} · {recipient.designation} · {recipient.bu}</small></span></label>)}{!shownRecipients.length && <p>No recipients match this filter.</p>}</div>
        <label>Or paste email addresses in bulk<textarea className="email-bulk" value={bulkEmails} onChange={(e) => setBulkEmails(e.target.value)} placeholder="name@company.com, another@company.com" rows={3} /></label><p className="email-address-help">Separate addresses with commas, semicolons, spaces, or new lines. {allRecipientEmails.length} unique recipients selected.</p>
        <div className="email-to-summary"><strong>To:</strong> {allRecipientEmails.join(', ') || 'No recipients selected'}</div>
        <label>Subject<input value={subject} maxLength={300} onChange={(e) => { setSubject(e.target.value); setSaved(false); }} /></label><label>Email body<textarea value={bodyHtml} onChange={(e) => { setBodyHtml(e.target.value); setSaved(false); }} rows={15} /></label><div className="email-variables"><span>Available fields</span>{detail.variables.map((variable) => <button type="button" key={variable} onClick={() => setBodyHtml((current) => `${current}${current.endsWith(' ') || current.endsWith('\n') ? '' : ' '}${variable}`)}>{variable}</button>)}</div>
        <div className="email-editor-actions"><div>{error && <span className="email-save-error" role="alert">{error}</span>}{saved && <span className="email-save-success"><Check size={15} />Template saved</span>}{sendStatus && <span className="email-save-success"><Check size={15} />{sendStatus}</span>}{dirty && !saved && <span className="email-unsaved">Unsaved changes</span>}</div><span className="email-action-buttons"><button type="button" className="secondary" disabled={saving || !dirty || !subject.trim() || !bodyHtml.trim()} onClick={() => void save()}><Save size={15} />{saving ? 'Saving...' : 'Save template'}</button><button type="button" disabled={sending || !allRecipientEmails.length || !subject.trim() || !bodyHtml.trim()} onClick={() => void sendEmail()}><Send size={15} />{sending ? 'Sending...' : 'Send email'}</button></span></div>
      </>}</section>
    </div>}
  </div>;
}
