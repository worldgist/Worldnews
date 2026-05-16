-- Per-admin user profiles linked to Supabase Auth (replaces cms_config.profile JSON blob).

create table if not exists public.admin_user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'Editor',
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_user_profiles_full_name_len check (char_length(full_name) between 1 and 200),
  constraint admin_user_profiles_email_len check (char_length(email) between 3 and 320),
  constraint admin_user_profiles_email_format check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  constraint admin_user_profiles_role_len check (char_length(role) between 1 and 120),
  constraint admin_user_profiles_bio_len check (char_length(bio) <= 4000)
);

create index if not exists idx_admin_user_profiles_email_lower
  on public.admin_user_profiles (lower(email));

drop trigger if exists admin_user_profiles_set_updated_at on public.admin_user_profiles;
create trigger admin_user_profiles_set_updated_at
  before update on public.admin_user_profiles
  for each row
  execute function public.set_updated_at();

alter table public.admin_user_profiles enable row level security;

drop policy if exists "Admins read own profile" on public.admin_user_profiles;
drop policy if exists "Admins insert own profile" on public.admin_user_profiles;
drop policy if exists "Admins update own profile" on public.admin_user_profiles;

create policy "Admins read own profile"
  on public.admin_user_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins insert own profile"
  on public.admin_user_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Admins update own profile"
  on public.admin_user_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create a profile row when a new auth user signs up.
create or replace function public.handle_new_admin_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_user_profiles (user_id, full_name, email, role, bio)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(coalesce(new.email, ''), '@', 1), 'Admin User'),
    coalesce(nullif(trim(new.email), ''), new.id::text || '@users.local'),
    coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'Editor'),
    coalesce(nullif(trim(new.raw_user_meta_data->>'bio'), ''), '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_admin_profile on auth.users;
create trigger on_auth_user_created_admin_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_admin_user_profile();

grant select, insert, update on table public.admin_user_profiles to authenticated;
