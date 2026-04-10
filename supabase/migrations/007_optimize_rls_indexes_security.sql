-- Migration 007: Supabase best practices optimizations
--
-- Applies guidance from:
--   security-rls-performance  → (select auth.uid()) prevents per-row re-evaluation
--   schema-foreign-key-indexes → FK columns without indexes cause slow cascades/joins
--   query-composite-indexes   → composite partial index for draft-pruning cron
--   supabase security skill   → SECURITY DEFINER functions need internal auth checks

-- ============================================================
-- 1. RLS Performance: wrap bare auth.uid() in (select auth.uid())
--    PostgreSQL re-evaluates auth.uid() (a current_setting call) for
--    every row when used directly in a policy. Wrapping it in a scalar
--    subselect lets the planner evaluate it once and treat it as a constant.
-- ============================================================

-- Profiles policies (from migration 002)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- Playbooks policies (from migration 002)
DROP POLICY IF EXISTS "Users can view own playbooks" ON public.playbooks;
DROP POLICY IF EXISTS "Users can insert own playbooks" ON public.playbooks;
DROP POLICY IF EXISTS "Users can update own playbooks" ON public.playbooks;
DROP POLICY IF EXISTS "Users can delete own playbooks" ON public.playbooks;

CREATE POLICY "Users can view own playbooks"
  ON public.playbooks FOR SELECT
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own playbooks"
  ON public.playbooks FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own playbooks"
  ON public.playbooks FOR UPDATE
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own playbooks"
  ON public.playbooks FOR DELETE
  USING (user_id = (select auth.uid()));

-- Admin profiles policies (from migration 005) — auth.uid() inside subselect
DROP POLICY IF EXISTS "Super-admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super-admins can update roles" ON public.profiles;

CREATE POLICY "Super-admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'super_admin'
  );

CREATE POLICY "Super-admins can update roles"
  ON public.profiles FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'super_admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'super_admin'
  );

-- Prompt templates admin policies (from migration 005)
DROP POLICY IF EXISTS "Super-admins can insert templates" ON public.prompt_templates;
DROP POLICY IF EXISTS "Super-admins can update templates" ON public.prompt_templates;

CREATE POLICY "Super-admins can insert templates"
  ON public.prompt_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'super_admin'
  );

CREATE POLICY "Super-admins can update templates"
  ON public.prompt_templates FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'super_admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'super_admin'
  );

-- Demo features admin policies (from migration 006)
DROP POLICY IF EXISTS "Super-admins can insert features" ON public.demo_features;
DROP POLICY IF EXISTS "Super-admins can update features" ON public.demo_features;

CREATE POLICY "Super-admins can insert features"
  ON public.demo_features FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'super_admin'
  );

CREATE POLICY "Super-admins can update features"
  ON public.demo_features FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'super_admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid())) = 'super_admin'
  );


-- ============================================================
-- 2. Missing FK Indexes
--    Foreign key columns without indexes cause slow CASCADE operations
--    and expensive JOIN lookups that require sequential scans.
-- ============================================================

-- demo_features.prompt_template_id → prompt_templates(id)
CREATE INDEX IF NOT EXISTS idx_demo_features_template
  ON public.demo_features(prompt_template_id);

-- prompt_templates.updated_by → profiles(id)
CREATE INDEX IF NOT EXISTS idx_prompt_templates_updated_by
  ON public.prompt_templates(updated_by);


-- ============================================================
-- 3. Composite Partial Index for Draft Pruning Cron
--    The pg_cron job (migration 003) filters:
--      WHERE status = 'draft' AND updated_at < cutoff
--    A partial composite index makes this an index-only scan.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_playbooks_draft_pruning
  ON public.playbooks(updated_at)
  WHERE status = 'draft';


-- ============================================================
-- 4. Harden SECURITY DEFINER RPC with Internal Auth Check
--    The admin_users_with_playbook_count function bypasses RLS.
--    Without an internal check, any authenticated user could call
--    it directly via the REST API and enumerate all users.
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_users_with_playbook_count()
RETURNS TABLE (
  id UUID,
  email TEXT,
  role public.user_role,
  created_at TIMESTAMPTZ,
  playbook_count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Verify caller is a super_admin before returning data
  IF (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) <> 'super_admin' THEN
    RAISE EXCEPTION 'Forbidden: super_admin role required';
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.email, p.role, p.created_at,
    COUNT(pb.id) AS playbook_count
  FROM public.profiles p
  LEFT JOIN public.playbooks pb ON pb.user_id = p.id
  GROUP BY p.id, p.email, p.role, p.created_at
  ORDER BY p.created_at DESC;
END;
$$;
