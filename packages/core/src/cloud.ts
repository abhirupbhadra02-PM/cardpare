// All Supabase reads/writes in one place, platform-neutral so the web app and a
// future mobile app share them. Writes throw on failure; callers decide how to surface it.
import { createClient, type SupabaseClient, type SupabaseClientOptions, type User } from '@supabase/supabase-js';
import type { CategoryId } from './categories';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config';
import type { CardRequest, PlannedPurchase, Transaction } from './types';

export function createCardpareClient(options?: SupabaseClientOptions<'public'>): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, options);
}

export interface UserData {
  heldCards: string[];
  transactions: Transaction[];
  plannedPurchases: PlannedPurchase[];
  monthlyLimit: number | null;
}

function check<T extends { error: unknown }>(res: T): T {
  if (res.error) throw res.error;
  return res;
}

interface TransactionRow {
  id: number; date: string; cat: string; card_id: string; amt: number | string;
  note: string | null; emi: boolean; tenure: number;
}
interface PlannedRow { id: number; name: string; cat: string; amt: number | string; month: string | null }

function toTransaction(r: TransactionRow): Transaction {
  return {
    id: Number(r.id), date: r.date, cat: r.cat as CategoryId, cardId: r.card_id, amt: Number(r.amt),
    note: r.note ?? '', emi: r.emi, tenure: r.tenure,
  };
}
function toPlanned(r: PlannedRow): PlannedPurchase {
  return { id: Number(r.id), name: r.name, cat: r.cat as CategoryId, amt: Number(r.amt), month: r.month };
}

// Accounts created before the profile trigger existed have no profile row; create it.
export async function ensureProfile(sb: SupabaseClient, user: User): Promise<void> {
  check(await sb.from('profiles').upsert({ id: user.id, email: user.email ?? '' }, { onConflict: 'id', ignoreDuplicates: true }));
}

export async function loadUserData(sb: SupabaseClient, userId: string): Promise<UserData> {
  const [cards, txns, planned, profile] = await Promise.all([
    sb.from('user_cards').select('card_id').eq('user_id', userId),
    sb.from('transactions').select('*').eq('user_id', userId),
    sb.from('planned_purchases').select('*').eq('user_id', userId),
    sb.from('profiles').select('monthly_limit').eq('id', userId).maybeSingle(),
  ]);
  check(cards); check(txns); check(planned); check(profile);
  return {
    heldCards: (cards.data ?? []).map((r: { card_id: string }) => r.card_id),
    transactions: ((txns.data ?? []) as TransactionRow[]).map(toTransaction),
    plannedPurchases: ((planned.data ?? []) as PlannedRow[]).map(toPlanned),
    monthlyLimit: profile.data?.monthly_limit != null ? Number(profile.data.monthly_limit) : null,
  };
}

export async function hasAnyCloudData(sb: SupabaseClient, userId: string): Promise<boolean> {
  const counts = await Promise.all(
    ['user_cards', 'transactions', 'planned_purchases'].map((t) =>
      sb.from(t).select('id', { count: 'exact', head: true }).eq('user_id', userId),
    ),
  );
  counts.forEach(check);
  return counts.some((c) => (c.count ?? 0) > 0);
}

export async function importToCloud(sb: SupabaseClient, userId: string, data: UserData): Promise<void> {
  const jobs: PromiseLike<{ error: unknown }>[] = [];
  if (data.heldCards.length) jobs.push(sb.from('user_cards').insert(data.heldCards.map((card_id) => ({ user_id: userId, card_id }))));
  if (data.transactions.length) {
    jobs.push(sb.from('transactions').insert(data.transactions.map((t) => ({
      user_id: userId, date: t.date, cat: t.cat, card_id: t.cardId, amt: t.amt, note: t.note || null, emi: !!t.emi, tenure: t.tenure || 1,
    }))));
  }
  if (data.plannedPurchases.length) {
    jobs.push(sb.from('planned_purchases').insert(data.plannedPurchases.map((p) => ({
      user_id: userId, name: p.name, cat: p.cat, amt: p.amt, month: p.month || null,
    }))));
  }
  if (data.monthlyLimit) jobs.push(sb.from('profiles').update({ monthly_limit: data.monthlyLimit }).eq('id', userId));
  (await Promise.all(jobs)).forEach(check);
}

