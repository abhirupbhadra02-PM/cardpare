import { defineCard } from '../card';

export default defineCard({
  id: 'hsbc-live-plus',
  name: 'HSBC Live+',
  type: 'Cashback',
  fee: '₹999+GST (waived ≥ ₹2L/yr)',
  forexRate: '3.5%',
  verified: '2026-09-22',
  upi: false,
  waiverTarget: 200000,
  rates: { fuel: 1.5, upi: 0, amazon: 10, ecommerce: 10, dining: 10, grocery: 10, travel: 1.5, forex: 1.5, utilities: 10, other: 1.5 },
  note: 'The 10% tier is dining, food delivery, grocery, shopping (incl. Amazon/ecommerce) and utility bill payments — fuel is NOT part of this tier. A separate, smaller benefit applies to fuel: ₹250 cashback on contactless fuel spend over ₹10,000/quarter. Combined 10% tier capped at ₹1,200/month. 1.5% flat elsewhere. (Corrected Sep 2026 — earlier data incorrectly included fuel in the 10% tier.)',
  redeem: 'Cashback as statement credit — no transfer partners.',
  benefits: [
    'No lounge access on this variant',
    'Strong everyday-category cashback',
    'Quarterly fuel cashback benefit, separate from the main 10% tier',
  ],
  reward: {
    unit: 'Cashback',
    isCash: true,
    unitValue: 1,
    confidence: 'medium',
    perCategory: { fuel: 1.5, upi: 0, amazon: 10, ecommerce: 10, dining: 10, grocery: 10, travel: 1.5, forex: 1.5, utilities: 10, other: 1.5 },
    valueNote: 'Direct statement cashback, no conversion loss.',
    capNote: '₹1,200/month combined cap on the 10% tier. Fuel gets a separate ₹250/quarter benefit instead, on contactless spend over ₹10,000/quarter.',
  },
  style: {
    color: '#C40F1E',
    initials: 'HL',
  },
});
