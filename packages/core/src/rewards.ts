import type { CategoryId } from './categories';
import { getCard } from './catalog';
import type { Card } from './card';

export interface Ranked {
  card: Card;
  // Estimated ₹ value of the reward for this purchase.
  value: number;
}

// Best-first. UPI spend only considers UPI-capable (RuPay) cards.
export function rankCardsFor(held: readonly Card[], cat: CategoryId, amt: number): Ranked[] {
  const pool = cat === 'upi' ? held.filter((c) => c.upi) : held;
  return pool
    .map((card) => ({ card, value: ((card.rates[cat] || 0) / 100) * amt }))
    .sort((a, b) => b.value - a.value);
}

export interface Verdict {
  cardUsed: Card;
  best: Ranked | undefined;
  usedValue: number;
  isMiss: boolean;
  gap: number;
}

export function verdictFor(held: readonly Card[], cat: CategoryId, cardId: string, amt: number): Verdict | null {
  const cardUsed = getCard(cardId);
  if (!cardUsed) return null;
  const best = rankCardsFor(held, cat, amt)[0];
  const usedValue = ((cardUsed.rates[cat] || 0) / 100) * amt;
  const isMiss = !!best && best.card.id !== cardUsed.id && best.value > usedValue;
  return { cardUsed, best, usedValue, isMiss, gap: isMiss && best ? best.value - usedValue : 0 };
}

// Native reward units (points/miles/cashback ₹) for a purchase, or null when the
// card has no confirmed per-category unit data.
export function nativeUnitsFor(card: Card, cat: CategoryId, amt: number): number | null {
  const per = card.reward.perCategory;
  if (!per) return null;
  return ((per[cat] || 0) / 100) * amt;
}

export type RewardAmount =
  | { kind: 'cash'; inr: number }
  | { kind: 'units'; units: number; unit: string; inrEstimate: number | null };

// What a purchase actually pays out, in the card's own unit where we have it.
export function rewardFor(card: Card, cat: CategoryId, amt: number): RewardAmount {
  const r = card.reward;
  if (r.isCash || !r.perCategory) return { kind: 'cash', inr: ((card.rates[cat] || 0) / 100) * amt };
  const units = nativeUnitsFor(card, cat, amt) ?? 0;
  return { kind: 'units', units, unit: r.unit, inrEstimate: r.unitValue !== undefined ? units * r.unitValue : null };
}

// Same, but for a total of units already summed across purchases on one card.
export function rewardForUnits(card: Card, units: number, earnedInr: number): RewardAmount {
  const r = card.reward;
  if (r.isCash || !r.perCategory) return { kind: 'cash', inr: earnedInr };
  return { kind: 'units', units, unit: r.unit, inrEstimate: r.unitValue !== undefined ? units * r.unitValue : null };
}
