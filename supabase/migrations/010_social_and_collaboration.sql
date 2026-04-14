-- Migration 010: Social & Collaboration Features
-- Adds: playbook_visibility enum, playbooks columns (visibility, is_favorite, cloned_from, progress),
-- tags & playbook_tags tables, playbook_comments table, playbook_templates table,
-- RLS policies, indexes, triggers, seed templates.
-- Also recreates admin_all_playbooks() RPC which referenced the nonexistent playbook_visibility type.

BEGIN;

-- ============================================================
-- 1. playbook_visibility enum & new playbooks columns
-- ============================================================

CREATE TYPE public.playbook_visibility AS ENUM ('private', 'shared', 'public');

ALTER TABLE public.playbooks
  ADD COLUMN visibility public.playbook_visibility NOT NULL DEFAULT 'private',
  ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN cloned_from UUID REFERENCES public.playbooks(id) ON DELETE SET NULL,
  ADD COLUMN progress JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX idx_playbooks_visibility ON public.playbooks(visibility) WHERE visibility != 'private';

-- Shared playbooks RLS: authenticated users can view shared/public playbooks
CREATE POLICY "Users can view shared playbooks"
  ON public.playbooks FOR SELECT
  USING (visibility IN ('shared', 'public'));

-- ============================================================
-- 2. Tags table
-- ============================================================

CREATE TABLE public.tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 30),
  color      TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user_id ON public.tags(user_id);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags"
  ON public.tags FOR SELECT
  USING (user_id = (select auth.uid()::text));

CREATE POLICY "Users can insert own tags"
  ON public.tags FOR INSERT
  WITH CHECK (user_id = (select auth.uid()::text));

CREATE POLICY "Users can delete own tags"
  ON public.tags FOR DELETE
  USING (user_id = (select auth.uid()::text));

-- ============================================================
-- 3. Playbook-Tags junction table
-- ============================================================

CREATE TABLE public.playbook_tags (
  playbook_id UUID NOT NULL REFERENCES public.playbooks(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (playbook_id, tag_id)
);

CREATE INDEX idx_playbook_tags_tag_id ON public.playbook_tags(tag_id);

ALTER TABLE public.playbook_tags ENABLE ROW LEVEL SECURITY;

-- Users can manage tags on their own playbooks
CREATE POLICY "Users can view own playbook tags"
  ON public.playbook_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.playbooks
      WHERE id = playbook_id AND user_id = (select auth.uid()::text)
    )
  );

CREATE POLICY "Users can insert own playbook tags"
  ON public.playbook_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playbooks
      WHERE id = playbook_id AND user_id = (select auth.uid()::text)
    )
  );

CREATE POLICY "Users can delete own playbook tags"
  ON public.playbook_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.playbooks
      WHERE id = playbook_id AND user_id = (select auth.uid()::text)
    )
  );

-- ============================================================
-- 4. Playbook Comments table
-- ============================================================

CREATE TABLE public.playbook_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID NOT NULL REFERENCES public.playbooks(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_playbook_comments_playbook ON public.playbook_comments(playbook_id, created_at);
CREATE INDEX idx_playbook_comments_user ON public.playbook_comments(user_id);

ALTER TABLE public.playbook_comments ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read comments on playbooks they can see
-- (own playbooks + shared/public playbooks via existing playbooks RLS)
CREATE POLICY "Users can view comments on accessible playbooks"
  ON public.playbook_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.playbooks
      WHERE id = playbook_id
    )
  );

CREATE POLICY "Users can insert own comments"
  ON public.playbook_comments FOR INSERT
  WITH CHECK (user_id = (select auth.uid()::text));

CREATE POLICY "Users can delete own comments"
  ON public.playbook_comments FOR DELETE
  USING (user_id = (select auth.uid()::text));

CREATE TRIGGER playbook_comments_updated_at
  BEFORE UPDATE ON public.playbook_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 5. Playbook Templates table
-- ============================================================

CREATE TABLE public.playbook_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,
  industry      TEXT NOT NULL,
  persona       TEXT NOT NULL,
  demo_config   JSONB NOT NULL DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.playbook_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active templates"
  ON public.playbook_templates FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Super-admins can insert playbook templates"
  ON public.playbook_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid()::text)) = 'super_admin'
  );

