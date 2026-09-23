import { defineCard } from '../card';

export default defineCard({
  id: 'axis-atlas',
  name: 'Axis Atlas',
  type: 'Miles',
  fee: '₹5,000+GST, no waiver',
  forexRate: '3.5%',
  verified: '2026-09-22',
  upi: false,
  waiverTarget: null,
  tiers: [
    {
      label: 'Silver tier',
      target: 300000,
    },
    {
      label: 'Gold tier',
      target: 750000,
    },
  ],
  rates: { fuel: 0, upi: 0, amazon: 1, ecommerce: 1, dining: 1, grocery: 1, travel: 2.5, forex: 1, utilities: 0, other: 1 },
  note: '5 EDGE Miles/₹100 on travel (via Travel EDGE), 2/₹100 elsewhere. Fuel, rent, utilities excluded from earning.',
  redeem: 'EDGE Miles transfer to 20+ airline/hotel partners at 1:2. Value shown assumes ~₹0.5/mile — actual value depends heavily on the redemption chosen.',
  benefits: [
    'Tiered domestic & international lounge access by annual spend',
    '2,500 EDGE Miles welcome bonus on first transaction',
    'Milestone EDGE Miles up to 10,000/year at higher tiers',
  ],
  reward: {
    unit: 'EDGE Miles',
    isCash: false,
    unitValue: 0.5,
    confidence: 'medium',
    perCategory: { fuel: 0, upi: 0, amazon: 2, ecommerce: 2, dining: 2, grocery: 2, travel: 5, forex: 2, utilities: 0, other: 2 },
    valueNote: 'Estimated at ₹0.50/mile for comparison. Real value varies: ~₹1/mile via Travel EDGE portal bookings, more or less via the 20+ airline/hotel transfer partners depending on the program.',
    capNote: '5 miles/₹100 travel rate applies up to ₹2 lakh/month in travel spend, then drops to 2 miles/₹100. Fuel, rent, utilities, wallets, gold/jewelry, insurance and government payments earn 0. Annual transfer caps: 30,000 miles/year to Group A partners, 120,000/year to Group B.',
  },
  style: {
    color: '#7B2E3B',
    initials: 'AA',
  },
});
