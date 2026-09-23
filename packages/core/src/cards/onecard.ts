import { defineCard } from '../card';

export default defineCard({
  id: 'onecard',
  name: 'OneCard',
  type: 'Cashback (metal)',
  fee: 'Free for life',
  forexRate: '1%',
  verified: '2026-09-22',
  upi: false,
  waiverTarget: null,
  rates: { fuel: 1, upi: 0, amazon: 1, ecommerce: 1, dining: 1, grocery: 1, travel: 1, forex: 1, utilities: 1, other: 1 },
  note: '2 Reward Points/₹100 on general spend, rising to 10 points/₹100 (5X) on your top-2 detected spend categories each month — a category needs at least ₹750 spend that month to qualify toward the top-2. Points redeemed at ₹0.10 each via the in-app store; this app shows a flat 1% assuming your top-2 categories cover most of your spend, which won\'t hold exactly for every month.',
  redeem: 'Points redeemable as cashback in-app at roughly ₹0.10/point. No transfer partners.',
  benefits: [
    'No joining or annual fee, ever',
    'Instant virtual card issuance',
    '1% forex markup, among the lowest available',
    'In-app limit and freeze controls',
  ],
  reward: {
    unit: 'Reward Points',
    isCash: false,
    unitValue: 0.1,
    confidence: 'medium',
    perCategory: { fuel: 10, upi: 0, amazon: 10, ecommerce: 10, dining: 10, grocery: 10, travel: 10, forex: 10, utilities: 10, other: 10 },
    valueNote: '1 Reward Point ≈ ₹0.10 via the in-app store. Figures assume the spend lands in your top-2 categories for the month — base rate outside your top-2 is 2 points/₹100 (0.2% effective).',
    capNote: 'A spend category needs ≥₹750 in a month to qualify toward your top-2.',
  },
  style: {
    color: '#1A1A1A',
    initials: '1C',
  },
});
