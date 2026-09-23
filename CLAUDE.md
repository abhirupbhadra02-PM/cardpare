# Cardpare — project context for Claude Code

## What this is
Cardpare is a credit card planning and audit tool for the Indian market. It tells users which held card to use for a purchase, logs what they actually used, and shows the gap between what they earned and what they should have earned. Not a payments app, not financial advice — a personal finance utility, deliberately built for a narrow, financially-literate audience rather than mass-market scale. Website now; a mobile app is planned and should reuse `packages/core`.

## Structure (npm workspaces monorepo)
- `packages/core/` — platform-neutral TypeScript shared by the website and the future mobile app. **No React, no DOM, no `window`/`localStorage` here.**
  - `src/cards/<card-id>.ts` — one file per card; `src/cards/index.ts` sets display order.
  - `src/card.ts` — the `Card` type. `src/schema.ts` — the validation rules (zod). `src/validate.ts` — runs them.
  - `src/rewards.ts`, `ledger.ts`, `plan.ts` — ranking, verdicts, native reward units, EMI-aware monthly summary, plan insights. Pure functions.
  - `src/cloud.ts` — **every** Supabase read/write. `src/config.ts` — Supabase URL, publishable key, admin email.
- `apps/web/` — Vite + React + TypeScript website (single-page app, React Router).
  - `src/pages/landing`, `pages/app/*` (Dashboard, Plan, Audit, Redemption, Rewards, MyCards, Compare), `pages/admin`, `pages/auth/SignIn`, `pages/legal`.
  - `src/data/AppDataProvider.tsx` — the app's state and save logic; `src/data/localStore.ts` — signed-out storage.
  - `src/auth/AuthProvider.tsx` — session, admin flag, profile self-heal.
  - `public/` — PWA manifest, service worker, icons.
- `supabase/schema.sql` — full database setup (idempotent). `supabase/migrations/` — changes to run on the existing project, oldest first.
- `vercel.json` — build/output config, SPA fallback, and redirects from the old `*.html` URLs (keeps bookmarks and installed home-screen apps working).

## Commands
- `npm install` · `npm run dev` (local site) · `npm test` · `npm run typecheck`
- `npm run build` — typechecks and tests `core` first, then builds the site. **An invalid card entry fails the build**, which blocks the Vercel deploy.

## Card data — the actual product
- Accuracy and the visible "last verified" date matter more than any UI polish. Never change a rate without updating `verified` on that card.
- Adding a card: copy an existing file in `packages/core/src/cards/`, edit it, add it to `cards/index.ts`, run `npm test`.
- Rules enforced by `schema.ts` (the build fails if any is broken): every category present in `rates` (0–100) and `reward.perCategory`; `rates[cat]` must equal `perCategory[cat] × unitValue` (the ranking maths and the Rewards tab read different fields and must agree); `verified` is a real date and not in the future; cashback cards have `unitValue` 1; `confidence: 'unverified'` requires a user-facing `warning`; unique kebab-case ids.
- `card.ts` and `schema.ts` describe the same shape; a compile-time check fails if they drift. Keep zod out of anything the website imports (it would ship to users' browsers).
- `style` (chip colour/initials) is cosmetic and safe to change.

## Data and accounts
- **Signed out:** everything lives in the browser via `localStore`, using the same `cardpare:*` keys the original single-file app used — don't rename them, or existing users lose their data.
- **Signed in:** the same state loads from and saves to Supabase through `packages/core/src/cloud.ts`. On first sign-in, if the browser has data and the account has none, the user is offered an import.
- Writes that fail show an error instead of pretending to save.
- Card requests and the waitlist are public, shared Supabase tables, whether or not you're signed in. Votes go through the `adjust_card_request_votes` function, not direct updates.
- Auth: email + password. Confirming a new account and resetting a password accept **either** an emailed link (Supabase's built-in templates) **or** a 6-digit code (custom templates with `{{ .Token }}`, which need custom SMTP — see README). Codes are preferred: links open a browser instead of the installed home-screen app. Reset links can land on any page; `AuthLinkRedirect` in `App.tsx` sends them to `/signin` for "Choose a new password".
- Admin (`/admin`) is gated in the database: RLS policies and `admin_user_count()` check the signed-in JWT email. The admin email lives in `core/src/config.ts` **and** in the SQL — change both together.
- The old "runs inside Claude's artifact viewer" mode (`window.storage`) no longer exists; the app is a normal website now.

## Design system (don't drift from this without being asked)
- Fonts: Fraunces (serif, headings) + Inter (body) + IBM Plex Mono (numbers/money values)
- Colors: `--bg:#F6F6F3` `--surface:#FFFFFF` `--ink:#14161A` `--ink-soft:#6B6F76` `--accent:#2F5D50` (deep pine green) `--warn:#A8402F` — tokens in `apps/web/src/styles/tokens.css`.
- Aesthetic: quiet, editorial, restrained — deliberately not generic AI-SaaS-template looking. One accent color, generous whitespace, hairline borders over drop shadows.
- Brand mark: "Card" in `--ink`, "pare" in `--accent`, rendered as `Card<span>pare</span>`.
- Each page's CSS is scoped under a page class (`.page-app`, `.page-landing`, `.page-narrow`, `.page-legal`) so pages can't restyle each other. The header account menu (`account.css`) is shared and unscoped.
- Mobile-first: the section nav is a drawer below 860px and a sidebar above.

## Known, deliberate gaps (not bugs — don't "fix" without discussion)
- **Tracking is manual.** Automatic import (email parsing, Gmail/Outlook connection) was considered and deliberately not built. The long-term plan is India's Account Aggregator framework.
- **Affiliate links are not wired in.** Each card will eventually carry an `applyUrl` once the founder is approved on an Indian card affiliate network (EarnKaro/Cuelinks/GroMo). Don't invent placeholder affiliate links.
- **Reward maths is a flat-percentage model.** Monthly caps across multiple transactions aren't enforced (e.g. HDFC Millennia's cap isn't deducted as it's used up).
- **EMI purchases:** the full reward is credited once, in the purchase month, on the full amount. Later installment months only affect the spend total.
- **Settings and Account** in the profile menu are placeholders ("Coming soon").
- Privacy policy and terms are drafts, not lawyer-reviewed.

## Working conventions
- Solo, non-technical founder. Prefer clear, complete changes over minimal diffs that need follow-up explanation. After any change, give a short plain-English summary.
- If a request is ambiguous or could be done more than one way, ask before starting.
- Always work on a branch and open a PR — never commit straight to `main`. Vercel posts a preview link on each PR.
- When editing card data, always update the `verified` date on any card you touch.
- Match the existing copy voice: plain, direct, slightly warm, no marketing fluff, no emoji.
