# Segment Demo Builder

Internal Twilio tool that generates AI-powered demo playbooks for the Segment CDP. Solutions Engineers describe a customer context, and the system compiles step-by-step build prompts for Claude Code to scaffold a working demo app.

## Stack

- **Framework:** Next.js 16.2.3, React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 4, shadcn/ui (base-nova theme), Framer Motion
- **State:** Zustand with `persist` middleware (versioned migrations)
- **Database:** Supabase (PostgreSQL + Row-Level Security)
- **Auth:** Clerk (`@clerk/nextjs`), enforces `@twilio.com` domain in-app
- **AI:** Vercel AI SDK v6, OpenAI models via `@ai-sdk/openai`
- **Rate Limiting:** Upstash Redis
- **Validation:** Zod (v4 in AI routes, standard in form schemas)
- **Testing:** Vitest + Testing Library + MSW (unit), Playwright (E2E)
- **Deploy:** Vercel (syd1 region), AI routes get 120s timeout

## Project Structure

```
src/app/(app)/        Authenticated routes (dashboard, builder, playbooks, admin)
src/app/(marketing)/  Public marketing pages
src/app/api/ai/       7 AI route handlers (enrich, parse-intent, demo-script, etc.)
src/lib/compiler/     Prompt compilation engine (template engine, sanitizer, providers)
src/lib/ai/           AI config, system prompts, rate limiting
src/lib/stores/       Zustand builder store
src/lib/analytics/    Typed Segment analytics (discriminated SegmentEventMap)
src/lib/validations/  Zod schemas for forms and credentials
src/lib/segment/      Segment Profile API client and definitions
src/components/builder/   4-step wizard + NL builder + template picker
src/components/playbook/  Playbook viewer, prompt cards, rehydration modal
src/components/ui/        shadcn/ui base components (do not edit directly)
supabase/migrations/      10 sequential SQL migrations
```

## Key Conventions

- Path alias: `@/` maps to `src/`
- React Server Components by default; add `"use client"` only for interactivity
- Credentials are NEVER persisted — stored in Zustand memory only, sanitized to `YOUR_*` placeholders before DB save
- All analytics events are compile-time checked via `trackEvent()` + `SegmentEventMap`
- Console errors in API routes use prefix format: `[ai/route-name]`
- PRD reference: `Demo_Builder_Tool.md` at repo root (10-phase engineering spec)

## Area-Specific Context

@AGENTS.md
@src/lib/compiler/CLAUDE.md
@src/lib/ai/CLAUDE.md
@src/app/api/CLAUDE.md
@src/components/CLAUDE.md
@supabase/CLAUDE.md
