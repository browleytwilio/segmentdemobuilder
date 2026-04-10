-- 30-Day Draft Pruning
-- Purges abandoned draft playbooks older than 30 days, daily at 3 AM UTC.
-- Requires: Supabase Pro plan or self-hosted Postgres with pg_cron enabled.

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'prune-abandoned-drafts',
  '0 3 * * *',
  $$DELETE FROM public.playbooks
    WHERE status = 'draft'
    AND updated_at < NOW() - INTERVAL '30 days'$$
);
