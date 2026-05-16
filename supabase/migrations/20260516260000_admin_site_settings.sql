-- Structured site settings for Admin Settings (replaces cms_config.settings JSON for core fields).

create table if not exists public.admin_site_settings (
  id text primary key default 'primary',
  site_name text not null default 'World Gist News',
  site_tagline text not null default '',
  site_address text not null default '',
  contact_email text not null default 'newsroom@worldgistnews.com',
  commercial_email text not null default '',
  tips_email text not null default '',
  copyright_text text not null default '',
  comments_enabled boolean not null default true,
  replies_enabled boolean not null default true,
  comment_max_length integer not null default 500,
  about_us_content text not null default '',
  contact_us_content text not null default '',
  terms_content text not null default '',
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_site_settings_singleton check (id = 'primary'),
  constraint admin_site_settings_site_name_len check (char_length(site_name) between 1 and 200),
  constraint admin_site_settings_contact_email_len check (char_length(contact_email) between 3 and 320),
  constraint admin_site_settings_comment_max_length_range check (
    comment_max_length between 80 and 2000
  )
);

drop trigger if exists admin_site_settings_set_updated_at on public.admin_site_settings;
create trigger admin_site_settings_set_updated_at
  before update on public.admin_site_settings
  for each row
  execute function public.set_updated_at();

alter table public.admin_site_settings enable row level security;

drop policy if exists "Public read site settings" on public.admin_site_settings;
drop policy if exists "Editors insert site settings" on public.admin_site_settings;
drop policy if exists "Editors update site settings" on public.admin_site_settings;

create policy "Public read site settings"
  on public.admin_site_settings
  for select
  to anon, authenticated
  using (id = 'primary');

create policy "Editors insert site settings"
  on public.admin_site_settings
  for insert
  to authenticated
  with check (id = 'primary');

create policy "Editors update site settings"
  on public.admin_site_settings
  for update
  to authenticated
  using (id = 'primary')
  with check (id = 'primary');

insert into public.admin_site_settings (id)
values ('primary')
on conflict (id) do nothing;

-- Backfill from legacy cms_config.settings JSON when present.
update public.admin_site_settings ass
set
  site_name = coalesce(nullif(trim(cfg.settings->>'siteName'), ''), ass.site_name),
  site_tagline = coalesce(cfg.settings->>'siteTagline', ass.site_tagline),
  site_address = coalesce(cfg.settings->>'siteAddress', ass.site_address),
  contact_email = coalesce(nullif(trim(cfg.settings->>'contactEmail'), ''), ass.contact_email),
  commercial_email = coalesce(cfg.settings->>'commercialEmail', ass.commercial_email),
  tips_email = coalesce(cfg.settings->>'tipsEmail', ass.tips_email),
  copyright_text = coalesce(cfg.settings->>'copyrightText', ass.copyright_text),
  comments_enabled = coalesce((cfg.settings->>'commentsEnabled')::boolean, ass.comments_enabled),
  replies_enabled = coalesce((cfg.settings->>'repliesEnabled')::boolean, ass.replies_enabled),
  comment_max_length = coalesce((cfg.settings->>'commentMaxLength')::integer, ass.comment_max_length),
  about_us_content = coalesce(cfg.settings->>'aboutUsContent', ass.about_us_content),
  contact_us_content = coalesce(cfg.settings->>'contactUsContent', ass.contact_us_content),
  terms_content = coalesce(cfg.settings->>'termsContent', ass.terms_content),
  updated_at = now()
from public.cms_config cfg
where cfg.id = 'primary'
  and ass.id = 'primary'
  and cfg.settings is not null
  and cfg.settings <> '{}'::jsonb;

grant select on table public.admin_site_settings to anon, authenticated;
grant insert, update on table public.admin_site_settings to authenticated;
