import { defineCard } from '../card';

export default defineCard({
  id: 'hdfc-millennia',
  name: 'HDFC Millennia',
  type: 'Cashback',
  fee: '₹1,000+GST (waived ≥ ₹1L/yr)',
  forexRate: '3.5%',
  verified: '2026-09-22',
  upi: false,
  waiverTarget: 100000,
  rates: { fuel: 1, upi: 0, amazon: 1, ecommerce: 5, dining: 5, grocery: 1, travel: 1, forex: 1, utilities: 1, other: 1 },
  note: '5% capped at ₹1,000 CashPoints/month across 10 listed brands.',
  redeem: 'CashPoints → statement credit or SmartBuy vouchers. No airline/hotel transfer partners.',
  benefits: [
    '8 complimentary domestic lounge visits/year, linked to quarterly spend',
    '1% fuel surcharge waiver',
    'Welcome voucher on activation',
  ],
  reward: {
    unit: 'CashPoints',
    isCash: false,
    unitValue: 1,
    confidence: 'medium',
    perCategory: { fuel: 1, upi: 0, amazon: 1, ecommerce: 5, dining: 5, grocery: 1, travel: 1, forex: 1, utilities: 1, other: 1 },
    valueNote: '1 CashPoint ≈ ₹1 via statement credit (the simplest redemption) — worth less, ~₹0.30, via SmartBuy travel/catalogue redemption.',
    capNote: '5% tier capped at 1,000 CashPoints/statement cycle; the 1% tier is separately capped at 1,000 CashPoints/cycle.',
  },
  style: {
    color: '#C0392B',
    initials: 'HM',
  },
});
