import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getCard, loadAdminStats, type AdminStats } from '@cardpare/core';
import { useAuth } from '../../auth/AuthProvider';
import { AccountMenu } from '../../components/AccountMenu';
import { sb } from '../../lib/supabase';
import '../../styles/narrow.css';

// The real access check is the database: admin-only RLS policies and the
// admin_user_count() function both verify the signed-in JWT's email. This page
// just avoids showing an empty dashboard to anyone else.
export default function Admin() {
  const { user, ready, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    loadAdminStats(sb).then(setStats).catch((e) => { console.error(e); setFailed(true); });
  }, [isAdmin]);

  return (
    <div className="page-narrow">
      <div className="wrap">
        <div className="admin-topbar">
          <Link to="/" className="brand" style={{ color: 'inherit', textDecoration: 'none' }}>Card<span>pare</span></Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link className="back-link" to="/app">← Back to app</Link>
            <AccountMenu />
          </div>
        </div>
        <div className="kicker">Admin — aggregate view only, not visible to regular users.</div>

        {!ready ? null : !user ? (
          <div className="card">
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Sign in with the admin account to see this page.</p>
            <Link className="btn accent" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 14 }} to="/signin?next=/admin">Sign in</Link>
          </div>
        ) : !isAdmin ? (
          <div className="denied">Signed in as <b>{user.email}</b> — this account doesn't have access to the admin view.</div>
        ) : (
          <>
            <h1>What's happening on Cardpare</h1>
            <p className="sub">Aggregate numbers only — no per-user purchase detail.</p>
            {failed && <div className="denied" style={{ marginBottom: 20 }}>Couldn't load the numbers — try refreshing.</div>}
            <div className="stat-grid">
              <Stat label="Signed-up users" value={stats?.users} />
              <Stat label="Waitlist signups" value={stats?.waitlist} />
              <Stat label="Transactions this week" value={stats?.transactionsThisWeek} />
              <Stat label="Card requests" value={stats?.requests.length} />
            </div>

            <h2>Most-held cards</h2>
            {stats && (stats.mostHeld.length === 0
              ? <div className="empty">No cards held yet.</div>
              : stats.mostHeld.map((m) => (
                <div className="row" key={m.cardId}><span>{getCard(m.cardId)?.name ?? m.cardId}</span><span className="val">{m.count}</span></div>
              )))}

            <h2>Card requests, by votes</h2>
            {stats && (stats.requests.length === 0
              ? <div className="empty">No requests yet.</div>
              : stats.requests.map((r) => (
                <div className="row" key={r.id}><span>{r.name}</span><span className="val">{r.votes}</span></div>
              )))}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | null | undefined }) {
  return <div className="stat-card"><div className="label">{label}</div><div className="value">{value ?? '—'}</div></div>;
}
