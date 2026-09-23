import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { joinWaitlist } from '@cardpare/core';
import { AccountMenu } from '../../components/AccountMenu';
import { sb } from '../../lib/supabase';
import '../../styles/landing.css';

const icon = (d: ReactNode, size = 22, sw = 1.6) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2F5D50" strokeWidth={sw}>{d}</svg>
);
const CARD = <><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /></>;
const CLOCK = <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>;
const TREND = <path d="M4 19V5m0 14h16M4 19l5-6 4 3 6-8" />;

export default function Landing() {
  return (
    <div className="page-landing">
      <nav>
        <div className="brand">Card<span>pare</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AccountMenu signInNext="/app" />
          <Link className="nav-cta" to="/app">Open the app</Link>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-inner">
          <div className="kicker">FOR PEOPLE WHO ALREADY TRACK THIS IN A SPREADSHEET</div>
          <h1 className="display">Know which card to use. And catch it when you don't.</h1>
          <p className="hero-sub">You hold five or six cards. One of them is quietly earning nothing while another sits idle. Cardpare tells you which to use before you pay, and shows you exactly what it cost when you didn't.</p>
          <div className="hero-ctas">
            <Link className="btn-primary" to="/app">Try the app</Link>
            <a className="btn-secondary" href="#waitlist">Get early access</a>
          </div>

          <div className="hero-visual">
            <div className="hv-kicker">What your dashboard looks like — sample data</div>
            <div className="hv-grid">
              <div className="hv-card">
                <div className="hv-label">Earned this month</div>
                <div className="hv-value accent">₹1,240</div>
                <div className="hv-sub">Across everything you logged</div>
              </div>
              <div className="hv-card">
                <div className="hv-label">Left on the table</div>
                <div className="hv-value warn">₹385</div>
                <div className="hv-sub">One dinner, wrong card</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="narrow" style={{ maxWidth: 900 }}>
          <h2 className="section-title">Rewards you already earn shouldn't need a memory test.</h2>
          <p className="section-sub">Every card has a different rate, cap, and exclusion — and no one keeps that straight at the register. Most tools track spend after the fact. Almost none tell you if you used the right instrument.</p>
          <div className="problem-grid">
            <Problem icon={icon(CARD)} title="Six cards, one memory">Nobody holds every reward rate, cap, and exclusion in their head at checkout. So the default card wins, not the best one.</Problem>
            <Problem icon={icon(<><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></>)} title="Tracking without judgment">Passive spend trackers show what you spent. None of them tell you whether you spent it on the right card.</Problem>
            <Problem icon={icon(CLOCK)} title="Points that just sit there">Miles and points expire quietly, or get spent on the first thing you see instead of where they're worth the most.</Problem>
            <Problem icon={icon(TREND)} title="No plan for the big purchase">A laptop, a trip, an EMI — the moment it matters most, there's no guidance on which card actually pays for it.</Problem>
          </div>
        </div>
      </section>

      <section>
        <div className="narrow" style={{ maxWidth: 900 }}>
          <h2 className="section-title">How it works</h2>
          <p className="section-sub">Three habits, not a new app to babysit.</p>
          <div className="steps">
            <Step n="01" title="Plan">Pick a category and an amount — get the best card from the ones you actually hold, ranked by what it'll actually earn.</Step>
            <Step n="02" title="Log">Note what you actually used, in a few taps. EMI purchases split into the right month automatically.</Step>
            <Step n="03" title="Audit">See the gap between what you earned and what your best card would've earned — every month, in plain rupees.</Step>
            <Step n="04" title="Redeem">A dated reference for what your points and miles are actually worth, and where to spend them.</Step>
          </div>
        </div>
      </section>

      <section>
        <div className="narrow" style={{ maxWidth: 900 }}>
          <h2 className="section-title">What's in it</h2>
          <div className="feature-list">
            <Feature icon={icon(<><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>, 18, 1.8)} title="Dashboard">Spend, earnings, and what you missed — one screen, updated as you log.</Feature>
            <Feature icon={icon(TREND, 18, 1.8)} title="Future purchase planning">Add a trip or a big purchase ahead of time and see which card fits — including whether it'll push you past a fee waiver or milestone tier.</Feature>
            <Feature icon={icon(CARD, 18, 1.8)} title="Monthly budget limit">Set a number, watch the bar fill as the month goes, get a clear amber-then-red warning before you're over.</Feature>
            <Feature icon={icon(CLOCK, 18, 1.8)} title="Redemption guide">Fee, forex, transfer partners, and a visible "last verified" date on every card you hold.</Feature>
            <Feature icon={icon(<path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />, 18, 1.8)} title="Card requests">Don't see your card yet? Request it and upvote existing requests — tells us exactly what to curate next.</Feature>
          </div>
        </div>
      </section>

      <section>
        <div className="narrow" style={{ maxWidth: 900 }}>
          <div className="for-box">
            <h2 className="section-title">Not built for everyone. Built for you, if —</h2>
            <p className="section-sub">Cardpare is narrow on purpose. It's for people who already care about getting this right, not a mass-market app chasing scale.</p>
            <div className="for-list">
              <div className="for-item"><span><b>You already track this manually</b> — a notes app, a spreadsheet, a mental model of your own wallet.</span></div>
              <div className="for-item"><span><b>You hold 3 or more cards</b> and genuinely can't keep every rate and cap straight in your head.</span></div>
              <div className="for-item"><span><b>You'd rather know you're wrong</b> than not know at all — the audit only works if you're willing to see the gap.</span></div>
              <div className="for-item"><span><b>You're fine with an early tool</b> — data gets more accurate as more people like you use it and flag corrections.</span></div>
            </div>
          </div>
        </div>
      </section>

      <Waitlist />

      <footer>
        <p>Cardpare is a planning and audit tool, not a payments app or financial advisor. Card rates shown elsewhere in the product are a hand-curated reference — always confirm current terms with your bank.</p>
        <p style={{ marginTop: 10 }}><Link to="/privacy" style={{ color: 'var(--ink-soft)' }}>Privacy</Link> · <Link to="/terms" style={{ color: 'var(--ink-soft)' }}>Terms</Link></p>
      </footer>
    </div>
  );
}

