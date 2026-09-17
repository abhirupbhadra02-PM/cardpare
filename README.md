# Cardpare — launch runbook

## What's in this folder
- `index.html` — the public landing page (marketing, waitlist)
- `app.html` — the actual tool (Dashboard, Plan, Log & Audit, Redemption, My Cards, Compare)
- `privacy.html`, `terms.html` — draft legal pages. **Replace `hello@cardpare.com` and add a real date before going live. Have a lawyer glance at both before treating them as binding.**
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — PWA support, so visitors can "Add to Home Screen"

## Before you flip this live — checklist
- [ ] Swap `hello@cardpare.com` in `app.html` and `index.html` for your real email (search both files for that string)
- [ ] Update the "Last updated" date on `privacy.html` and `terms.html`
- [ ] Pick your actual domain and update it anywhere the product is referred to by name
- [ ] Open `app.html` on an actual phone (not just desktop preview) before sharing widely
- [ ] Confirm the card data in `CARD_DB` is still accurate — check the `verified` date on each card

## Deploying (free, no server to manage)

1. **Put this folder in a GitHub repository** (free). This gives you version history — no more losing track of changes — and is what the free hosts below deploy from automatically.
2. **Create a free account on Vercel or Netlify** and connect it to that GitHub repo. Either one auto-detects a static site — no build configuration needed for this project.
3. **Every time you push a change to GitHub, it auto-deploys.** This replaces the manual "copy file, re-share" step entirely — that's the automation that matters most day to day.
4. **Connect your own domain**: in Vercel/Netlify's dashboard, add your domain, then add the DNS records they give you at your domain registrar (wherever you bought the domain). This usually takes a few minutes to set up and up to 24-48 hours to fully propagate.

## What's automated vs. what needs you

**Automated once set up:**
- Deployment (push to GitHub → live in ~1 minute)
- Uptime monitoring — add a free UptimeRobot check pointed at your domain; it emails you if the site goes down
- Basic analytics — Vercel/Netlify both offer a free basic analytics add-on, or use Plausible/Simple Analytics' free trial

**Needs you, because it needs your identity/accounts/payment details — nothing here can be done on your behalf:**
- Registering the domain itself (Namecheap, Porkbun, GoDaddy — roughly ₹700–1,200/year)
- Creating the GitHub, Vercel/Netlify accounts
- Signing up as a publisher on an affiliate network (EarnKaro, Cuelinks, GroMo) — needs your PAN and bank account for payouts
- Anything requiring you to accept terms of service on your own behalf

## Adding affiliate links (once you have them)

Once you're approved on an affiliate network and have tracked links for specific cards, they slot into `CARD_DB` in `app.html` — each card object can carry a `applyUrl` field, and a small "Apply" button can render next to it in Compare, My Cards, and Redemption. Bring me the links when you have them and I'll wire this in — it's a quick addition once the URLs exist.

## The known gap in this build

Card requests and the waitlist were originally built to be shared across every visitor via Claude's own storage system. On a real domain, that sharing doesn't work — each visitor's browser is isolated. Both have been patched to fall back to opening an email to you instead, so nothing silently disappears. The real fix — a small shared database (Supabase's free tier is the natural choice, and it's the same tool recommended for the eventual accounts/login system) — is a good first task once you're ready to move past the prototype phase.
