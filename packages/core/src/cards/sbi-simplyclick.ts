import { defineCard } from '../card';

export default defineCard({
  id: 'sbi-simplyclick',
  name: 'SBI SimplyCLICK',
  type: 'Rewards',
  fee: '₹499+GST (waived ≥ ₹1L/yr)',
  forexRate: '3.5%',
  verified: '2026-09-22',
  upi: false,
  waiverTarget: 100000,
  rates: { fuel: 0.25, upi: 0, amazon: 2.5, ecommerce: 2.5, dining: 0.25, grocery: 0.25, travel: 0.25, forex: 0.25, utilities: 0.25, other: 0.25 },
  note: '10X Reward Points (2.5% effective) on named online partners — BookMyShow, Apollo 24|7, Domino\'s, IGP, Myntra, Yatra, Netmeds, Cleartrip, Swiggy, GyFTR, Tata CLiQ (worth confirming Amazon\'s current inclusion directly with SBI — this app treats Amazon as part of the 10X tier). 5X (1.25%) on other online spend generally, capped at 10,000 points/month on that tier. 1X (0.25%) offline. Point value ₹0.25 via statement credit.',
  redeem: 'Points redeemable as vouchers or statement credit — limited transfer options.',
  benefits: [
    'Welcome e-voucher on activation',
    '1% fuel surcharge waiver',
    'Renewal bonus voucher each year',
  ],
  reward: {
    unit: 'Reward Points',
    isCash: false,
    unitValue: 0.25,
    confidence: 'medium',
    perCategory: { fuel: 1, upi: 0, amazon: 10, ecommerce: 10, dining: 1, grocery: 1, travel: 1, forex: 1, utilities: 1, other: 1 },
    valueNote: '1 Reward Point ≈ ₹0.25 via statement credit.',
    capNote: 'The 5X general-online tier is capped at 10,000 points/month.',
  },
  style: {
    color: '#2E6DA4',
    initials: 'SS',
  },
});
