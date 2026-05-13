-- Optional: mirror auth.users.last_sign_in_at into public.profiles for dashboard / Security UI.
-- Requires permission to create triggers on auth.users (Supabase default allows this in SQL editor).

create or replace function public.sync_profile_last_sign_in()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set last_sign_in_at = new.last_sign_in_at, updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_last_sign_in on auth.users;
create trigger on_auth_user_last_sign_in
  after update of last_sign_in_at on auth.users
  for each row
  when (old.last_sign_in_at is distinct from new.last_sign_in_at)
  execute function public.sync_profile_last_sign_in();
