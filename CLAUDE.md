# Cardpare — project context for Claude Code

## What this is
Cardpare is a credit card planning and audit tool for the Indian market. It tells users which held card to use for a purchase, logs what they actually used, and shows the gap between what they earned and what they should have earned. Not a payments app, not financial advice — a personal finance utility, deliberately built for a narrow, financially-literate audience rather than mass-market scale.

## File structure
- `index.html` — public marketing/landing page. Has a waitlist capture and problem/solution/feature sections.
- `app.html` — the actual tool. Tabs: Dashboard, Plan, Log & Audit, Redemption, My Cards, Compare.
- `privacy.html`, `terms.html` — legal pages, currently drafts, not lawyer-reviewed.
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — PWA support (Add to Home Screen).
- No build step. Each HTML file is self-contained (inline `<style>` and `<script>`). Keep it that way unless explicitly asked to introduce a build process — the whole point of this structure is that it deploys as static files with zero tooling.

## Design system (don't drift from this without being asked)
- Fonts: Fraunces (serif, headings) + Inter (body) + IBM Plex Mono (numbers/money values)
- Colors: `--bg:#F6F6F3` `--surface:#FFFFFF` `--ink:#14161A` `--ink-soft:#6B6F76` `--accent:#2F5D50` (deep pine green) `--warn:#A8402F`
- Aesthetic direction: quiet, editorial, restrained — deliberately not generic AI-SaaS-template looking. One accent color, generous whitespace, hairline borders over drop shadows.
- Brand mark: "Card" in `--ink`, "pare" in `--accent`, rendered as `Card<span>pare</span>`.

## Core data model (`app.html`)
- `CARD_DB` — hand-curated array of ~14 Indian credit cards, each with category reward `rates` (as %), `fee`, `forexRate`, `benefits` list, `redeem` info, `upi` capability flag, `waiverTarget`/`tiers` for milestone tracking, and a `verified` date. **This database is the actual product** — accuracy and the visible "last verified" date matter more than any UI polish. Never silently change a rate without updating `verified`.
- `CARD_STYLE` — chip color/initials per card, used for visual identity across the app. Purely cosmetic, safe to extend for new cards.
- `heldCards` / `transactions` / `cardRequests` / `plannedPurchases` / `monthlyLimit` — user data, persisted via `storageAdapter` (see below).

## The storage adapter — important, don't bypass it
`storageAdapter` wraps two backends: Claude's own `window.storage` (works when run inside Claude's artifact viewer) and `localStorage` (fallback for everywhere else, including the real deployed site). **Every read/write must go through `storageAdapter`, never call `window.storage` or `localStorage` directly** — this is what makes the app work identically whether someone's testing it inside Claude or on the live domain.

## Known, deliberate gaps (not bugs — don't "fix" without discussion)
- **Card requests and the waitlist are not actually shared across users on the real domain.** `localStorage` is per-browser. Both features fall back to opening a `mailto:hello@cardpare.com` so submissions still reach the founder. The real fix (a small shared database) is intentionally deferred until real accounts/backend exist — see below.
- **No user accounts or server-side backend yet.** Everything lives in the visitor's own browser. This is intentional for the current stage — the next real infrastructure step, when it happens, is Supabase (auth + Postgres + free tier), not a rebuild of what exists.
- **Affiliate links are not wired in.** The plan is for each card in `CARD_DB` to eventually carry an `applyUrl` once the founder is approved on an Indian card affiliate network (EarnKaro/Cuelinks/GroMo). Don't invent placeholder affiliate links.
- **Reward math is a flat-percentage model.** It does not currently enforce monthly caps across multiple transactions in the same category (e.g., HDFC Millennia's ₹1,000/month cap isn't deducted as it's used up). Known limitation, not yet fixed.
- **EMI purchases**: the full reward is credited once, in the purchase month, on the full original amount — not spread across installments. Later installment months only affect the spend total, not "Earned."

## Working conventions
- This is a solo, non-technical founder's project. Prefer clear, complete changes over minimal diffs that require follow-up explanation.
- Push changes as a branch/PR for review — never assume it's fine to merge straight to `main`.
- When editing card data, always update the `verified` date on any row you touch.
- Match the existing copy voice: plain, direct, slightly warm, no marketing fluff, no emoji.
