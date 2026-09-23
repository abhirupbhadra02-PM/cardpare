import { defineCard } from '../card';

export default defineCard({
  id: 'axis-indianoil',
  name: 'Axis Bank IndianOil RuPay',
  type: 'Cashback',
  fee: '₹500+GST (waived ≥ ₹3.5L/yr)',
  forexRate: '3.5%',
  verified: '2026-09-22',
  upi: true,
  waiverTarget: 350000,
  rates: { fuel: 4, upi: 1, amazon: 1, ecommerce: 1, dining: 1, grocery: 1, travel: 1, forex: 1, utilities: 1, other: 1 },
  note: '4% at IOCL pumps ≈ 20 EDGE Reward Points/₹100, worth ~₹0.20/point via the EDGE Rewards Portal (vouchers). Accelerated fuel earning is capped at ₹5,000/month spend (~1,000 points). Separately, a 1% fuel surcharge waiver applies, capped ₹50/statement cycle. RuPay network, so it is UPI-linkable.',
  redeem: 'Points redeemable as gift/e-commerce vouchers via the EDGE Rewards Portal — no airline/hotel transfer.',
  benefits: [
    '1% fuel surcharge waiver at IOCL pumps',
    'RuPay network — usable on UPI apps',
    'No lounge access on this variant',
  ],
  reward: {
    unit: 'EDGE Reward Points',
    isCash: false,
    unitValue: 0.2,
    confidence: 'medium',
    perCategory: { fuel: 20, upi: 5, amazon: 5, ecommerce: 5, dining: 5, grocery: 5, travel: 5, forex: 5, utilities: 5, other: 5 },
    valueNote: '1 EDGE Reward Point ≈ ₹0.20 via the EDGE Rewards Portal (gift/e-commerce vouchers).',
    capNote: 'Accelerated fuel tier capped at ₹5,000/month eligible spend (~1,000 points). A separate 1% fuel surcharge waiver is capped at ₹50/cycle.',
  },
  style: {
    color: '#D9531E',
    initials: 'IO',
  },
});
