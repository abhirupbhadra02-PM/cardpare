import type { CategoryId } from './categories';

export interface Transaction {
  id: number;
  // ISO timestamp of the purchase date.
  date: string;
  cat: CategoryId;
  cardId: string;
  // Full purchase amount in ₹ (for EMI, the total, not the monthly slice).
  amt: number;
  note: string;
  emi: boolean;
  tenure: number;
}

export interface PlannedPurchase {
  id: number;
  name: string;
  cat: CategoryId;
  amt: number;
  // 'YYYY-MM', optional.
  month: string | null;
}

export interface CardRequest {
  id: number;
  name: string;
  note: string;
  votes: number;
}
