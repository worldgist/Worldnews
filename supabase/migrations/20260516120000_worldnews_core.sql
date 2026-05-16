-- World Gist News: public forms + article comments
-- RLS: anon can submit forms and post comments; authenticated (Supabase Auth) can read/delete form inbox and moderate comments.

-- ── Public form submissions (contact / advertise / submit-news) ─────────────
create table if not exists public.public_form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint public_form_submissions_form_type_check check (
    form_type in ('contact', 'advertise', 'submit-news')
  ),
  constraint public_form_submissions_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint public_form_submissions_payload_size check (octet_length(payload::text) < 65536)
);

create index if not exists idx_public_form_submissions_created_at
  on public.public_form_submissions (created_at desc);

alter table public.public_form_submissions enable row level security;

create policy "Anyone can submit public forms"
  on public.public_form_submissions
  for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated users can read form inbox"
  on public.public_form_submissions
  for select
  to authenticated
  using (true);

create policy "Authenticated users can delete form submissions"
  on public.public_form_submissions
  for delete
  to authenticated
  using (true);

-- ── Article comments (threaded via parent_id) ────────────────────────────────
create table if not exists public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,
  parent_id uuid references public.article_comments (id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now(),
  is_hidden boolean not null default false,
  constraint article_comments_author_len check (char_length(author_name) between 1 and 200),
  constraint article_comments_body_len check (char_length(body) between 1 and 8000)
);

create index if not exists idx_article_comments_article_id
  on public.article_comments (article_id);

create index if not exists idx_article_comments_parent_id
  on public.article_comments (parent_id)
  where parent_id is not null;

alter table public.article_comments enable row level security;

create policy "Public read non-hidden comments"
  on public.article_comments
  for select
  to anon, authenticated
  using (is_hidden = false);

create policy "Staff read all comments"
  on public.article_comments
  for select
  to authenticated
  using (true);

create policy "Anyone can post comments"
  on public.article_comments
  for insert
  to anon, authenticated
  with check (
    parent_id is null
    or exists (
      select 1
      from public.article_comments p
      where p.id = article_comments.parent_id
        and p.article_id = article_comments.article_id
        and p.is_hidden = false
    )
  );

create policy "Staff can update comments"
  on public.article_comments
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Staff can delete comments"
  on public.article_comments
  for delete
  to authenticated
  using (true);
