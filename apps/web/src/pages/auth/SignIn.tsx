import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import type { AuthError } from '@supabase/supabase-js';
import { MIN_PASSWORD_LENGTH } from '@cardpare/core';
import { useAuth } from '../../auth/AuthProvider';
import { sb } from '../../lib/supabase';
import '../../styles/narrow.css';

// Email + password, with 6-digit emailed codes (not links) for confirming a new
// account and resetting a password — so an installed home-screen app never has
// to hand off to a browser to finish signing in.
type Mode = 'signin' | 'signup' | 'verify' | 'forgot' | 'reset';

function safeNext(raw: string | null): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/app';
}

function friendly(e: AuthError | Error): string {
  const code = (e as AuthError).code;
  switch (code) {
    case 'invalid_credentials':
      return "That email and password don't match. If you first signed in with an email link, use \"Forgot password\" to set a password.";
    case 'email_not_confirmed':
      return 'Please confirm your email first — we just sent you a new code.';
    case 'otp_expired':
      return 'That code has expired or is wrong. Ask for a new one below.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Too many attempts in a short time. Wait a minute and try again.';
    case 'weak_password':
      return `Choose a stronger password — at least ${MIN_PASSWORD_LENGTH} characters.`;
    case 'user_already_exists':
    case 'email_exists':
      return 'An account with this email already exists. Sign in instead, or reset your password.';
    default:
      return e.message || 'Something went wrong. Please try again.';
  }
}

