import { defineCard } from '../card';

export default defineCard({
  id: 'scapia',
  name: 'Scapia Federal',
  type: 'Travel co-brand',
  fee: 'Free for life',
  forexRate: '0%',
  verified: '2026-09-01',
  upi: false,
  waiverTarget: null,
  rates: { fuel: 1, upi: 0, amazon: 1, ecommerce: 1, dining: 1, grocery: 1, travel: 5, forex: 3, utilities: 1, other: 1 },
  note: 'Zero forex markup and strong travel-booking rewards via the Scapia app specifically. Coin-to-rupee conversion could not be confirmed this pass — some sources suggest 5 Scapia Coins = ₹1 (i.e. 1 coin ≈ ₹0.20), which would contradict the 1-coin-≈-₹1 assumption this app has used, and sources disagreed on whether the base earn rate is 10% or 20% coins on general spend. Flagged for direct confirmation with Scapia before relying on the figures below — they may be overstated.',
  redeem: 'Coins redeemable for flights/hotels in-app. No external airline/hotel transfer.',
  benefits: [
    'Zero forex markup on international spends',
    'Companion perks on select international flight bookings',
    'Free for life, no annual fee',
  ],
  reward: {
    unit: 'Scapia Coins',
    isCash: false,
    confidence: 'unverified',
    warning: 'Coin-to-rupee conversion is unverified — some sources suggest coins are worth 5x less than this app currently assumes. Figures below use the old 1-coin-≈-₹1 assumption and may be overstated. Confirm with Scapia before relying on this.',
  },
  style: {
    color: '#1B7A72',
    initials: 'SP',
  },
});