function Problem({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return <div className="problem-card"><div className="icon">{icon}</div><h3>{title}</h3><p>{children}</p></div>;
}
function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return <div className="step"><div className="step-num">{n}</div><div className="step-body"><h4>{title}</h4><p>{children}</p></div></div>;
}
function Feature({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return <div className="feature-row"><div className="feature-icon">{icon}</div><div className="feature-body"><h4>{title}</h4><p>{children}</p></div></div>;
}

function Waitlist() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const submit = async () => {
    const e = email.trim();
    if (!e || !e.includes('@')) return;
    setState('sending');
    try { await joinWaitlist(sb, e); setState('done'); setEmail(''); } catch { setState('error'); }
  };
  return (
    <section id="waitlist">
      <div className="narrow">
        <div className="waitlist-box">
          <h2 className="section-title" style={{ maxWidth: 'none' }}>Get early access</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>Leave your email and we'll let you know as Cardpare moves past early access.</p>
          {state !== 'done' && (
            <div className="waitlist-form">
              <input type="email" placeholder="you@email.com" value={email} onChange={(ev) => setEmail(ev.target.value)} onKeyDown={(ev) => ev.key === 'Enter' && submit()} />
              <button onClick={submit} disabled={state === 'sending'}>Notify me</button>
            </div>
          )}
          {state === 'done' && <div className="waitlist-success" style={{ display: 'block' }}>You're on the list — thank you.</div>}
          {state === 'error' && <div className="waitlist-note" style={{ color: 'var(--warn)' }}>That didn't go through — check your connection and try again.</div>}
          <div className="waitlist-note">We'll only use this to tell you about Cardpare.</div>
        </div>
      </div>
    </section>
  );
}