CREATE POLICY "Super-admins can update playbook templates"
  ON public.playbook_templates FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid()::text)) = 'super_admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid()::text)) = 'super_admin'
  );

CREATE TRIGGER playbook_templates_updated_at
  BEFORE UPDATE ON public.playbook_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 6. Seed starter playbook templates
-- ============================================================

INSERT INTO public.playbook_templates (name, description, industry, persona, demo_config, display_order) VALUES

(
  'E-commerce Quick Start',
  'Pre-configured demo for an e-commerce CTO showing cart abandonment recovery, personalization, and intent-based upsells.',
  'E-commerce / Retail',
  'CTO / Engineering',
  '{
    "persona": "CTO / Engineering",
    "architecture": {
      "enableSESidebar": true,
      "enableSeededProfiles": true,
      "enableProfileAPI": false,
      "enableIntentPredictions": true,
      "enableSecondPagePers": true
    },
    "selectedScenarios": []
  }'::jsonb,
  1
),
(
  'FinTech Risk & Compliance',
  'Demo for a FinTech CTO focused on PII masking, risk profile gating, and compliance-driven data governance.',
  'FinTech',
  'CTO / Engineering',
  '{
    "persona": "CTO / Engineering",
    "architecture": {
      "enableSESidebar": true,
      "enableSeededProfiles": true,
      "enableProfileAPI": true,
      "enableIntentPredictions": false,
      "enableSecondPagePers": false
    },
    "selectedScenarios": []
  }'::jsonb,
  2
),
(
  'B2B SaaS Product-Led Growth',
  'Demo for a Product Manager at a B2B SaaS company showing group-level context, content affinity, and paywall thresholds.',
  'B2B SaaS',
  'Product Manager',
  '{
    "persona": "Product Manager",
    "architecture": {
      "enableSESidebar": true,
      "enableSeededProfiles": true,
      "enableProfileAPI": false,
      "enableIntentPredictions": true,
      "enableSecondPagePers": false
    },
    "selectedScenarios": []
  }'::jsonb,
  3
),
(
  'Media & Entertainment CMO',
  'Demo for a CMO at a media company focused on content affinity, personalization, and audience engagement.',
  'Media & Entertainment',
  'CMO',
  '{
    "persona": "CMO",
    "architecture": {
      "enableSESidebar": true,
      "enableSeededProfiles": true,
      "enableProfileAPI": false,
      "enableIntentPredictions": true,
      "enableSecondPagePers": true
    },
    "selectedScenarios": []
  }'::jsonb,
  4
);

-- ============================================================
-- 7. Recreate admin_all_playbooks() RPC
--    Migration 009 created this function referencing
--    public.playbook_visibility which did not exist then.
--    Now that the type exists, recreate it cleanly.
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_all_playbooks(
  p_limit    INT  DEFAULT 50,
  p_offset   INT  DEFAULT 0,
  p_industry TEXT DEFAULT NULL,
  p_status   TEXT DEFAULT NULL,
  p_q        TEXT DEFAULT NULL
)
RETURNS TABLE (
  id            UUID,
  customer_name TEXT,
  industry      TEXT,
  status        public.playbook_status,
  visibility    public.playbook_visibility,
  user_id       TEXT,
  user_email    TEXT,
  created_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ,
  total_count   BIGINT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF (SELECT p.role FROM public.profiles p WHERE p.id = (select auth.uid()::text)) <> 'super_admin' THEN
    RAISE EXCEPTION 'Forbidden: super_admin role required';
  END IF;

  RETURN QUERY
  SELECT
    pb.id,
    pb.customer_name,
    pb.industry,
    pb.status,
    pb.visibility,
    pb.user_id,
    pr.email AS user_email,
    pb.created_at,
    pb.updated_at,
    COUNT(*) OVER()::BIGINT AS total_count
  FROM public.playbooks pb
  JOIN public.profiles pr ON pr.id = pb.user_id
  WHERE
    (p_industry IS NULL OR pb.industry = p_industry)
    AND (p_status   IS NULL OR pb.status::TEXT = p_status)
    AND (p_q        IS NULL OR pb.customer_name ILIKE '%' || p_q || '%')
  ORDER BY pb.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMIT;
