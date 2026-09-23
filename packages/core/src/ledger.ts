import { categoryLabel } from './categories';
import { getCard } from './catalog';
import { nativeUnitsFor, verdictFor } from './rewards';
import type { Card } from './card';
import type { Transaction } from './types';

export function monthIndex(d: Date): number {
  return d.getFullYear() * 12 + d.getMonth();
}

export interface MonthRow extends Transaction {
  // What counts toward this month's spend (the monthly slice for EMI).
  displayAmt: number;
  // The reward is booked once, in the purchase month, on the full amount.
  isFirstMonth: boolean;
}

export function expandRowsForMonth(transactions: readonly Transaction[], monthDate: Date): MonthRow[] {
  const mi = monthIndex(monthDate);
  const rows: MonthRow[] = [];
  for (const t of transactions) {
    const pmi = monthIndex(new Date(t.date));
    if (!t.emi || t.tenure <= 1) {
      if (pmi === mi) rows.push({ ...t, displayAmt: t.amt, isFirstMonth: true });
    } else {
      const offset = mi - pmi;
      if (offset >= 0 && offset < t.tenure) rows.push({ ...t, displayAmt: t.amt / t.tenure, isFirstMonth: offset === 0 });
    }
  }
  return rows;
}

export interface CardMonth {
  card: Card;
  spend: number;
  earned: number;
  // Sum of native reward units (only meaningful for non-cash cards with unit data).
  units: number;
}

export interface EarnedRow {
  catLabel: string;
  cat: Transaction['cat'];
  card: Card;
  amt: number;
  earned: number;
}

export interface MonthlySummary {
  totalSpend: number;
  totalEarned: number;
  totalMissed: number;
  // In order of first appearance this month.
  byCard: CardMonth[];
  anyMiss: boolean;
  anyLogged: boolean;
  earnedRows: EarnedRow[];
}

export function computeMonthlySummary(transactions: readonly Transaction[], held: readonly Card[], now: Date = new Date()): MonthlySummary {
  const rows = expandRowsForMonth(transactions, now);
  let totalSpend = 0, totalEarned = 0, totalMissed = 0, anyMiss = false;
  const byCard = new Map<string, CardMonth>();
  const earnedRows: EarnedRow[] = [];

  for (const row of rows) {
    totalSpend += row.displayAmt;
    const card = getCard(row.cardId);
    if (!card) continue;
    let entry = byCard.get(card.id);
    if (!entry) { entry = { card, spend: 0, earned: 0, units: 0 }; byCard.set(card.id, entry); }
    entry.spend += row.displayAmt;
    if (!row.isFirstMonth) continue;
    const v = verdictFor(held, row.cat, row.cardId, row.amt);
    if (!v) continue;
    totalEarned += v.usedValue;
    entry.earned += v.usedValue;
    const units = nativeUnitsFor(card, row.cat, row.amt);
    if (units !== null) entry.units += units;
    if (v.isMiss) { totalMissed += v.gap; anyMiss = true; }
    if (v.usedValue > 0) {
      earnedRows.push({ catLabel: categoryLabel(row.cat), cat: row.cat, card, amt: row.amt, earned: v.usedValue });
    }
  }

  return { totalSpend, totalEarned, totalMissed, byCard: [...byCard.values()], anyMiss, anyLogged: rows.length > 0, earnedRows };
}

export function yearSpendOnCard(transactions: readonly Transaction[], cardId: string, year: number): number {
  return transactions
    .filter((t) => t.cardId === cardId && new Date(t.date).getFullYear() === year)
    .reduce((s, t) => s + t.amt, 0);
}