export async function addHeldCard(sb: SupabaseClient, userId: string, cardId: string): Promise<void> {
  check(await sb.from('user_cards').insert({ user_id: userId, card_id: cardId }));
}
export async function removeHeldCard(sb: SupabaseClient, userId: string, cardId: string): Promise<void> {
  check(await sb.from('user_cards').delete().eq('user_id', userId).eq('card_id', cardId));
}

export async function insertTransaction(sb: SupabaseClient, userId: string, t: Omit<Transaction, 'id'>): Promise<Transaction> {
  const res = check(await sb.from('transactions').insert({
    user_id: userId, date: t.date, cat: t.cat, card_id: t.cardId, amt: t.amt, note: t.note || null, emi: t.emi, tenure: t.tenure,
  }).select().single());
  return toTransaction(res.data as TransactionRow);
}
export async function deleteTransaction(sb: SupabaseClient, userId: string, id: number): Promise<void> {
  check(await sb.from('transactions').delete().eq('id', id).eq('user_id', userId));
}

export async function insertPlanned(sb: SupabaseClient, userId: string, p: Omit<PlannedPurchase, 'id'>): Promise<PlannedPurchase> {
  const res = check(await sb.from('planned_purchases').insert({
    user_id: userId, name: p.name, cat: p.cat, amt: p.amt, month: p.month || null,
  }).select().single());
  return toPlanned(res.data as PlannedRow);
}
export async function deletePlanned(sb: SupabaseClient, userId: string, id: number): Promise<void> {
  check(await sb.from('planned_purchases').delete().eq('id', id).eq('user_id', userId));
}

export async function setMonthlyLimit(sb: SupabaseClient, userId: string, limit: number | null): Promise<void> {
  check(await sb.from('profiles').update({ monthly_limit: limit }).eq('id', userId));
}

export async function loadCardRequests(sb: SupabaseClient): Promise<CardRequest[]> {
  const res = check(await sb.from('card_requests').select('*').order('votes', { ascending: false }));
  return (res.data ?? []).map((r: { id: number; name: string; note: string | null; votes: number }) => ({
    id: Number(r.id), name: r.name, note: r.note ?? '', votes: r.votes,
  }));
}
export async function insertCardRequest(sb: SupabaseClient, name: string, note: string): Promise<CardRequest> {
  const res = check(await sb.from('card_requests').insert({ name, note: note || null }).select().single());
  const r = res.data as { id: number; votes: number };
  return { id: Number(r.id), name, note, votes: r.votes };
}
export async function adjustCardRequestVotes(sb: SupabaseClient, requestId: number, delta: 1 | -1): Promise<void> {
  check(await sb.rpc('adjust_card_request_votes', { request_id: requestId, delta }));
}

// A repeat signup hits the unique constraint; that's fine — they're already on the list.
export async function joinWaitlist(sb: SupabaseClient, email: string): Promise<void> {
  const res = await sb.from('waitlist').insert({ email });
  if (res.error && res.error.code !== '23505') throw res.error;
}

export interface AdminStats {
  users: number | null;
  waitlist: number | null;
  transactionsThisWeek: number | null;
  mostHeld: { cardId: string; count: number }[];
  requests: CardRequest[];
}

export async function loadAdminStats(sb: SupabaseClient, now: Date = new Date()): Promise<AdminStats> {
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [usersRpc, waitlist, txnsWeek, cards, requests] = await Promise.all([
    sb.rpc('admin_user_count'),
    sb.from('waitlist').select('id', { count: 'exact', head: true }),
    sb.from('transactions').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    sb.from('user_cards').select('card_id'),
    loadCardRequests(sb),
  ]);
  // Fall back to counting profile rows if the admin_user_count migration hasn't been run yet.
  let users: number | null = usersRpc.error ? null : Number(usersRpc.data);
  if (users === null) {
    const profiles = await sb.from('profiles').select('id', { count: 'exact', head: true });
    users = profiles.error ? null : profiles.count;
  }
  const tally = new Map<string, number>();
  for (const r of (cards.data ?? []) as { card_id: string }[]) tally.set(r.card_id, (tally.get(r.card_id) ?? 0) + 1);
  return {
    users,
    waitlist: waitlist.error ? null : waitlist.count,
    transactionsThisWeek: txnsWeek.error ? null : txnsWeek.count,
    mostHeld: [...tally.entries()].map(([cardId, count]) => ({ cardId, count })).sort((a, b) => b.count - a.count),
    requests,
  };
}
