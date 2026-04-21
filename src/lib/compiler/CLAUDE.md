# Compiler Pipeline

## Flow

```
Wizard (Zustand store) → createPlaybook action (DB insert)
  → /builder/compile/[id] page reads store
  → compilePromptsWithTemplates() builds prompts
  → /api/ai/enrich enhances with AI (best-effort, fallback to raw)
  → sanitizePrompts() replaces real keys with YOUR_* placeholders
  → PATCH /api/playbooks/[id] saves sanitized prompts to DB
  → redirect to /playbooks/[id] viewer
```

## Two Compilation Paths

- `compilePromptsWithTemplates(input, dbTemplates)` — **primary path**. Foundation prompts from code (`scaffold`, `environment`, `architecture`) + scenario prompts from DB `prompt_templates` table with `{{VARIABLE}}` substitution
- `compilePrompts(input)` — legacy fallback. All prompts from code including hardcoded scenarios

## Template Variables

The template engine (`template-engine.ts`) resolves `{{VARIABLE}}` placeholders. Available variables:

- Context: `CUSTOMER_NAME`, `INDUSTRY`, `DATABASE_PROVIDER`, `AUTH_PROVIDER`
- Brand: `PRODUCT_NAME` (falls back to customer name), `TAGLINE`, `PRIMARY_COLOR`, `ACCENT_COLOR`, `VOICE_TONE`
- Credentials: `SEGMENT_WRITE_KEY`, `SEGMENT_BACKEND_WRITE_KEY`, `SEGMENT_WORKSPACE_TOKEN`, `SEGMENT_PROFILE_TOKEN`
- Provider-specific: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`, etc. (derived from provider `envVarMap`)
- Versions: `NPM_NEXT_VERSION`, `NPM_REACT_VERSION`, etc. (fetched at compile time)

Unknown variables are left as-is (safe — admin editor validates on save).

## Provider Registry

`providers.ts` is the single source of truth for database and auth providers. Each provider defines:
- `credentialFields` — form inputs for the wizard
- `envVarMap` — credential-to-env-var mapping
- `sanitizationEntries` — real-value-to-placeholder mapping
- `dependencies` — NPM packages to resolve versions for

When adding a new provider, only edit `providers.ts`. The wizard, template engine, sanitizer, and credential schema all derive from it.

## Sanitization

`sanitizer.ts` builds a map of `{ storeKey → placeholder }` from the provider registry. During sanitization, every occurrence of a real credential value in prompt text is replaced with its `YOUR_*` placeholder. This produces "Variant B" for database storage. The original "Variant A" exists only in client memory during the session.

## Version Pinning

`fallback-versions.ts` provides hardcoded version fallbacks if the NPM registry API is unavailable. These should be updated periodically to match current stable releases.
