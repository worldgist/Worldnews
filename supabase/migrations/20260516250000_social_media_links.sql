-- Site-wide social profiles (footer + admin Social Media Management table).

create table if not exists public.social_media_links (
  platform text primary key,
  label text not null,
  url text not null,
  is_enabled boolean not null default true,
  sort_order smallint not null default 0,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_media_links_platform_check check (
    platform in ('facebook', 'x', 'instagram', 'whatsapp', 'youtube', 'tiktok')
  ),
  constraint social_media_links_label_len check (char_length(label) between 1 and 80),
  constraint social_media_links_url_len check (char_length(url) between 8 and 2048),
  constraint social_media_links_sort_order_range check (sort_order between 0 and 99)
);

create index if not exists idx_social_media_links_sort
  on public.social_media_links (sort_order asc, platform asc);

drop trigger if exists social_media_links_set_updated_at on public.social_media_links;
create trigger social_media_links_set_updated_at
  before update on public.social_media_links
  for each row
  execute function public.set_updated_at();

alter table public.social_media_links enable row level security;

drop policy if exists "Public read social links" on public.social_media_links;
drop policy if exists "Editors insert social links" on public.social_media_links;
drop policy if exists "Editors update social links" on public.social_media_links;
drop policy if exists "Editors delete social links" on public.social_media_links;

create policy "Public read social links"
  on public.social_media_links
  for select
  to anon, authenticated
  using (true);

create policy "Editors insert social links"
  on public.social_media_links
  for insert
  to authenticated
  with check (true);

create policy "Editors update social links"
  on public.social_media_links
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Editors delete social links"
  on public.social_media_links
  for delete
  to authenticated
  using (true);

insert into public.social_media_links (platform, label, url, is_enabled, sort_order)
values
  ('facebook', 'Facebook', 'https://facebook.com/worldgistnews', true, 1),
  ('x', 'X (Twitter)', 'https://x.com/worldgistnews', true, 2),
  ('instagram', 'Instagram', 'https://instagram.com/worldgistnews', true, 3),
  ('whatsapp', 'WhatsApp', 'https://wa.me/2340000000000', true, 4),
  ('youtube', 'YouTube', 'https://youtube.com/@worldgistnews', true, 5),
  ('tiktok', 'TikTok', 'https://tiktok.com/@worldgistnews', true, 6)
on conflict (platform) do nothing;

-- Merge URLs from legacy cms_config.settings when present.
update public.social_media_links sml
set
  url = coalesce(nullif(trim(cfg.settings->>'socialFacebook'), ''), sml.url),
  updated_at = now()
from public.cms_config cfg
where cfg.id = 'primary'
  and sml.platform = 'facebook'
  and nullif(trim(cfg.settings->>'socialFacebook'), '') is not null;

update public.social_media_links sml
set
  url = coalesce(nullif(trim(cfg.settings->>'socialX'), ''), sml.url),
  updated_at = now()
from public.cms_config cfg
where cfg.id = 'primary'
  and sml.platform = 'x'
  and nullif(trim(cfg.settings->>'socialX'), '') is not null;

update public.social_media_links sml
set
  url = coalesce(nullif(trim(cfg.settings->>'socialInstagram'), ''), sml.url),
  updated_at = now()
from public.cms_config cfg
where cfg.id = 'primary'
  and sml.platform = 'instagram'
  and nullif(trim(cfg.settings->>'socialInstagram'), '') is not null;

update public.social_media_links sml
set
  url = coalesce(nullif(trim(cfg.settings->>'socialWhatsapp'), ''), sml.url),
  updated_at = now()
from public.cms_config cfg
where cfg.id = 'primary'
  and sml.platform = 'whatsapp'
  and nullif(trim(cfg.settings->>'socialWhatsapp'), '') is not null;

update public.social_media_links sml
set
  url = coalesce(nullif(trim(cfg.settings->>'socialYoutube'), ''), sml.url),
  updated_at = now()
from public.cms_config cfg
where cfg.id = 'primary'
  and sml.platform = 'youtube'
  and nullif(trim(cfg.settings->>'socialYoutube'), '') is not null;

update public.social_media_links sml
set
  url = coalesce(nullif(trim(cfg.settings->>'socialTiktok'), ''), sml.url),
  updated_at = now()
from public.cms_config cfg
where cfg.id = 'primary'
  and sml.platform = 'tiktok'
  and nullif(trim(cfg.settings->>'socialTiktok'), '') is not null;

grant select on table public.social_media_links to anon, authenticated;
grant insert, update, delete on table public.social_media_links to authenticated;
