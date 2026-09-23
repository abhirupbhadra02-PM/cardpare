import { defineCard } from '../card';

export default defineCard({
  id: 'amazonpay-icici',
  name: 'Amazon Pay ICICI',
  type: 'Cashback',
  fee: 'Free for life',
  forexRate: '3.5%',
  verified: '2026-09-22',
  upi: false,
  waiverTarget: null,
  rates: { fuel: 1, upi: 0, amazon: 5, ecommerce: 1, dining: 1, grocery: 1, travel: 1, forex: 1, utilities: 1, other: 1 },
  note: '5% on Amazon for Prime members (3% non-Prime), uncapped.',
  redeem: 'Cashback lands directly as Amazon Pay balance — no transfer partners, spend-only.',
  benefits: [
    'No joining or annual fee, ever',
    '1% fuel surcharge waiver',
    'Cashback credited directly, no redemption steps',
  ],
  reward: {
    unit: 'Cashback',
    isCash: true,
    unitValue: 1,
    confidence: 'high',
    perCategory: { fuel: 1, upi: 0, amazon: 5, ecommerce: 1, dining: 1, grocery: 1, travel: 1, forex: 1, utilities: 1, other: 1 },
    valueNote: 'Cashback lands directly as spendable Amazon Pay balance — no conversion loss.',
    capNote: 'Uncapped.',
  },
  style: {
    color: '#E8890C',
    initials: 'AI',
  },
});
