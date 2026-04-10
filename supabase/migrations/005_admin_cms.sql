-- PRD 7: Super-Admin CMS — RBAC, prompt_templates, and admin utilities

-- 1. Role enum and profiles column
CREATE TYPE public.user_role AS ENUM ('user', 'super_admin');
ALTER TABLE public.profiles ADD COLUMN role public.user_role NOT NULL DEFAULT 'user';

-- 2. Prime Admin trigger: auto-promote browley@twilio.com on profile creation
CREATE OR REPLACE FUNCTION public.promote_prime_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.email = 'browley@twilio.com' THEN
    UPDATE public.profiles SET role = 'super_admin' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_promote_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.promote_prime_admin();

-- 3. prompt_templates table
CREATE TABLE public.prompt_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('foundation', 'architecture', 'scenario')),
  content     TEXT NOT NULL,
  version     INTEGER NOT NULL DEFAULT 1,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  updated_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prompt_templates_active ON public.prompt_templates(is_active) WHERE is_active = true;

-- 4. RLS for prompt_templates
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view templates"
  ON public.prompt_templates FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Super-admins can insert templates"
  ON public.prompt_templates FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super-admins can update templates"
  ON public.prompt_templates FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- 5. Additional profiles RLS: super_admins can view all profiles and update roles
CREATE POLICY "Super-admins can view all profiles"
  ON public.profiles FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

CREATE POLICY "Super-admins can update roles"
  ON public.profiles FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- 6. updated_at trigger for prompt_templates
CREATE TRIGGER prompt_templates_updated_at
  BEFORE UPDATE ON public.prompt_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 7. RPC function: admin users with playbook count (for /admin/users data table)
CREATE OR REPLACE FUNCTION public.admin_users_with_playbook_count()
RETURNS TABLE (
  id UUID,
  email TEXT,
  role public.user_role,
  created_at TIMESTAMPTZ,
  playbook_count BIGINT
) LANGUAGE sql SECURITY DEFINER SET search_path = ''
AS $$
  SELECT
    p.id, p.email, p.role, p.created_at,
    COUNT(pb.id) AS playbook_count
  FROM public.profiles p
  LEFT JOIN public.playbooks pb ON pb.user_id = p.id
  GROUP BY p.id, p.email, p.role, p.created_at
  ORDER BY p.created_at DESC;
$$;
