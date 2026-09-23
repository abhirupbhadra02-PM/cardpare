import { createCardpareClient } from '@cardpare/core';

// One client for the whole web app. Sessions persist in this browser's localStorage,
// which is also what keeps an installed home-screen app signed in.
export const sb = createCardpareClient();
