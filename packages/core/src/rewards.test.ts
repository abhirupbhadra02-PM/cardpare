import { describe, expect, it } from 'vitest';
import { getCard, heldCardObjects } from './catalog';
import { computeMonthlySummary, expandRowsForMonth } from './ledger';
import { planInsight } from './plan';
import { rankCardsFor, rewardFor, verdictFor } from './rewards';
import type { Transaction } from './types';

const held = heldCardObjects(['hdfc-millennia', 'amazonpay-icici', 'axis-atlas', 'kiwi-rupay']);

function txn(p: Partial<Transaction>): Transaction {
  return { id: 1, date: '2026-01-10T00:00:00.000Z', cat: 'dining', cardId: 'hdfc-millennia', amt: 1000, note: '', emi: false, tenure: 1, ...p };
}

describe('ranking and verdicts', () => {
  it('ranks held cards by ₹ value for the category', () => {
    const ranked = rankCardsFor(held, 'amazon', 1000);
    expect(ranked[0].card.id).toBe('amazonpay-icici');
    expect(ranked[0].value).toBe(50);
  });

  it('only considers UPI-capable cards for UPI spend', () => {
    expect(rankCardsFor(held, 'upi', 1000).map((r) => r.card.id)).toEqual(['kiwi-rupay']);
  });

  it('reports the gap when a worse card was used', () => {
    const v = verdictFor(held, 'amazon', 'hdfc-millennia', 1000)!;
    expect(v.isMiss).toBe(true);
    expect(v.usedValue).toBe(10);
    expect(v.gap).toBe(40);
    expect(verdictFor(held, 'amazon', 'amazonpay-icici', 1000)!.isMiss).toBe(false);
  });
});

describe('native reward units', () => {
  it('shows points in their own unit with a ₹ estimate', () => {
    expect(rewardFor(getCard('hdfc-millennia')!, 'dining', 2000)).toEqual({ kind: 'units', units: 100, unit: 'CashPoints', inrEstimate: 100 });
    expect(rewardFor(getCard('axis-atlas')!, 'travel', 10000)).toEqual({ kind: 'units', units: 500, unit: 'EDGE Miles', inrEstimate: 250 });
  });

  it('shows cashback as rupees', () => {
    expect(rewardFor(getCard('amazonpay-icici')!, 'amazon', 1000)).toEqual({ kind: 'cash', inr: 50 });
  });

  it('falls back to rupees when the unit conversion is unverified', () => {
    expect(rewardFor(getCard('scapia')!, 'travel', 1000)).toEqual({ kind: 'cash', inr: 50 });
  });
});

describe('monthly ledger (EMI-aware)', () => {
  const emi = txn({ amt: 12000, emi: true, tenure: 3, cat: 'ecommerce' });

  it('spreads EMI spend across months but books the reward once', () => {
    const jan = expandRowsForMonth([emi], new Date(2026, 0, 15));
    expect(jan).toMatchObject([{ displayAmt: 4000, isFirstMonth: true }]);
    expect(expandRowsForMonth([emi], new Date(2026, 1, 15))).toMatchObject([{ displayAmt: 4000, isFirstMonth: false }]);
    expect(expandRowsForMonth([emi], new Date(2026, 3, 15))).toEqual([]);
  });

  it('summarises spend, earned and missed for the month', () => {
    const s = computeMonthlySummary([emi, txn({ id: 2, cat: 'amazon', amt: 1000 })], held, new Date(2026, 0, 20));
    expect(s.totalSpend).toBe(5000);
    expect(s.totalEarned).toBe(600 + 10);
    expect(s.totalMissed).toBe(40);
    expect(s.anyMiss).toBe(true);
    expect(s.byCard).toHaveLength(1);
    expect(s.byCard[0].units).toBe(600 + 10);

    const feb = computeMonthlySummary([emi], held, new Date(2026, 1, 20));
    expect(feb.totalSpend).toBe(4000);
    expect(feb.totalEarned).toBe(0);
  });
});

describe('future purchase planning', () => {
  it('flags crossing a fee-waiver threshold', () => {
    const spent = txn({ amt: 90000, cat: 'other', date: '2026-02-01T00:00:00.000Z' });
    const insight = planInsight({ id: 9, name: 'Laptop', cat: 'dining', amt: 20000, month: '2026-05' }, held, [spent], new Date(2026, 3, 1));
    expect(insight.top?.card.id).toBe('hdfc-millennia');
    expect(insight.extras).toContain('Would push HDFC Millennia past its ₹1,00,000 fee-waiver threshold for the year.');
  });
});
