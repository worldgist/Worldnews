-- Schedule live news ingestion by calling the Supabase Edge Function hourly.
-- Replace placeholders before running in Supabase SQL editor.

-- 1) Ensure extensions are available
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) Remove existing job if present
do $$
declare
  existing_job_id int;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'import-live-news-hourly';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end $$;

-- 3) Create an hourly schedule (top of every hour)
select
  cron.schedule(
    'import-live-news-hourly',
    '0 * * * *',
    $$
    select
      net.http_post(
        url := 'https://<PROJECT_REF>.functions.supabase.co/import-live-news',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer <SUPABASE_ANON_KEY>',
          'apikey', '<SUPABASE_ANON_KEY>',
          'x-cron-secret', '<LIVE_NEWS_CRON_SECRET>'
        ),
        body := '{}'::jsonb
      );
    $$
  );
