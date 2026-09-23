import { fmtMoney } from './format';
import { yearSpendOnCard } from './ledger';
import { rankCardsFor, type Ranked } from './rewards';
import type { Card } from './card';
import type { PlannedPurchase, Transaction } from './types';

export interface PlanInsight {
  ranked: Ranked[];
  top: Ranked | undefined;
  // Plain-English nudges: EMI, forex, fee-waiver and milestone-tier thresholds.
  extras: string[];
}

export function planInsight(p: PlannedPurchase, held: readonly Card[], transactions: readonly Transaction[], now: Date = new Date()): PlanInsight {
  const ranked = rankCardsFor(held, p.cat, p.amt);
  const top = ranked[0];
  const extras: string[] = [];
  if (!top) return { ranked, top, extras };

  if (p.amt >= 20000) extras.push("Large enough to consider EMI if you'd rather spread the cost — Log & Audit lets you mark that.");
  if (p.cat === 'forex' || p.cat === 'travel') extras.push('Check forex markup and lounge access on this card before you travel.');

  const card = top.card;
  const yearSpend = yearSpendOnCard(transactions, card.id, now.getFullYear());
  const projected = yearSpend + p.amt;
  if (card.waiverTarget && yearSpend < card.waiverTarget && projected >= card.waiverTarget) {
    extras.push(`Would push ${card.name} past its ${fmtMoney(card.waiverTarget)} fee-waiver threshold for the year.`);
  }
  for (const tier of card.tiers ?? []) {
    if (yearSpend < tier.target && projected >= tier.target) {
      extras.push(`Would move ${card.name} into ${tier.label} for the year.`);
    }
  }
  return { ranked, top, extras };
}
