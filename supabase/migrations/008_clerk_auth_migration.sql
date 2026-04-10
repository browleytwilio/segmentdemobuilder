-- Migration 008: Clerk Auth Migration
-- Decouples profiles table from auth.users (Supabase Auth) so that
-- Clerk user IDs (TEXT strings like "user_xxx") can be used as profile IDs.
-- Supabase Auth is no longer used for authentication; Clerk handles it.
-- RLS continues to work via Clerk-issued JWTs with the Supabase JWT template.

BEGIN;

-- ============================================================
-- 1. Drop FK from profiles.id → auth.users(id)
-- ============================================================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ============================================================
-- 2. Drop FKs that reference profiles.id (must drop before type change)
-- ============================================================
ALTER TABLE public.playbooks DROP CONSTRAINT IF EXISTS playbooks_user_id_fkey;
ALTER TABLE public.prompt_templates DROP CONSTRAINT IF EXISTS prompt_templates_updated_by_fkey;

-- ============================================================
-- 3. Drop indexes on columns being altered (recreate after)
-- ============================================================
DROP INDEX IF EXISTS idx_playbooks_user_id;
DROP INDEX IF EXISTS idx_playbooks_draft_pruning;
DROP INDEX IF EXISTS idx_prompt_templates_updated_by;

-- ============================================================
-- 4. Change column types from UUID to TEXT
--    Existing UUID values are valid TEXT strings, so no data loss.
-- ============================================================
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE public.playbooks ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE public.prompt_templates ALTER COLUMN updated_by TYPE TEXT USING updated_by::TEXT;

-- ============================================================
-- 5. Recreate FKs with ON UPDATE CASCADE
--    Allows webhook to update profiles.id (UUID → Clerk ID) and
--    have playbooks.user_id cascade automatically.
-- ============================================================
ALTER TABLE public.playbooks
  ADD CONSTRAINT playbooks_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.prompt_templates
  ADD CONSTRAINT prompt_templates_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES public.profiles(id)
  ON UPDATE CASCADE;

-- ============================================================
-- 6. Recreate indexes
-- ============================================================
CREATE INDEX idx_playbooks_user_id ON public.playbooks(user_id);
CREATE INDEX idx_playbooks_draft_pruning ON public.playbooks(updated_at) WHERE status = 'draft';
CREATE INDEX idx_prompt_templates_updated_by ON public.prompt_templates(updated_by);

-- ============================================================
-- 7. Drop handle_new_user trigger on auth.users
--    Profile creation is now handled by Clerk webhook.
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================
-- 8. Keep promote_prime_admin trigger on profiles
--    It fires AFTER INSERT on profiles, checking NEW.email.
--    The Clerk webhook INSERTs profiles, so the trigger still works.
-- ============================================================

COMMIT;
