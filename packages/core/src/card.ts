// The shape of one card entry. Deliberately free of the validation library so it
// doesn't ship to users' browsers — schema.ts enforces the rules at build time and
// fails the build if this type and the schema ever drift apart.
import type { CategoryId } from './categories';

export type PerCategory = Record<CategoryId, number>;

export interface Reward {
  unit: string;
  // true: the reward is rupees (cashback), so perCategory is a % and unitValue is 1.
  isCash: boolean;
  // ₹ value of one unit, for the redemption path described in valueNote.
  unitValue?: number;
  confidence: 'high' | 'medium' | 'unverified';
  // Units earned per ₹100 spent, by category.
  perCategory?: PerCategory;
  valueNote?: string;
  capNote?: string;
  // Shown as a warning banner in the Rewards tab. Required for unverified cards.
  warning?: string;
}

export interface Card {
  id: string;
  name: string;
  type: string;
  fee: string;
  forexRate: string;
  // When a human last checked this card's terms against the issuer (YYYY-MM-DD). Bump it on any change.
  verified: string;
  upi: boolean;
  waiverTarget: number | null;
  tiers?: { label: string; target: number }[];
  // Effective reward value as a % of spend, per category — used to rank cards.
  rates: PerCategory;
  note: string;
  redeem: string;
  benefits: string[];
  reward: Reward;
  style: { color: string; initials: string };
}

// Identity helper so each card file gets type-checking and autocomplete.
export function defineCard(card: Card): Card {
  return card;
}
