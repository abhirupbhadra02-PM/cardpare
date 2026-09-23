import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  addHeldCard, adjustCardRequestVotes, deletePlanned, deleteTransaction, hasAnyCloudData, heldCardObjects,
  importToCloud, insertCardRequest, insertPlanned, insertTransaction, loadCardRequests, loadUserData,
  removeHeldCard, setMonthlyLimit, type Card, type CardRequest, type PlannedPurchase, type Transaction, type UserData,
} from '@cardpare/core';
import { useAuth } from '../auth/AuthProvider';
import { sb } from '../lib/supabase';
import { localStore } from './localStore';

// Signed out: everything lives in this browser (localStore), exactly as before accounts existed.
// Signed in: the same state is loaded from and written to Supabase instead.
type Mode = 'local' | 'cloud';

interface AppData extends UserData {
  mode: Mode;
  held: Card[];
  cardRequests: CardRequest[];
  myVotes: number[];
  // Set on first sign-in when this browser has data and the account has none.
  importPrompt: { cards: number; transactions: number } | null;
  error: string | null;
  clearError: () => void;
  resolveImport: (bringLocalData: boolean) => Promise<void>;
  toggleCard: (id: string) => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<boolean>;
  removeTransaction: (id: number) => Promise<void>;
  addPlanned: (p: Omit<PlannedPurchase, 'id'>) => Promise<boolean>;
  removePlanned: (id: number) => Promise<void>;
  saveLimit: (limit: number | null) => Promise<void>;
  requestCard: (name: string, note: string) => Promise<boolean>;
  toggleVote: (id: number) => Promise<void>;
}

