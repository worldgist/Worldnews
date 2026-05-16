-- Structured news posts for the admin editor (replaces JSON-only cms_posts.payload).

create table if not exists public.news_posts (
  id text primary key,
  title text not null,
  category text not null,
  summary text not null default '',
  body jsonb not null default '[]'::jsonb,
  body_html text not null default '',
  author text not null default 'worldgistnews',
  image_url text,
  read_time text not null default '5 min',
  display_date text not null default '',
  status text not null default 'draft',
  featured boolean not null default false,
  scheduled_for timestamptz,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_posts_title_len check (char_length(title) between 1 and 500),
  constraint news_posts_category_len check (char_length(category) between 1 and 80),
  constraint news_posts_summary_len check (char_length(summary) <= 2000),
  constraint news_posts_author_len check (char_length(author) between 1 and 200),
  constraint news_posts_read_time_len check (char_length(read_time) between 1 and 32),
  constraint news_posts_status_check check (
    status in ('draft', 'scheduled', 'published', 'archived')
  ),
  constraint news_posts_body_is_array check (jsonb_typeof(body) = 'array')
);

create index if not exists idx_news_posts_status on public.news_posts (status);
create index if not exists idx_news_posts_category on public.news_posts (category);
create index if not exists idx_news_posts_published_at on public.news_posts (published_at desc nulls last);
create index if not exists idx_news_posts_scheduled_for on public.news_posts (scheduled_for desc nulls last);
create index if not exists idx_news_posts_updated_at on public.news_posts (updated_at desc);

drop trigger if exists news_posts_set_updated_at on public.news_posts;
create trigger news_posts_set_updated_at
  before update on public.news_posts
  for each row
  execute function public.set_updated_at();

alter table public.news_posts enable row level security;

drop policy if exists "Public read published news posts" on public.news_posts;
drop policy if exists "Editors read all news posts" on public.news_posts;
drop policy if exists "Editors insert news posts" on public.news_posts;
drop policy if exists "Editors update news posts" on public.news_posts;
drop policy if exists "Editors delete news posts" on public.news_posts;

create policy "Public read published news posts"
  on public.news_posts
  for select
  to anon
  using (
    status = 'published'
    or (
      status = 'scheduled'
      and scheduled_for is not null
      and scheduled_for <= now()
    )
  );

create policy "Editors read all news posts"
  on public.news_posts
  for select
  to authenticated
  using (true);

create policy "Editors insert news posts"
  on public.news_posts
  for insert
  to authenticated
  with check (true);

create policy "Editors update news posts"
  on public.news_posts
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Editors delete news posts"
  on public.news_posts
  for delete
  to authenticated
  using (true);

-- Backfill from legacy cms_posts.payload JSON.
insert into public.news_posts (
  id,
  title,
  category,
  summary,
  body,
  body_html,
  author,
  image_url,
  read_time,
  display_date,
  status,
  featured,
  scheduled_for,
  published_at,
  updated_at
)
select
  p.id,
  coalesce(nullif(trim(p.payload->>'title'), ''), 'Untitled'),
  coalesce(nullif(trim(p.payload->>'category'), ''), 'World'),
  coalesce(nullif(trim(p.payload->>'summary'), ''), ''),
  coalesce(p.payload->'body', '[]'::jsonb),
  coalesce(nullif(trim(p.payload->>'htmlContent'), ''), ''),
  coalesce(nullif(trim(p.payload->>'author'), ''), 'worldgistnews'),
  nullif(trim(p.payload->>'image'), ''),
  coalesce(nullif(trim(p.payload->>'readTime'), ''), '5 min'),
  coalesce(nullif(trim(p.payload->>'date'), ''), ''),
  case
    when coalesce(p.payload->>'status', 'published') in ('draft', 'scheduled', 'published', 'archived')
      then p.payload->>'status'
    else 'published'
  end,
  coalesce((p.payload->>'featured')::boolean, false),
  nullif(p.payload->>'scheduledFor', '')::timestamptz,
  nullif(p.payload->>'publishedAt', '')::timestamptz,
  p.updated_at
from public.cms_posts p
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  summary = excluded.summary,
  body = excluded.body,
  body_html = excluded.body_html,
  author = excluded.author,
  image_url = excluded.image_url,
  read_time = excluded.read_time,
  display_date = excluded.display_date,
  status = excluded.status,
  featured = excluded.featured,
  scheduled_for = excluded.scheduled_for,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;

grant select on table public.news_posts to anon;
grant select, insert, update, delete on table public.news_posts to authenticated;
