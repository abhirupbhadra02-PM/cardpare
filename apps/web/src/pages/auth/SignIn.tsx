import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import type { AuthError } from '@supabase/supabase-js';
import { MIN_PASSWORD_LENGTH } from '@cardpare/core';
import { useAuth } from '../../auth/AuthProvider';
import { sb } from '../../lib/supabase';
import '../../styles/narrow.css';

// Email + password. Confirming a new account and resetting a password work with
// whatever Supabase emails: a link (Supabase's built-in emails) or a 6-digit code
// (once custom email templates are set up — codes keep the home-screen app from
// handing off to a browser). Signing in itself is always email + password, so an
// installed app stays signed in either way.
type Mode = 'signin' | 'signup' | 'verify' | 'forgot' | 'reset' | 'newpassword';

function safeNext(raw: string | null): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/app';
}

function friendly(e: AuthError | Error): string {
  const code = (e as AuthError).code;
  switch (code) {
    case 'invalid_credentials':
      return "That email and password don't match. If you first signed in with an email link, use \"Forgot password\" to set a password.";
    case 'email_not_confirmed':
      return "Your email isn't confirmed yet. Tap the link in the email we sent (check spam), then try again.";
    case 'otp_expired':
      return 'That code has expired or is wrong. Ask for a new one below.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Too many attempts in a short time. Wait a few minutes and try again.';
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
  const { user, ready, passwordRecovery, linkError, clearLinkState } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const [chosenMode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Arriving from a reset link (or a reset code) means: signed in, new password still needed.
  const mode: Mode = passwordRecovery ? 'newpassword' : chosenMode;

  // Signed in → go where they were headed. Not mid-reset: the new password isn't set yet.
  useEffect(() => {
    if (ready && user && !passwordRecovery && mode !== 'reset') navigate(next, { replace: true });
  }, [ready, user, passwordRecovery, mode, next, navigate]);

  const linkNotice = linkError
    ? 'That email link has expired or was already used. Request a new one below.'
    : null;

  const go = (m: Mode) => { setMode(m); setError(null); setInfo(null); setCode(''); if (linkError) clearLinkState(); };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError(null); setInfo(null);
    if (linkError) clearLinkState();
    try { await fn(); } catch (e) { setError(friendly(e as AuthError)); } finally { setBusy(false); }
  };

  const finishPasswordChange = () => { clearLinkState(); navigate(next, { replace: true }); };

  const onSignIn = () => run(async () => {
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error?.code === 'email_not_confirmed') {
      await sb.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/app` } });
      go('verify');
      setInfo(`We've sent a fresh confirmation email to ${email.trim()}.`);
      return;
    }
    if (error) throw error;
  });

  const onSignUp = () => run(async () => {
    if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
    const { data, error } = await sb.auth.signUp({
      email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/app` },
    });
    if (error) throw error;
    if (data.session) return; // Email confirmation is off in Supabase — already signed in.
    // Supabase hides whether an address is registered: an existing account comes back with no identities.
    if (data.user && data.user.identities?.length === 0) {
      throw new Error('An account with this email already exists. Sign in instead, or reset your password.');
    }
    go('verify');
  });

  // With a code: confirm it. Without: they tapped the link in the email — just sign in.
  const onVerify = () => run(async () => {
    const token = code.trim();
    if (!token) {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      return;
    }
    let { error } = await sb.auth.verifyOtp({ email: email.trim(), token, type: 'email' });
    // Older Supabase projects issue signup confirmations under the 'signup' type.
    if (error) ({ error } = await sb.auth.verifyOtp({ email: email.trim(), token, type: 'signup' }));
    if (error) throw error;
  });

  const onForgot = () => run(async () => {
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/signin` });
    if (error) throw error;
    go('reset');
  });

  // Code route for resets. (The link route lands on 'newpassword' instead.)
  const onReset = () => run(async () => {
    if (!code.trim()) throw new Error('Tap the link in the email we sent, or enter the code it shows.');
    if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Use at least ${MIN_PASSWORD_LENGTH} characters for your new password.`);
    // A code is single-use: if it already worked and only the password update failed, don't re-verify.
    const { data: current } = await sb.auth.getSession();
    if (!current.session) {
      const { error: vErr } = await sb.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' });
      if (vErr) throw vErr;
    }
    const { error: uErr } = await sb.auth.updateUser({ password });
    if (uErr) throw uErr;
    finishPasswordChange();
  });

  const onNewPassword = () => run(async () => {
    if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Use at least ${MIN_PASSWORD_LENGTH} characters for your new password.`);
    const { error } = await sb.auth.updateUser({ password });
    if (error) throw error;
    finishPasswordChange();
  });

  const resend = () => run(async () => {
    const { error } = mode === 'reset'
      ? await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/signin` })
      : await sb.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/app` } });
    if (error) throw error;
    setInfo('Sent again — it can take a minute to arrive. Check spam too.');
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    ({ signin: onSignIn, signup: onSignUp, verify: onVerify, forgot: onForgot, reset: onReset, newpassword: onNewPassword })[mode]();
  };

  const who = email.trim() || 'your email';
  const titles: Record<Mode, [string, string]> = {
    signin: ['Sign in', 'Welcome back. Your cards and logged spend will be here on any device you sign in from.'],
    signup: ['Create your account', 'Save your cards and spending across devices. Everything you already added on this device can come with you.'],
    verify: ['Confirm your email', `We've emailed ${who}. Tap the link in that email, then come back here and press the button below. If the email shows a 6-digit code instead, enter it.`],
    forgot: ['Reset your password', "Enter your account email and we'll send you a way to set a new one."],
    reset: ['Check your email', `If there's an account for ${who}, we've emailed it. Tap the link to choose a new password — or, if the email shows a 6-digit code, enter it here with your new password.`],
    newpassword: ['Choose a new password', "You're verified. Set a new password to finish — you'll use it to sign in from now on."],
  };
  const needsEmail = mode === 'signin' || mode === 'signup' || mode === 'forgot';
  const needsPassword = mode === 'signin' || mode === 'signup' || mode === 'reset' || mode === 'newpassword';
  const needsCode = mode === 'verify' || mode === 'reset';
  const cta: Record<Mode, string> = {
    signin: 'Sign in',
    signup: 'Create account',
    verify: code.trim() ? 'Confirm code' : "I've confirmed — sign me in",
    forgot: 'Send reset email',
    reset: 'Set password and sign in',
    newpassword: 'Save password',
  };

  return (
    <div className="page-narrow">
      <div className="wrap">
        <div className="admin-topbar">
          <Link to="/" className="brand" style={{ color: 'inherit', textDecoration: 'none' }}>Card<span>pare</span></Link>
          {mode !== 'newpassword' && <Link className="back-link" to="/app">Continue without an account</Link>}
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

          {needsCode && (
            <>
              <label className="field-label" htmlFor="code">6-digit code {mode === 'verify' ? '(only if your email shows one)' : '(if your email shows one)'}</label>
              <input id="code" className="code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={10}
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
            </>
          )}

          {needsPassword && (
            <>
              <label className="field-label" htmlFor="password">{mode === 'reset' || mode === 'newpassword' ? 'New password' : 'Password'}</label>
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
          {(error || linkNotice) && <div className="msg err" role="alert">{error ?? linkNotice}</div>}
          {info && !error && <div className="msg" role="status">{info}</div>}

          <div className="auth-links">
            {mode === 'signin' && <>
              <button type="button" className="link-btn" onClick={() => go('signup')}>Create an account</button>
              <button type="button" className="link-btn" onClick={() => go('forgot')}>Forgot password?</button>
            </>}
            {mode === 'signup' && <button type="button" className="link-btn" onClick={() => go('signin')}>Already have an account? Sign in</button>}
            {mode === 'forgot' && <button type="button" className="link-btn" onClick={() => go('signin')}>Back to sign in</button>}
            {needsCode && <>
              <button type="button" className="link-btn" disabled={busy} onClick={resend}>Send the email again</button>
              <button type="button" className="link-btn" onClick={() => go(mode === 'reset' ? 'forgot' : 'signup')}>Use a different email</button>
            </>}
          </div>
        </form>
      </div>
    </div>
  );
}
