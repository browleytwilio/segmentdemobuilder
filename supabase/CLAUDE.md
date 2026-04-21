# Supabase Database

## Schema Overview

| Table | PK | Purpose |
|-------|-----|---------|
| `profiles` | `id` TEXT (Clerk user ID) | User profiles synced from Clerk webhook |
| `playbooks` | `id` UUID | Demo playbooks with `demo_config` JSONB and `generated_prompts` JSONB |
| `prompt_templates` | `id` UUID | Admin-managed prompt templates with `{{VARIABLE}}` placeholders |
| `demo_features` | `id` UUID | Industry-specific demo scenarios, linked to prompt_templates |
| `playbook_comments` | `id` UUID | Comment threads on playbooks |
| `playbook_tags` | composite | Many-to-many playbook-to-tag association |
| `tags` | `id` UUID | User-created organizational tags |
| `favorites` | composite | User-playbook favorite association |
| `notifications` | `id` UUID | In-app notification feed |

## Critical: profiles.id is TEXT, not UUID

The `profiles.id` column stores the Clerk user ID (e.g., `user_2abc123`), which is a string. This was migrated from Supabase Auth UUIDs in migration `008_clerk_auth_migration.sql`. All foreign keys referencing `profiles.id` are also TEXT.

## RLS Patterns

All tables use Row-Level Security. The auth context comes from the Clerk JWT:

```sql
-- Standard ownership check pattern
auth.jwt() ->> 'sub' = profiles.id
-- Note: ->> returns TEXT, profiles.id is TEXT — no cast needed

-- For tables with user_id UUID columns (pre-migration legacy):
auth.uid()::text = user_id::text
-- The ::text cast is required because auth.uid() returns UUID
```

When creating new RLS policies, always test with both the owner and a non-owner user.

## Dual Client Pattern

- **Clerk JWT client** (`createClient()` from `lib/supabase/server.ts`) — used for authenticated requests, respects RLS
- **Service role client** — used in webhooks and admin actions that bypass RLS. Created with `SUPABASE_SERVICE_ROLE_KEY`

## Migration Conventions

- Sequential numbering: `001_`, `002_`, etc.
- Wrap DDL in `BEGIN; ... COMMIT;` transactions
- Create indexes for foreign keys and commonly filtered columns
- Reuse the `update_updated_at()` trigger function (defined in `001`)
- Test migrations locally with `npx supabase db reset` before pushing
