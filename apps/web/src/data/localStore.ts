import type { UserData } from '@cardpare/core';

// Same keys the original single-file app used, so anyone's existing signed-out
// data carries straight over to this version.
const KEYS = {
  heldCards: 'cardpare:heldCards',
  transactions: 'cardpare:transactions',
  plannedPurchases: 'cardpare:plannedPurchases',
  monthlyLimit: 'cardpare:monthlyLimit',
  myVotes: 'cardpare:myVotes',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode) — the in-memory state still works for this visit.
  }
}

export const localStore = {
  load(): UserData {
    return {
      heldCards: read<string[]>(KEYS.heldCards, []),
      transactions: read<UserData['transactions']>(KEYS.transactions, []).map((t) => ({
        ...t, note: t.note ?? '', emi: !!t.emi, tenure: t.tenure || 1,
      })),
      plannedPurchases: read<UserData['plannedPurchases']>(KEYS.plannedPurchases, []).map((p) => ({ ...p, month: p.month || null })),
      monthlyLimit: read<number | null>(KEYS.monthlyLimit, null),
    };
  },
  saveHeldCards: (v: string[]) => write(KEYS.heldCards, v),
  saveTransactions: (v: UserData['transactions']) => write(KEYS.transactions, v),
  savePlanned: (v: UserData['plannedPurchases']) => write(KEYS.plannedPurchases, v),
  saveLimit: (v: number | null) => write(KEYS.monthlyLimit, v),
  loadVotes: () => read<number[]>(KEYS.myVotes, []),
  saveVotes: (v: number[]) => write(KEYS.myVotes, v),
};
