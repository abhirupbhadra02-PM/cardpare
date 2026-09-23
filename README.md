# Cardpare — runbook

Know which card to use, and catch it when you don't. See `CLAUDE.md` for how the code is organised.

## Running it locally
Needs Node.js 20 or newer.

```
npm install
npm run dev      # opens the site at http://localhost:5173
npm test         # checks every card entry + the reward maths
npm run build    # what Vercel runs; fails if any card entry is invalid
```

## Adding or updating a card
1. In `packages/core/src/cards/`, copy an existing card file (e.g. `axis-ace.ts`) to a new file named after the card's id.
2. Fill in every field and set `verified` to today's date.
3. Add it to the list in `packages/core/src/cards/index.ts` (that list is the display order).
4. Run `npm test`. If anything is wrong, it tells you exactly which card and field. For example: `rates.travel is 3% but reward.perCategory.travel × unitValue = 2.5% — update both together`.
5. Open a PR. Vercel won't deploy a build with an invalid card.

## Deploying
Vercel deploys from GitHub automatically; `vercel.json` tells it how to build (no dashboard settings needed). Every PR gets a preview link, and merging to `main` updates the live site. Old `/app.html`-style links redirect to the new addresses.

## Supabase setup
Do each step once, in the Supabase dashboard for the project.

1. **Database.** In SQL Editor, run `supabase/schema.sql` (already done), then each file in `supabase/migrations/`, oldest first.
2. **URL configuration.** Authentication → URL Configuration: set **Site URL** to your live address. Under **Redirect URLs** add your live address followed by `/**`, and `https://*.vercel.app/**`, so email links also work on Vercel previews.
3. **Email confirmation.** Authentication → Sign In / Providers → Email: keep **Confirm email** on.
4. **Your own email sender (before inviting real users).** Supabase's built-in sender is meant for testing. It's heavily rate-limited and, as far as I know, only delivers to your own team's addresses. Connect a provider under Authentication → SMTP Settings (e.g. Resend, Postmark, Amazon SES). This needs a domain you own.
5. **Codes instead of links (after step 4).** Supabase only lets you edit email templates once custom SMTP is on. Then, in Authentication → Emails → Templates, change **Confirm signup** and **Reset password** to include the code, e.g. `Your Cardpare code is {{ .Token }}`.

The app works with either kind of email. With Supabase's standard emails, people get a link: tapping it confirms the account or opens "Choose a new password". After step 5 they get a 6-digit code to type in, so nothing ever opens a browser outside the home-screen app. Signing in is always email + password, so the installed app stays signed in either way.

## Before launch — checklist
- [ ] Replace the "insert contact email at launch" placeholders and dates in the privacy and terms pages (`apps/web/src/pages/legal/Legal.tsx`), and have a lawyer review both.
- [ ] Custom SMTP set up in Supabase (step 4 above), then the code templates (step 5).
- [ ] Open the site on an actual phone, install it to the home screen, and sign in there.
- [ ] Check the `verified` date on each card.

## Needs you, not code
Registering the domain, creating accounts (GitHub, Vercel, Supabase, an email provider), and signing up for an affiliate network (needs your PAN and bank details).
