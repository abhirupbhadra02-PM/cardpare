-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- 1) Fixes the admin page showing 0 signed-up users: accounts created before
--    schema.sql was run never got a profiles row (the trigger didn't exist yet).
--    This backfills them.
insert into public.profiles (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

-- 2) Counts sign-ups from auth.users itself, so the admin number can't drift from
--    reality even if a profile row is ever missing. Only the admin email may call it;
--    anyone else gets an error, not a number.
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
