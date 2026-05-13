-- =============================================================================
-- SecureScope: profiles + RLS for Supabase Auth
-- Run in Supabase SQL Editor (Dashboard → SQL) or via Supabase CLI migrations.
-- =============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  disabled boolean not null default false,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (lower(email));

alter table public.profiles enable row level security;

-- -----------------------------------------------------------------------------
-- Policies: combine permissive SELECT / UPDATE (OR semantics per command).
-- -----------------------------------------------------------------------------

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.disabled = false
    )
  );

drop policy if exists "profiles_self_update_safe" on public.profiles;
create policy "profiles_self_update_safe"
  on public.profiles for update
  using (auth.uid() = id and disabled = false)
  with check (
    auth.uid() = id
    and role = (select pr.role from public.profiles pr where pr.id = id)
    and disabled = (select pr.disabled from public.profiles pr where pr.id = id)
  );

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.disabled = false
    )
  );

-- -----------------------------------------------------------------------------
-- Trigger: create profile row on signup (server-side, not from the browser).
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, plan)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    'viewer',
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- First admin (manual): after you sign up once, run (replace the UUID):
--   update public.profiles set role = 'admin' where id = '<your-auth-user-id>';
-- -----------------------------------------------------------------------------