const Ctx = createContext<AppData | null>(null);
const SAVE_FAILED = "Couldn't save that to your account — check your connection and try again.";

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const [data, setData] = useState<UserData>(() => localStore.load());
  const [mode, setMode] = useState<Mode>('local');
  const [cardRequests, setCardRequests] = useState<CardRequest[]>([]);
  const [myVotes, setMyVotes] = useState<number[]>(() => localStore.loadVotes());
  const [importPrompt, setImportPrompt] = useState<AppData['importPrompt']>(null);
  const [error, setError] = useState<string | null>(null);
  const handledUser = useRef<string | null>(null);

  useEffect(() => {
    loadCardRequests(sb).then(setCardRequests).catch((e) => console.error('loadCardRequests', e));
  }, []);

  // Switch data source when the signed-in user changes.
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      if (handledUser.current !== null) {
        handledUser.current = null;
        setMode('local');
        setImportPrompt(null);
        setData(localStore.load());
      }
      return;
    }
    if (handledUser.current === user.id) return;
    handledUser.current = user.id;
    (async () => {
      try {
        const local = localStore.load();
        const hasLocal = local.heldCards.length > 0 || local.transactions.length > 0 || local.plannedPurchases.length > 0;
        if (hasLocal && !(await hasAnyCloudData(sb, user.id))) {
          setImportPrompt({ cards: local.heldCards.length, transactions: local.transactions.length });
          return;
        }
        setData(await loadUserData(sb, user.id));
        setMode('cloud');
      } catch (e) {
        console.error('load account data', e);
        setError("Couldn't load your account data — showing what's saved on this device.");
      }
    })();
  }, [user, ready]);

  const resolveImport = useCallback(async (bringLocalData: boolean) => {
    if (!user) return;
    setImportPrompt(null);
    try {
      if (bringLocalData) await importToCloud(sb, user.id, localStore.load());
      setData(await loadUserData(sb, user.id));
      setMode('cloud');
    } catch (e) {
      console.error('import', e);
      setError("Couldn't finish bringing your data over — nothing on this device was changed. Try signing in again.");
    }
  }, [user]);

  const cloud = mode === 'cloud' && user ? user.id : null;

  const toggleCard = useCallback(async (id: string) => {
    const willHold = !data.heldCards.includes(id);
    const next = willHold ? [...data.heldCards, id] : data.heldCards.filter((x) => x !== id);
    setData((d) => ({ ...d, heldCards: next }));
    if (!cloud) { localStore.saveHeldCards(next); return; }
    try {
      await (willHold ? addHeldCard(sb, cloud, id) : removeHeldCard(sb, cloud, id));
    } catch (e) {
      console.error(e);
      setError(SAVE_FAILED);
      setData((d) => ({ ...d, heldCards: data.heldCards }));
    }
  }, [cloud, data.heldCards]);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id'>) => {
    if (!cloud) {
      const next = [...data.transactions, { ...t, id: Date.now() }];
      setData((d) => ({ ...d, transactions: next }));
      localStore.saveTransactions(next);
      return true;
    }
    try {
      const saved = await insertTransaction(sb, cloud, t);
      setData((d) => ({ ...d, transactions: [...d.transactions, saved] }));
      return true;
    } catch (e) {
      console.error(e);
      setError(SAVE_FAILED);
      return false;
    }
  }, [cloud, data.transactions]);

  const removeTransaction = useCallback(async (id: number) => {
    const next = data.transactions.filter((t) => t.id !== id);
    setData((d) => ({ ...d, transactions: next }));
    if (!cloud) { localStore.saveTransactions(next); return; }
    try { await deleteTransaction(sb, cloud, id); } catch (e) {
      console.error(e); setError(SAVE_FAILED); setData((d) => ({ ...d, transactions: data.transactions }));
    }
  }, [cloud, data.transactions]);

  const addPlanned = useCallback(async (p: Omit<PlannedPurchase, 'id'>) => {
    if (!cloud) {
      const next = [...data.plannedPurchases, { ...p, id: Date.now() }];
      setData((d) => ({ ...d, plannedPurchases: next }));
      localStore.savePlanned(next);
      return true;
    }
    try {
      const saved = await insertPlanned(sb, cloud, p);
      setData((d) => ({ ...d, plannedPurchases: [...d.plannedPurchases, saved] }));
      return true;
    } catch (e) {
      console.error(e); setError(SAVE_FAILED); return false;
    }
  }, [cloud, data.plannedPurchases]);

  const removePlanned = useCallback(async (id: number) => {
    const next = data.plannedPurchases.filter((p) => p.id !== id);
    setData((d) => ({ ...d, plannedPurchases: next }));
    if (!cloud) { localStore.savePlanned(next); return; }
    try { await deletePlanned(sb, cloud, id); } catch (e) {
      console.error(e); setError(SAVE_FAILED); setData((d) => ({ ...d, plannedPurchases: data.plannedPurchases }));
    }
  }, [cloud, data.plannedPurchases]);

  const saveLimit = useCallback(async (limit: number | null) => {
    const prev = data.monthlyLimit;
    setData((d) => ({ ...d, monthlyLimit: limit }));
    if (!cloud) { localStore.saveLimit(limit); return; }
    try { await setMonthlyLimit(sb, cloud, limit); } catch (e) {
      console.error(e); setError(SAVE_FAILED); setData((d) => ({ ...d, monthlyLimit: prev }));
    }
  }, [cloud, data.monthlyLimit]);

  // Card requests are one shared public board, whether or not you're signed in.
  const requestCard = useCallback(async (name: string, note: string) => {
    try {
      const saved = await insertCardRequest(sb, name, note);
      setCardRequests((rs) => [...rs, saved]);
      const votes = [...myVotes, saved.id];
      setMyVotes(votes); localStore.saveVotes(votes);
      return true;
    } catch (e) {
      console.error(e); setError("Couldn't send that request — check your connection and try again."); return false;
    }
  }, [myVotes]);

  const toggleVote = useCallback(async (id: number) => {
    const voting = !myVotes.includes(id);
    const delta = voting ? 1 : -1;
    const votes = voting ? [...myVotes, id] : myVotes.filter((v) => v !== id);
    setMyVotes(votes); localStore.saveVotes(votes);
    setCardRequests((rs) => rs.map((r) => (r.id === id ? { ...r, votes: Math.max(0, r.votes + delta) } : r)));
    try { await adjustCardRequestVotes(sb, id, delta); } catch (e) { console.error(e); }
  }, [myVotes]);

  const held = useMemo(() => heldCardObjects(data.heldCards), [data.heldCards]);

  const value: AppData = {
    ...data, mode, held, cardRequests, myVotes, importPrompt, error,
    clearError: () => setError(null),
    resolveImport, toggleCard, addTransaction, removeTransaction, addPlanned, removePlanned, saveLimit, requestCard, toggleVote,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
