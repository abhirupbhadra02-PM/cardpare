import { defineCard } from '../card';

export default defineCard({
  id: 'hdfc-infinia',
  name: 'HDFC Infinia',
  type: 'Rewards (metal)',
  fee: '₹12,500+GST (waived ≥ ₹10L/yr)',
  forexRate: '2%',
  verified: '2026-09-22',
  upi: false,
  waiverTarget: 1000000,
  rates: { fuel: 3.3, upi: 0, amazon: 3.3, ecommerce: 3.3, dining: 3.3, grocery: 3.3, travel: 3.3, forex: 3.3, utilities: 3.3, other: 3.3 },
  note: 'Flat ~3.3% via Reward Points, higher via SmartBuy flight/hotel bookings. No monthly cap.',
  redeem: 'Reward Points transfer to 20+ airline/hotel partners at strong ratios — among the best transfer value in India.',
  benefits: [
    'Unlimited domestic & international lounge access (Priority Pass)',
    'Complimentary golf games each month',
    'Comprehensive travel & purchase insurance',
    'Dedicated concierge service',
  ],
  reward: {
    unit: 'Reward Points',
    isCash: false,
    unitValue: 1,
    confidence: 'medium',
    perCategory: { fuel: 3.3, upi: 0, amazon: 3.3, ecommerce: 3.3, dining: 3.3, grocery: 3.3, travel: 3.3, forex: 3.3, utilities: 3.3, other: 3.3 },
    valueNote: '1 Reward Point ≈ ₹1 via SmartBuy flight/hotel bookings — worth less (~₹0.50 catalogue, ~₹0.30 cash) via other redemption paths.',
    capNote: 'No cap on the base rate. SmartBuy can accelerate to 10X on specific merchants, capped at 3,000 pts/month for brand vouchers and 15,000 pts/month overall (changed Jul 2026).',
  },
  style: {
    color: '#2B2B2B',
    initials: 'HI',
  },
});
