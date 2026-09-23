import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { initialsFor } from '@cardpare/core';
import { useAuth } from '../auth/AuthProvider';

// Header account control on every page: "Sign in" when signed out, an initials
// avatar with a dropdown when signed in.
export function AccountMenu({ signInNext }: { signInNext?: string }) {
  const { user, ready, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => setOpen(false), [location.pathname]);

  if (!ready) return <div className="acct" />;

  if (!user) {
    const next = signInNext ?? location.pathname;
    return (
      <div className="acct">
        <Link className="acct-signin" to={`/signin?next=${encodeURIComponent(next)}`}>Sign in</Link>
      </div>
    );
  }

  return (
    <div className="acct" ref={ref}>
      <button className="acct-avatar" aria-label="Account menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {initialsFor(user.email)}
      </button>
      {open && (
        <div className="acct-dropdown" role="menu">
          <div className="acct-email">{user.email}</div>
          {isAdmin && <Link className="acct-item" to="/admin">Admin panel</Link>}
          <div className="acct-item disabled">Settings <span className="acct-soon">Coming soon</span></div>
          <div className="acct-item disabled">Account <span className="acct-soon">Coming soon</span></div>
          <div className="acct-divider" />
          <button className="acct-item" onClick={() => { setOpen(false); void signOut(); }}>Sign out</button>
        </div>
      )}
    </div>
  );
}
