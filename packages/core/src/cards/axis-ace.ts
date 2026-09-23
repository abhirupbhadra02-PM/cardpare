import { defineCard } from '../card';

export default defineCard({
  id: 'axis-ace',
  name: 'Axis Ace',
  type: 'Cashback',
  fee: '₹499+GST (waived ≥ ₹2L/yr)',
  forexRate: '3.5%',
  verified: '2026-09-22',
  upi: false,
  waiverTarget: 200000,
  rates: { fuel: 1.5, upi: 0, amazon: 1.5, ecommerce: 1.5, dining: 4, grocery: 1.5, travel: 4, forex: 1.5, utilities: 5, other: 1.5 },
  note: '5% on utility bill payments/recharges via the Google Pay app (Android only — does not qualify on iPhone). 4% on Swiggy, Zomato and Ola. Both tiers share one ₹500/month combined cap. 1.5% flat elsewhere. (Corrected Sep 2026 — earlier data understated this card\'s top tiers as 4%/2%.)',
  redeem: 'Straight cashback as statement credit — no transfer partners.',
  benefits: [
    '4 complimentary domestic lounge visits/year',
    '1% fuel surcharge waiver',
    'Best paired with Google Pay bill payments (Android only)',
  ],
  reward: {
    unit: 'Cashback',
    isCash: true,
    unitValue: 1,
    confidence: 'medium',
    perCategory: { fuel: 1.5, upi: 0, amazon: 1.5, ecommerce: 1.5, dining: 4, grocery: 1.5, travel: 4, forex: 1.5, utilities: 5, other: 1.5 },
    valueNote: 'Direct statement cashback, no conversion loss.',
    capNote: '₹500/month combined cap across the 5% and 4% tiers.',
  },
  style: {
    color: '#8E2E44',
    initials: 'AC',
  },
});
