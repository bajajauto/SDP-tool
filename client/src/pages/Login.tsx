import { FormEvent, useState } from 'react';
import bajajLogo from '../assets/bajaj-logo.png';
import bajajLogoTransparent from '../assets/bajaj-logo-transparent-tight.png';

export type ViewRole = 'employee' | 'manager' | 'buhr' | 'tdadmin';
type Profile = { role: ViewRole; initials: string; name: string; label: string; email: string; password: string };
const profiles: Profile[] = [
  { role: 'employee', initials: 'AR', name: 'Asha Rao', label: 'Employee', email: 'asha.rao@bajajauto.co.in', password: 'Demo@123' },
  { role: 'manager', initials: 'VS', name: 'Vikram Shah', label: 'Manager', email: 'vikram.shah@bajajauto.co.in', password: 'Demo@123' },
  { role: 'buhr', initials: 'PN', name: 'Priya Nair', label: 'BU HR', email: 'priya.nair@bajajauto.co.in', password: 'Demo@123' },
  { role: 'tdadmin', initials: 'TD', name: 'TD Administrator', label: 'TD Admin', email: 'td.admin@bajajauto.co.in', password: 'Admin@123' },
];

export function Login({ onSelect }: { onSelect: (role: ViewRole) => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [show, setShow] = useState(false); const [selected, setSelected] = useState<ViewRole | null>(null); const [error, setError] = useState('');
  const choose = (p: Profile) => { setEmail(p.email); setPassword(p.password); setSelected(p.role); setError(''); };
  const submit = (e: FormEvent) => { e.preventDefault(); const p = profiles.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password); p ? onSelect(p.role) : setError('Credentials do not match a demo profile. Select one below to fill them in.'); };
  return <main className="login-page">
    <section className="login-story" aria-label="About the platform">
      <div className="login-brand" style={{ marginLeft: -8 }}><div className="login-logo" style={{ width: 210, height: 'auto', border: 0, borderRadius: 0, overflow: 'visible', background: 'transparent', padding: 0 }}><img src={bajajLogoTransparent} alt="Bajaj Auto, The World's Favourite Indian" style={{ width: '100%', maxWidth: 'none', height: 'auto', transform: 'none', display: 'block' }} /></div></div>
      <div className="login-story-copy" style={{ marginTop: 6 }}><span className="login-eyebrow" style={{ fontSize: 'clamp(26px,2.6vw,34px)', fontWeight: 700, letterSpacing: '.02em', textTransform: 'none', color: '#fff', display: 'block' }}>Self-Development Plan</span><h1 style={{ fontSize: 'clamp(18px,1.6vw,22px)', fontWeight: 400, marginTop: 10 }}>Growth begins with a clear sense of direction</h1><div className="login-steps" style={{ marginTop: 36 }}><span><b>01</b> Reflect</span><i/><span><b>02</b> Plan</span><i/><span><b>03</b> Grow</span></div></div>
      <p className="login-quote">“The future depends on what you do today.”</p>
    </section>
    <section className="login-panel"><div className="login-card">
      <header className="login-card-heading"><span className="login-mobile-brand" style={{ width: 230, height: 'auto', overflow: 'hidden', borderRadius: 10, background: '#1e4d8c', padding: 8 }}><img src={bajajLogo} alt="Bajaj Auto, The World's Favourite Indian" style={{ width: '100%', maxWidth: 'none', height: 'auto', transform: 'none', display: 'block' }} /></span><h2>Welcome back</h2><p>Sign in to continue to <strong>Your Self Development Plan</strong>.</p></header>
      <form onSubmit={submit} noValidate>
        <label className="login-label" htmlFor="email">Work email</label><div className="login-field"><span>@</span><input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setSelected(null); setError(''); }} placeholder="name@bajajauto.co.in" autoComplete="username"/></div>
        <div className="login-password-label"><label className="login-label" htmlFor="password">Password</label><button type="button" tabIndex={-1}>Forgot password?</button></div>
        <div className="login-field"><span>●</span><input id="password" type={show ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setSelected(null); setError(''); }} placeholder="Enter your password" autoComplete="current-password"/><button className="password-toggle" type="button" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></div>
        {error && <div className="login-error" role="alert">{error}</div>}<button className="login-submit" type="submit" disabled={!email || !password}>Sign in <span>→</span></button>
      </form>
      <div className="demo-divider"><span>Demo access</span></div><p className="demo-help">Select a profile to autofill its mock credentials.</p>
      <div className="demo-profiles">{profiles.map((p) => <button key={p.role} type="button" className={`demo-profile${selected === p.role ? ' selected' : ''}`} onClick={() => choose(p)} aria-pressed={selected === p.role}><span className="demo-avatar">{p.initials}</span><span><strong>{p.name}</strong><small>{p.label}</small></span><span className="demo-check">{selected === p.role ? '✓' : '›'}</span></button>)}</div>
    </div></section>
  </main>;
}
