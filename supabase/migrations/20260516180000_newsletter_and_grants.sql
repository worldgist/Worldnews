-- Newsletter signups + updated_at triggers + PostgREST grants for all site tables.

-- ── Shared updated_at trigger ───────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cms_config_set_updated_at on public.cms_config;
create trigger cms_config_set_updated_at
  before update on public.cms_config
  for each row
  execute function public.set_updated_at();

drop trigger if exists cms_posts_set_updated_at on public.cms_posts;
create trigger cms_posts_set_updated_at
  before update on public.cms_posts
  for each row
  execute function public.set_updated_at();

-- ── Newsletter subscribers (homepage signup) ──────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'homepage',
  created_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_len check (char_length(email) between 3 and 320),
  constraint newsletter_subscribers_email_format check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  constraint newsletter_subscribers_source_len check (char_length(source) between 1 and 64)
);

create unique index if not exists idx_newsletter_subscribers_email_lower
  on public.newsletter_subscribers (lower(email));

create index if not exists idx_newsletter_subscribers_created_at
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
drop policy if exists "Editors read newsletter subscribers" on public.newsletter_subscribers;
drop policy if exists "Editors delete newsletter subscribers" on public.newsletter_subscribers;

create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

create policy "Editors read newsletter subscribers"
  on public.newsletter_subscribers
  for select
  to authenticated
  using (true);

create policy "Editors delete newsletter subscribers"
  on public.newsletter_subscribers
  for delete
  to authenticated
  using (true);

-- ── PostgREST grants (idempotent) ───────────────────────────────────────────
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table public.public_form_submissions to anon, authenticated;
grant select, insert, update, delete on table public.article_comments to anon, authenticated;
grant select, insert, update, delete on table public.cms_config to anon, authenticated;
grant select, insert, update, delete on table public.cms_posts to anon, authenticated;
grant select, insert, delete on table public.newsletter_subscribers to anon, authenticated;
