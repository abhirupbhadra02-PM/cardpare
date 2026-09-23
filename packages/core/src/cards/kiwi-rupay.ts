import { defineCard } from '../card';

export default defineCard({
  id: 'kiwi-rupay',
  name: 'Kiwi RuPay',
  type: 'Cashback',
  fee: 'Free for life',
  forexRate: 'N/A (domestic focus)',
  verified: '2026-09-22',
  upi: true,
  waiverTarget: null,
  rates: { fuel: 1.5, upi: 1.5, amazon: 1.5, ecommerce: 1.5, dining: 1.5, grocery: 1.5, travel: 1.5, forex: 0, utilities: 1.5, other: 1.5 },
  note: '1.5% base on UPI Scan & Pay (free plan). The paid Neon membership (₹999+tax/year) raises the base to 2%, with milestone bonuses to 3%/4%/5% after ₹50,000/₹1,00,000/₹1,50,000 cumulative spend in a year — milestone bonuses sit outside the monthly cap.',
  redeem: 'Cashback lands in-app instantly — no transfer partners.',
  benefits: [
    'No annual fee',
    'Instant virtual card, works directly on UPI apps',
    'No-cost EMI available on select purchases',
  ],
  reward: {
    unit: 'Cashback',
    isCash: true,
    unitValue: 1,
    confidence: 'medium',
    perCategory: { fuel: 1.5, upi: 1.5, amazon: 1.5, ecommerce: 1.5, dining: 1.5, grocery: 1.5, travel: 1.5, forex: 0, utilities: 1.5, other: 1.5 },
    valueNote: 'Cashback lands in-app instantly, no conversion loss.',
    capNote: 'Capped at 1% of your credit limit/month (free plan); Neon members are capped at the lower of that or ₹500/month, which can actually be more restrictive for higher-limit users.',
  },
  style: {
    color: '#2E9E5B',
    initials: 'KW',
  },
});
