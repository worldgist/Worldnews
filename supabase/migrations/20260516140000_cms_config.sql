-- Site-wide CMS: settings, categories, profile (one row) + admin posts
-- Public can read config for the live site; only authenticated editors can write.

create table if not exists public.cms_config (
  id text primary key default 'primary',
  settings jsonb not null default '{}',
  categories jsonb not null default '[]',
  profile jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  constraint cms_config_singleton check (id = 'primary')
);

insert into public.cms_config (id) values ('primary')
on conflict (id) do nothing;

alter table public.cms_config enable row level security;

create policy "Anyone can read cms config"
  on public.cms_config for select
  to anon, authenticated
  using (id = 'primary');

create policy "Editors can insert cms config"
  on public.cms_config for insert
  to authenticated
  with check (id = 'primary');

create policy "Editors can update cms config"
  on public.cms_config for update
  to authenticated
  using (id = 'primary')
  with check (id = 'primary');

create table if not exists public.cms_posts (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  constraint cms_posts_payload_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists idx_cms_posts_updated on public.cms_posts (updated_at desc);

alter table public.cms_posts enable row level security;

create policy "Public read published cms posts"
  on public.cms_posts for select
  to anon
  using (
    coalesce(payload->>'status', 'published') = 'published'
    or (
      payload->>'status' = 'scheduled'
      and (payload->>'scheduledFor') is not null
      and (payload->>'scheduledFor')::timestamptz <= now()
    )
  );

create policy "Editors manage cms posts"
  on public.cms_posts for all
  to authenticated
  using (true)
  with check (true);