export default function SignIn() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Signed in (including right after a successful code check) → go where they were headed.
  // Not during 'reset': a recovery code signs you in, but the new password isn't set yet.
  useEffect(() => {
    if (ready && user && mode !== 'reset') navigate(next, { replace: true });
  }, [ready, user, mode, next, navigate]);

  const go = (m: Mode) => { setMode(m); setError(null); setInfo(null); setCode(''); };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError(null); setInfo(null);
    try { await fn(); } catch (e) { setError(friendly(e as AuthError)); } finally { setBusy(false); }
  };

  const onSignIn = () => run(async () => {
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error?.code === 'email_not_confirmed') {
      await sb.auth.resend({ type: 'signup', email: email.trim() });
      go('verify');
      setInfo(`We've sent a new 6-digit code to ${email.trim()}.`);
      return;
    }
    if (error) throw error;
  });

  const onSignUp = () => run(async () => {
    if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
    const { data, error } = await sb.auth.signUp({ email: email.trim(), password });
    if (error) throw error;
    if (data.session) return; // Email confirmation is off in Supabase — already signed in.
    // Supabase hides whether an address is registered: an existing account comes back with no identities.
    if (data.user && data.user.identities?.length === 0) {
      throw new Error('An account with this email already exists. Sign in instead, or reset your password.');
    }
    go('verify');
    setInfo(`We've sent a 6-digit code to ${email.trim()}. Enter it here to finish creating your account.`);
  });

  const onVerify = () => run(async () => {
    const token = code.trim();
    let { error } = await sb.auth.verifyOtp({ email: email.trim(), token, type: 'email' });
    // Older Supabase projects issue signup confirmations under the 'signup' type.
    if (error) ({ error } = await sb.auth.verifyOtp({ email: email.trim(), token, type: 'signup' }));
    if (error) throw error;
  });

  const onForgot = () => run(async () => {
    const { error } = await sb.auth.resetPasswordForEmail(email.trim());
    if (error) throw error;
    go('reset');
    setInfo(`If there's an account for ${email.trim()}, we've sent it a 6-digit code.`);
  });

  const onReset = () => run(async () => {
    if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Use at least ${MIN_PASSWORD_LENGTH} characters for your new password.`);
    // A code is single-use: if it already worked and only the password update failed, don't re-verify.
    const { data: current } = await sb.auth.getSession();
    if (!current.session) {
      const { error: vErr } = await sb.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' });
      if (vErr) throw vErr;
    }
    const { error: uErr } = await sb.auth.updateUser({ password });
    if (uErr) throw uErr;
    setMode('signin'); // lets the effect above redirect now that the password is set
  });

  const resendCode = () => run(async () => {
    const { error } = mode === 'reset'
      ? await sb.auth.resetPasswordForEmail(email.trim())
      : await sb.auth.resend({ type: 'signup', email: email.trim() });
    if (error) throw error;
    setInfo('New code sent — it can take a minute to arrive. Check spam too.');
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    ({ signin: onSignIn, signup: onSignUp, verify: onVerify, forgot: onForgot, reset: onReset })[mode]();
  };

  const titles: Record<Mode, [string, string]> = {
    signin: ['Sign in', 'Welcome back. Your cards and logged spend will be here on any device you sign in from.'],
    signup: ['Create your account', 'Save your cards and spending across devices. Everything you already added on this device can come with you.'],
    verify: ['Check your email', 'Enter the 6-digit code we emailed you.'],
    forgot: ['Reset your password', "Enter your account email and we'll send you a 6-digit code."],
    reset: ['Set a new password', 'Enter the code from your email and choose a new password.'],
  };
  const needsEmail = mode === 'signin' || mode === 'signup' || mode === 'forgot';
  const needsPassword = mode === 'signin' || mode === 'signup' || mode === 'reset';
  const needsCode = mode === 'verify' || mode === 'reset';
  const cta: Record<Mode, string> = { signin: 'Sign in', signup: 'Create account', verify: 'Confirm', forgot: 'Send code', reset: 'Set password and sign in' };

  return (
    <div className="page-narrow">
      <div className="wrap">
        <div className="admin-topbar">
          <Link to="/" className="brand" style={{ color: 'inherit', textDecoration: 'none' }}>Card<span>pare</span></Link>
          <Link className="back-link" to="/app">Continue without an account</Link>
        </div>
        <div className="kicker" />

        <h1>{titles[mode][0]}</h1>
        <p className="sub">{titles[mode][1]}</p>

        <form className="card" onSubmit={submit} noValidate>
          {needsEmail && (
            <>
              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </>
          )}
          {!needsEmail && <p className="hint" style={{ marginTop: 0 }}>Code sent to <b>{email}</b>.</p>}

          {needsCode && (
            <>
              <label className="field-label" htmlFor="code">6-digit code</label>
              <input id="code" className="code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={10}
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
            </>
          )}

          {needsPassword && (
            <>
              <label className="field-label" htmlFor="password">{mode === 'reset' ? 'New password' : 'Password'}</label>
              <input id="password" type={showPassword ? 'text' : 'password'} required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password} onChange={(e) => setPassword(e.target.value)} />
              {mode !== 'signin' && <p className="hint">At least {MIN_PASSWORD_LENGTH} characters.</p>}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} style={{ width: 'auto', margin: 0 }} />
                Show password
              </label>
            </>
          )}

          <button className="btn accent" type="submit" disabled={busy}>{busy ? 'One moment…' : cta[mode]}</button>
          {error && <div className="msg err" role="alert">{error}</div>}
          {info && !error && <div className="msg" role="status">{info}</div>}

          <div className="auth-links">
            {mode === 'signin' && <>
              <button type="button" className="link-btn" onClick={() => go('signup')}>Create an account</button>
              <button type="button" className="link-btn" onClick={() => go('forgot')}>Forgot password?</button>
            </>}
            {mode === 'signup' && <button type="button" className="link-btn" onClick={() => go('signin')}>Already have an account? Sign in</button>}
            {mode === 'forgot' && <button type="button" className="link-btn" onClick={() => go('signin')}>Back to sign in</button>}
            {needsCode && <>
              <button type="button" className="link-btn" disabled={busy} onClick={resendCode}>Send a new code</button>
              <button type="button" className="link-btn" onClick={() => go(mode === 'reset' ? 'forgot' : 'signup')}>Use a different email</button>
            </>}
          </div>
        </form>
      </div>
    </div>
  );
}
