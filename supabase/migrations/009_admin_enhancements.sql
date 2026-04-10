-- Migration 009: Super Admin Enhancements
-- Adds: admin_audit_log table, admin_analytics_stats() RPC, admin_all_playbooks() RPC

BEGIN;

-- ============================================================
-- 1. Admin Audit Log Table
-- ============================================================

CREATE TABLE public.admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  -- 'role_change' | 'template_save' | 'template_create'
  -- | 'feature_create' | 'feature_update' | 'feature_toggle'
  -- | 'playbook_delete' | 'playbook_visibility_change'
  target_type TEXT NOT NULL,
  -- 'user' | 'prompt_template' | 'demo_feature' | 'playbook'
  target_id   TEXT,
  details     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_audit_log_admin   ON public.admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created ON public.admin_audit_log(created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super-admins can read audit log"
  ON public.admin_audit_log FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid()::text)) = 'super_admin'
  );

CREATE POLICY "Super-admins can insert audit entries"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = (select auth.uid()::text)) = 'super_admin'
  );

-- ============================================================
-- 2. Analytics RPC: admin_analytics_stats()
-- Returns one row with aggregated platform-wide stats.
-- SECURITY DEFINER with internal admin check.
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_analytics_stats()
RETURNS TABLE (
  total_users             BIGINT,
  total_playbooks         BIGINT,
  playbooks_this_week     BIGINT,
  active_users_this_month BIGINT,
  playbooks_by_industry   JSONB,
  playbooks_by_status     JSONB,
  top_scenarios           JSONB,
  recent_signups          JSONB
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF (SELECT p.role FROM public.profiles p WHERE p.id = (select auth.uid()::text)) <> 'super_admin' THEN
    RAISE EXCEPTION 'Forbidden: super_admin role required';
  END IF;

  RETURN QUERY
  WITH
    user_stats AS (
      SELECT COUNT(*)::BIGINT AS total FROM public.profiles
    ),
    pb_stats AS (
      SELECT
        COUNT(*)::BIGINT                                                                    AS total,
        COUNT(*) FILTER (WHERE created_at > now() - interval '7 days')::BIGINT             AS this_week
      FROM public.playbooks
    ),
    active_users AS (
      SELECT COUNT(DISTINCT user_id)::BIGINT AS cnt
      FROM public.playbooks
      WHERE updated_at > now() - interval '30 days'
    ),
    industry_agg AS (
      SELECT industry, COUNT(*)::BIGINT AS cnt
      FROM public.playbooks
      WHERE industry IS NOT NULL
      GROUP BY industry
      ORDER BY cnt DESC
    ),
    status_agg AS (
      SELECT status::TEXT, COUNT(*)::BIGINT AS cnt
      FROM public.playbooks
      GROUP BY status
    ),
    -- Extract scenario UUIDs from demo_config -> selectedScenarios JSON array
    scenario_raw AS (
      SELECT scenario_id
      FROM public.playbooks,
           jsonb_array_elements_text(demo_config -> 'selectedScenarios') AS scenario_id
      WHERE demo_config ? 'selectedScenarios'
        AND jsonb_typeof(demo_config -> 'selectedScenarios') = 'array'
    ),
    scenario_agg AS (
      SELECT
        sr.scenario_id,
        df.label,
        COUNT(*)::BIGINT AS usage_count
      FROM scenario_raw sr
      LEFT JOIN public.demo_features df ON df.id::TEXT = sr.scenario_id
      GROUP BY sr.scenario_id, df.label
      ORDER BY usage_count DESC
      LIMIT 8
    ),
    recent_list AS (
      SELECT
        p.email,
        p.created_at,
        COUNT(pb.id)::BIGINT AS playbook_count
      FROM public.profiles p
      LEFT JOIN public.playbooks pb ON pb.user_id = p.id
      GROUP BY p.email, p.created_at
      ORDER BY p.created_at DESC
      LIMIT 10
    )
  SELECT
    (SELECT total FROM user_stats),
    (SELECT total FROM pb_stats),
    (SELECT this_week FROM pb_stats),
    (SELECT cnt   FROM active_users),
    (SELECT COALESCE(jsonb_object_agg(industry, cnt), '{}') FROM industry_agg),
    (SELECT COALESCE(jsonb_object_agg(status,   cnt), '{}') FROM status_agg),
    (SELECT COALESCE(
        jsonb_agg(jsonb_build_object(
          'id',    scenario_id,
          'label', COALESCE(label, scenario_id),
          'count', usage_count
        )),
        '[]'::jsonb
      ) FROM scenario_agg),
    (SELECT COALESCE(
        jsonb_agg(jsonb_build_object(
          'email',          email,
          'created_at',     created_at,
          'playbook_count', playbook_count
        )),
        '[]'::jsonb
      ) FROM recent_list);
END;
$$;

-- ============================================================
-- 3. Global Playbooks RPC: admin_all_playbooks()
-- Returns paginated rows across all users, bypassing RLS.
-- SECURITY DEFINER with internal admin check.
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
