-- Cardpare — Supabase schema
--
-- Run this once in the Supabase dashboard: Project → SQL Editor → New query →
-- paste this whole file → Run. It's safe to re-run (uses IF NOT EXISTS / OR REPLACE
-- throughout), so if something fails partway through, fix the error and run it again.
--
-- This creates every table, security rule, and function the app needs. Nothing
-- here can be done from application code — Supabase deliberately requires an
-- account owner to run schema changes from the dashboard, not from a public API key.

-- ============================================================================
-- TABLES
-- ============================================================================

-- One row per signed-up user, created automatically on sign-up (see trigger below).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  monthly_limit numeric,
  created_at timestamptz not null default now()
);

-- Which cards a user holds (mirrors the app's "My Cards" tab).
create table if not exists public.user_cards (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, card_id)
);

-- Logged spend (mirrors the app's "Log & Audit" tab).
create table if not exists public.transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz not null,
  cat text not null,
  card_id text not null,
  amt numeric not null,
  note text,
  emi boolean not null default false,
  tenure int not null default 1,
  created_at timestamptz not null default now()
);

-- Future/planned purchases (mirrors the "Plan" tab's future-purchase list).
-- Not called out explicitly in the original table list, but needed so the
-- "import my local data" step (requirement 3) has somewhere to put plannedPurchases.
create table if not exists public.planned_purchases (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  cat text not null,
  amt numeric not null,
  month text,
  created_at timestamptz not null default now()
);

-- Requests for cards not yet in CARD_DB. No user_id — like the old localStorage
-- version, this is intentionally anonymous/shared, not tied to an account.
create table if not exists public.card_requests (
  id bigint generated always as identity primary key,
  name text not null,
  note text,
  votes int not null default 1,
  created_at timestamptz not null default now()
);

-- Early-access email signups from the landing page.
create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- AUTO-CREATE A PROFILE ROW ON SIGN-UP
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- VOTE COUNTER (runs as a function so anon visitors can increment/decrement a
-- vote without being granted a general UPDATE on card_requests)
-- ============================================================================

create or replace function public.adjust_card_request_votes(request_id bigint, delta int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.card_requests
  set votes = greatest(0, votes + delta)
  where id = request_id;
end;
$$;

grant execute on function public.adjust_card_request_votes(bigint, int) to anon, authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Everything is locked down by default. Each table gets narrow, explicit
-- policies — a signed-in user can only ever see/change their own rows, except
-- the two admin policies below, which check the JWT email directly rather
-- than trusting anything the client sends.

alter table public.profiles enable row level security;
alter table public.user_cards enable row level security;
alter table public.transactions enable row level security;
alter table public.planned_purchases enable row level security;
alter table public.card_requests enable row level security;
alter table public.waitlist enable row level security;

-- profiles: a user can read/update only their own row.
drop policy if exists "profiles: own row" on public.profiles;
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- profiles: the admin can read every row (for the "total signed-up users" count).
drop policy if exists "profiles: admin read all" on public.profiles;
create policy "profiles: admin read all" on public.profiles
  for select using (auth.jwt() ->> 'email' = 'abhirup.bhadra02@gmail.com');

-- user_cards: a user can read/write only their own rows.
drop policy if exists "user_cards: own rows" on public.user_cards;
create policy "user_cards: own rows" on public.user_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_cards: the admin can read every row (for "most-held cards").
drop policy if exists "user_cards: admin read all" on public.user_cards;
create policy "user_cards: admin read all" on public.user_cards
  for select using (auth.jwt() ->> 'email' = 'abhirup.bhadra02@gmail.com');

-- transactions: a user can read/write only their own rows.
drop policy if exists "transactions: own rows" on public.transactions;
create policy "transactions: own rows" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- transactions: the admin can read every row (for "transactions logged this week").
-- Note this is a count only in the admin page — the admin can technically read
-- full rows via the API, same as any table owner can via the dashboard, but the
-- app itself only ever asks for a count, never per-user detail.
drop policy if exists "transactions: admin read all" on public.transactions;
create policy "transactions: admin read all" on public.transactions
  for select using (auth.jwt() ->> 'email' = 'abhirup.bhadra02@gmail.com');

-- planned_purchases: a user can read/write only their own rows.
drop policy if exists "planned_purchases: own rows" on public.planned_purchases;
create policy "planned_purchases: own rows" on public.planned_purchases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- card_requests: anyone (signed in or not) can read and submit a request —
-- this list is intentionally public, same as the old shared-localStorage version.
drop policy if exists "card_requests: public read" on public.card_requests;
create policy "card_requests: public read" on public.card_requests
  for select using (true);
drop policy if exists "card_requests: public insert" on public.card_requests;
create policy "card_requests: public insert" on public.card_requests
  for insert with check (name is not null and length(trim(name)) > 0);
-- No update/delete policy: votes can only change via adjust_card_request_votes()
-- above, so a visitor can't edit someone else's request text or vote count directly.

-- waitlist: anyone can sign up, but only the admin can read the list back
-- (it's an email list — no reason to expose it publicly).
drop policy if exists "waitlist: public insert" on public.waitlist;
create policy "waitlist: public insert" on public.waitlist
  for insert with check (email is not null and position('@' in email) > 1);
drop policy if exists "waitlist: admin read" on public.waitlist;
create policy "waitlist: admin read" on public.waitlist
  for select using (auth.jwt() ->> 'email' = 'abhirup.bhadra02@gmail.com');

-- ============================================================================
-- ADMIN: SIGN-UP COUNT (also shipped as migrations/2026-09-23_admin_user_count.sql)
-- ============================================================================
-- Counts auth.users directly so the admin number can't drift from reality.
-- Only the admin email may call it.

create or replace function public.admin_user_count()
returns bigint
language plpgsql
security definer set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'email', '') <> 'abhirup.bhadra02@gmail.com' then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  return (select count(*) from auth.users);
end;
$$;

revoke all on function public.admin_user_count() from public, anon;
grant execute on function public.admin_user_count() to authenticated;
