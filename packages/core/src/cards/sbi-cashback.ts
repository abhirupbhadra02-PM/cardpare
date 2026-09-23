import { defineCard } from '../card';

export default defineCard({
  id: 'sbi-cashback',
  name: 'SBI Cashback',
  type: 'Cashback',
  fee: '₹999+GST (waived ≥ ₹2L/yr)',
  forexRate: '3.5%',
  verified: '2026-09-22',
  upi: false,
  waiverTarget: 200000,
  rates: { fuel: 1, upi: 0, amazon: 5, ecommerce: 5, dining: 1, grocery: 1, travel: 1, forex: 1, utilities: 1, other: 1 },
  note: '5% on all online spend, capped ₹2,000/statement cycle (cut from ₹5,000, effective 1 Apr 2026). 1% offline, also now capped ₹2,000/cycle (new cap added the same date — offline was previously uncapped at this rate).',
  redeem: 'Cashback as statement credit — no transfer partners.',
  benefits: [
    '1% fuel surcharge waiver',
    'No lounge access',
    'Simple, no-frills cashback structure',
  ],
  reward: {
    unit: 'Cashback',
    isCash: true,
    unitValue: 1,
    confidence: 'high',
    perCategory: { fuel: 1, upi: 0, amazon: 5, ecommerce: 5, dining: 1, grocery: 1, travel: 1, forex: 1, utilities: 1, other: 1 },
    valueNote: 'Direct statement cashback, no conversion loss.',
    capNote: '₹2,000/statement cycle on the 5% online tier; a separate ₹2,000/cycle cap now applies to the 1% offline tier too (since 1 Apr 2026).',
  },
  style: {
    color: '#1F4E8C',
    initials: 'SC',
  },
});
