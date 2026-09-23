import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { ADMIN_EMAIL, ensureProfile } from '@cardpare/core';
import { authLinkState, sb } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  // False until the stored session (if any) has been read — avoids flashing "Sign in".
  ready: boolean;
  isAdmin: boolean;
  // Signed in via a password-reset email link; the new password hasn't been set yet.
  passwordRecovery: boolean;
  // An email link was expired or already used (e.g. 'otp_expired').
  linkError: string | null;
  clearLinkState: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(authLinkState.passwordRecovery);
  const [linkError, setLinkError] = useState(authLinkState.linkError);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setPasswordRecovery(authLinkState.passwordRecovery);
      setReady(true);
    });
    // Don't await Supabase calls inside this callback — the client holds a lock while it runs.
    const { data } = sb.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (event === 'SIGNED_OUT') setPasswordRecovery(false);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const userId = user?.id;

  useEffect(() => {
    if (user) ensureProfile(sb, user).catch((e) => console.error('ensureProfile', e));
  }, [userId]);

  const value: AuthState = {
    session,
    user,
    ready,
    isAdmin: !!user && user.email === ADMIN_EMAIL,
    passwordRecovery: passwordRecovery && !!user,
    linkError,
    clearLinkState: () => {
      authLinkState.passwordRecovery = false;
      authLinkState.linkError = null;
      setPasswordRecovery(false);
      setLinkError(null);
    },
    signOut: async () => { await sb.auth.signOut(); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
