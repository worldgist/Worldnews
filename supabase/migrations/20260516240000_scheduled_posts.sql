-- Admin scheduling queue: one row per post waiting to publish (links to news_posts).

create table if not exists public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  post_id text not null references public.news_posts (id) on delete cascade,
  publish_at timestamptz not null,
  queue_status text not null default 'pending',
  editor_notes text not null default '',
  created_by uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_posts_post_id_unique unique (post_id),
  constraint scheduled_posts_queue_status_check check (
    queue_status in ('pending', 'published', 'cancelled')
  ),
  constraint scheduled_posts_editor_notes_len check (char_length(editor_notes) <= 2000)
);

create index if not exists idx_scheduled_posts_publish_at
  on public.scheduled_posts (publish_at asc)
  where queue_status = 'pending';

create index if not exists idx_scheduled_posts_queue_status
  on public.scheduled_posts (queue_status);

drop trigger if exists scheduled_posts_set_updated_at on public.scheduled_posts;
create trigger scheduled_posts_set_updated_at
  before update on public.scheduled_posts
  for each row
  execute function public.set_updated_at();

alter table public.scheduled_posts enable row level security;

drop policy if exists "Editors read scheduled queue" on public.scheduled_posts;
drop policy if exists "Editors insert scheduled queue" on public.scheduled_posts;
drop policy if exists "Editors update scheduled queue" on public.scheduled_posts;
drop policy if exists "Editors delete scheduled queue" on public.scheduled_posts;

create policy "Editors read scheduled queue"
  on public.scheduled_posts
  for select
  to authenticated
  using (true);

create policy "Editors insert scheduled queue"
  on public.scheduled_posts
  for insert
  to authenticated
  with check (true);

create policy "Editors update scheduled queue"
  on public.scheduled_posts
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Editors delete scheduled queue"
  on public.scheduled_posts
  for delete
  to authenticated
  using (true);

-- Backfill queue from news_posts already marked scheduled.
insert into public.scheduled_posts (post_id, publish_at, queue_status, created_at, updated_at)
select
  np.id,
  np.scheduled_for,
  'pending',
  np.created_at,
  np.updated_at
from public.news_posts np
where np.status = 'scheduled'
  and np.scheduled_for is not null
on conflict (post_id) do update set
  publish_at = excluded.publish_at,
  queue_status = 'pending',
  updated_at = excluded.updated_at;

grant select, insert, update, delete on table public.scheduled_posts to authenticated;
