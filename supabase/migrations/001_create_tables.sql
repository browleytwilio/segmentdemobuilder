-- Playbook status enum
CREATE TYPE public.playbook_status AS ENUM ('draft', 'completed');

-- Profiles table (1:1 with auth.users)
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Playbooks table
CREATE TABLE public.playbooks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name     TEXT,
  industry          TEXT,
  status            public.playbook_status NOT NULL DEFAULT 'draft',
  demo_config       JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_prompts JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for user lookups
CREATE INDEX idx_playbooks_user_id ON public.playbooks(user_id);
