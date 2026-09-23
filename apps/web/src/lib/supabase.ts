import { createCardpareClient } from '@cardpare/core';

// Read before the Supabase client processes and strips the URL: tells us whether
// this page load came from a password-reset link, or from an email link that failed.
const initialHash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
const hashParams = new URLSearchParams(initialHash);

// One client for the whole web app. Sessions persist in this browser's localStorage,
// which is also what keeps an installed home-screen app signed in.
export const sb = createCardpareClient();

export const authLinkState = {
  // Arrived via a "Reset password" email link: signed in, but must choose a new password.
  passwordRecovery: hashParams.get('type') === 'recovery',
  // Arrived via an expired/used email link.
  linkError: hashParams.get('error_code') ?? (hashParams.get('error') ? 'link_error' : null),
};

// Registered at startup so the recovery event can't fire before anyone is listening.
sb.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') authLinkState.passwordRecovery = true;
});
