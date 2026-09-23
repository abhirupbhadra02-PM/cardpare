import { defineCard } from '../card';

export default defineCard({
  id: 'idfc-wealth',
  name: 'IDFC First Wealth',
  type: 'Rewards',
  fee: 'Free for life',
  forexRate: '1.5%',
  verified: '2026-09-22',
  upi: false,
  waiverTarget: null,
  rates: { fuel: 0.125, upi: 0, amazon: 0.375, ecommerce: 0.375, dining: 1.25, grocery: 0.375, travel: 1.25, forex: 1.25, utilities: 0.125, other: 0.375 },
  note: 'Restructured in 2026: 10X FIRST Rewards points (1.25% effective) on dining, travel and international spend from the very first transaction — the old ₹20,000/month threshold was removed in Jun 2026. 3X (0.375%) on regular/UPI spend above ₹2,000. 1X (0.125%) on insurance, utility, railway, FASTag and UPI spend at or below ₹2,000. Point value was separately cut from ₹1/₹150 to ₹1/₹200 spent in Jan 2026 — a real devaluation from older published rates, now reflected here.',
  redeem: 'Points redeemable via FIRST Rewards Gallery for flights/hotels, or as statement credit.',
  benefits: [
    'Unlimited domestic lounge access',
    'Limited complimentary international lounge visits',
    'Comprehensive travel insurance',
    'Free for life, no annual fee',
  ],
  reward: {
    unit: 'FIRST Rewards points',
    isCash: false,
    unitValue: 0.25,
    confidence: 'medium',
    perCategory: { fuel: 0.5, upi: 0, amazon: 1.5, ecommerce: 1.5, dining: 5, grocery: 1.5, travel: 5, forex: 5, utilities: 0.5, other: 1.5 },
    valueNote: '1 FIRST Rewards point ≈ ₹0.25 via statement credit or the Rewards Gallery.',
    capNote: 'Points earn only up to your credit limit per billing cycle — no separate category cap found.',
  },
  style: {
    color: '#6C3FA0',
    initials: 'IW',
  },
});
