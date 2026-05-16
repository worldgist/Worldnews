-- Structured news categories for admin Add Category / Categories Management.

create table if not exists public.cms_categories (
  slug text primary key,
  name text not null,
  description text not null default '',
  route_path text,
  sort_order smallint not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cms_categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint cms_categories_name_len check (char_length(name) between 1 and 80),
  constraint cms_categories_description_len check (char_length(description) <= 500),
  constraint cms_categories_route_path_len check (
    route_path is null or char_length(route_path) between 1 and 200
  ),
  constraint cms_categories_sort_order_range check (sort_order between 0 and 999)
);

create index if not exists idx_cms_categories_sort
  on public.cms_categories (sort_order asc, name asc);

create index if not exists idx_cms_categories_active
  on public.cms_categories (is_active)
  where is_active = true;

drop trigger if exists cms_categories_set_updated_at on public.cms_categories;
create trigger cms_categories_set_updated_at
  before update on public.cms_categories
  for each row
  execute function public.set_updated_at();

alter table public.cms_categories enable row level security;

drop policy if exists "Public read active categories" on public.cms_categories;
drop policy if exists "Editors read all categories" on public.cms_categories;
drop policy if exists "Editors insert categories" on public.cms_categories;
drop policy if exists "Editors update categories" on public.cms_categories;
drop policy if exists "Editors delete categories" on public.cms_categories;

create policy "Public read active categories"
  on public.cms_categories
  for select
  to anon
  using (is_active = true);

create policy "Editors read all categories"
  on public.cms_categories
  for select
  to authenticated
  using (true);

create policy "Editors insert categories"
  on public.cms_categories
  for insert
  to authenticated
  with check (true);

create policy "Editors update categories"
  on public.cms_categories
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Editors delete categories"
  on public.cms_categories
  for delete
  to authenticated
  using (true);

-- Default editorial sections.
insert into public.cms_categories (slug, name, sort_order, route_path) values
  ('world', 'World', 1, '/world-news'),
  ('politics', 'Politics', 2, '/politics-news'),
  ('sports', 'Sports', 3, '/sports-news'),
  ('school', 'School', 4, '/school-news'),
  ('technology', 'Technology', 5, '/technology-news'),
  ('entertainment', 'Entertainment', 6, '/entertainment-news')
on conflict (slug) do nothing;

-- Backfill from legacy cms_config.categories JSON array.
insert into public.cms_categories (slug, name, sort_order)
select
  lower(regexp_replace(trim(elem), '[^a-zA-Z0-9]+', '-', 'g')),
  trim(elem),
  (100 + row_number() over (order by ord))::smallint
from public.cms_config cfg,
  jsonb_array_elements_text(cfg.categories) with ordinality as t(elem, ord)
where cfg.id = 'primary'
  and trim(elem) <> ''
on conflict (slug) do update set
  name = excluded.name,
  updated_at = now();

grant select on table public.cms_categories to anon, authenticated;
grant insert, update, delete on table public.cms_categories to authenticated;
