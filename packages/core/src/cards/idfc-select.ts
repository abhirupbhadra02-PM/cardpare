import { defineCard } from '../card';

export default defineCard({
  id: 'idfc-select',
  name: 'IDFC First Select',
  type: 'Rewards',
  fee: 'Free for life',
  forexRate: '1.5%',
  verified: '2026-09-01',
  upi: false,
  waiverTarget: null,
  rates: { fuel: 0.75, upi: 0, amazon: 0.75, ecommerce: 0.75, dining: 0.75, grocery: 0.75, travel: 0.75, forex: 0.75, utilities: 0.75, other: 0.75 },
  note: 'Previously modeled as matching IDFC First Wealth\'s structure. Wealth\'s terms changed materially in 2026 (10X threshold removed, point value cut) and it\'s unclear from available sources whether Select kept the older ₹20,000/month spend threshold or changed the same way — flagged for direct confirmation with IDFC before relying on the numbers below.',
  redeem: 'Points redeemable via FIRST Rewards Gallery, or as statement credit.',
  benefits: [
    'Domestic lounge access, linked to quarterly spend',
    'Free for life, no annual fee',
    'Comprehensive travel insurance',
  ],
  reward: {
    unit: 'FIRST Rewards points',
    isCash: false,
    unitValue: 0.25,
    confidence: 'unverified',
    perCategory: { fuel: 3, upi: 0, amazon: 3, ecommerce: 3, dining: 3, grocery: 3, travel: 3, forex: 3, utilities: 3, other: 3 },
    valueNote: '1 FIRST Rewards point ≈ ₹0.25 (estimated) — this card\'s current earn structure is unconfirmed post-2026, see note above.',
    capNote: 'Unconfirmed post-2026 changes.',
    warning: 'Reward structure unverified — IDFC changed Select\'s sibling card (Wealth) significantly in 2026 and it\'s unclear if Select changed too. Confirm with IDFC before relying on this.',
  },
  style: {
    color: '#8E6BAE',
    initials: 'IS',
  },
});
