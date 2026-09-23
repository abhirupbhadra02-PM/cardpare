import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { AccountMenu } from '../../components/AccountMenu';
import { useAuth } from '../../auth/AuthProvider';
import { useAppData } from '../../data/AppDataProvider';
import '../../styles/app.css';

export const SECTIONS = [
  { path: 'dashboard', label: 'Dashboard' },
  { path: 'plan', label: 'Plan' },
  { path: 'audit', label: 'Log & Audit' },
  { path: 'redemption', label: 'Redemption' },
  { path: 'rewards', label: 'Rewards' },
  { path: 'cards', label: 'My Cards' },
  { path: 'compare', label: 'Compare' },
] as const;

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setNavOpen(false), [location.pathname]);

  return (
    <div className="page-app">
      <div className="wrap">
        <div className="topbar">
          <div className="topbar-left">
            <button className="hamburger-btn" aria-label="Open menu" onClick={() => setNavOpen(true)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#14161A" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
            <Link to="/" className="brand" style={{ color: 'inherit', textDecoration: 'none' }}>Card<span>pare</span></Link>
          </div>
          <AccountMenu />
        </div>

        <div className="hero">
          <h1>Know which card to use, and catch it when you don't.</h1>
          <p>A planning and audit tool for people who hold multiple cards and want every swipe to earn what it should.</p>
        </div>

        <div className={'nav-backdrop' + (navOpen ? ' open' : '')} onClick={() => setNavOpen(false)} />
        <div className="app-shell">
          <nav className={'tabs' + (navOpen ? ' open' : '')} aria-label="Sections">
            <div className="nav-drawer-header">
              <span className="nav-drawer-title">Menu</span>
              <button className="nav-close-btn" aria-label="Close menu" onClick={() => setNavOpen(false)}>×</button>
            </div>
            {SECTIONS.map((s) => (
              <NavLink key={s.path} to={s.path} className={({ isActive }) => 'tab' + (isActive ? ' active' : '')} style={{ textDecoration: 'none' }}>
                {s.label}
              </NavLink>
            ))}
          </nav>

          <div className="main-col">
            <ErrorBanner />
            <SignInNudge />
            {/* Sections load on demand; only this area waits, the header and nav stay put. */}
            <div className="panel active"><Suspense fallback={null}><Outlet /></Suspense></div>
          </div>
        </div>

        <ImportModal />

        <div className="disclaimer">
          Rates and terms shown are a hand-curated reference, each dated with a "last verified" mark. Confirm current terms with your bank before relying on this for a large purchase.<br />
          <Link to="/privacy" style={{ color: 'var(--ink-soft)' }}>Privacy</Link> · <Link to="/terms" style={{ color: 'var(--ink-soft)' }}>Terms</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorBanner() {
  const { error, clearError } = useAppData();
  if (!error) return null;
  return (
    <div className="account-bar prompt" style={{ background: 'var(--warn-soft)', borderColor: 'var(--warn-soft)', marginTop: 0 }} role="alert">
      <div className="account-bar-row">
        <div className="account-bar-text" style={{ color: 'var(--warn)' }}>{error}</div>
        <button className="account-bar-close" aria-label="Dismiss" onClick={clearError}>×</button>
      </div>
    </div>
  );
}

// Appears only once there's something worth saving (a held card or a logged spend).
function SignInNudge() {
  const { user, ready } = useAuth();
  const { heldCards, transactions } = useAppData();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);
  if (!ready || user || dismissed || (heldCards.length === 0 && transactions.length === 0)) return null;
  return (
    <div className="account-bar prompt">
      <div className="account-bar-row">
        <div>
          <div className="account-bar-text">Sign in to save across devices</div>
          <div className="account-bar-sub">Everything you've added stays on this device only, until you do.</div>
        </div>
        <button className="account-bar-close" aria-label="Dismiss" onClick={() => setDismissed(true)}>×</button>
      </div>
      <Link className="btn accent small" style={{ display: 'inline-block', marginTop: 10, textDecoration: 'none' }} to={`/signin?next=${encodeURIComponent(location.pathname)}`}>
        Sign in or create an account
      </Link>
    </div>
  );
}

function ImportModal() {
  const { importPrompt, resolveImport } = useAppData();
  const [busy, setBusy] = useState(false);
  if (!importPrompt) return null;
  const { cards, transactions } = importPrompt;
  const choose = async (bring: boolean) => { setBusy(true); await resolveImport(bring); setBusy(false); };
  return (
    <div className="modal-overlay">
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="import-title">
        <h3 id="import-title">Bring your data with you?</h3>
        <p className="panel-sub" style={{ marginBottom: 18 }}>
          This device has {cards} held card{cards === 1 ? '' : 's'} and {transactions} logged transaction{transactions === 1 ? '' : 's'} saved locally.
          Bring it into your account, or start this account fresh and keep the local copy as-is.
        </p>
        <button className="btn accent" disabled={busy} onClick={() => choose(true)}>Import my data</button>
        <button className="btn ghost" disabled={busy} style={{ marginTop: 8 }} onClick={() => choose(false)}>Start fresh instead</button>
      </div>
    </div>
  );
}
