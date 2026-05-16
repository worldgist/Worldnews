-- Replace placeholder admin profile rows with World Gist News newsroom details.

update public.admin_user_profiles
set
  full_name = 'World Gist News Editorial Team',
  email = 'newsroom@worldgistnews.com',
  role = 'Managing Editor',
  bio = 'Leads editorial standards, fact-checking, and daily publication workflow for World Gist News. The newsroom covers world affairs, politics, sports, school, technology, and entertainment from Bronx, New York. Reach the desk at newsroom@worldgistnews.com for corrections, partnerships, and publication questions.',
  updated_at = now()
where
  full_name in ('Admin User', '')
  or email in ('admin@worldgistnews.com', '')
  or bio = 'Managing editorial quality and publication workflow for World Gist News.';

-- New signups: prefer newsroom identity over generic "Admin User".
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
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      'World Gist News Editorial Team'
    ),
    coalesce(
      nullif(trim(new.email), ''),
      'newsroom@worldgistnews.com'
    ),
    coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'Managing Editor'),
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'bio'), ''),
      'Leads editorial standards, fact-checking, and daily publication workflow for World Gist News. The newsroom covers world affairs, politics, sports, school, technology, and entertainment from Bronx, New York. Reach the desk at newsroom@worldgistnews.com for corrections, partnerships, and publication questions.'
    )
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;
