<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Rules

## Code Style

- Strict TypeScript — no `any` without eslint-disable comment
- Validate all API request bodies with Zod `.safeParse()`, return 400 on failure
- Use `Response.json()` for API responses (not NextResponse)
- Error returns: `{ error: string }` with appropriate HTTP status
- Prefer named exports; default export only for page/layout components

## Testing

- **Unit tests:** Vitest + Testing Library. Co-locate as `*.test.ts(x)` next to source files
- **Test utilities:** Fixture factories in `src/__test-utils__/fixtures.ts` — use these instead of inline mocks
- **Mock patterns:** MSW for API mocking, `vi.mock()` for module mocks
- **E2E tests:** Playwright specs in `e2e/`. Run with `npx playwright test`
- Run unit tests: `npx vitest run` (single pass) or `npx vitest` (watch mode)

## Security Rules

- Credentials (API keys, tokens) must NEVER be persisted to localStorage or database
- The `sanitizer.ts` replaces real values with `YOUR_*` placeholders — always sanitize before DB writes
- Supabase RLS is the primary authorization layer — every new table needs RLS policies
- Clerk auth: `@twilio.com` email domain enforced in app code, not in Clerk config
- `browley@twilio.com` is hardcoded as prime super_admin

## Commit Conventions

- Short imperative subject line (50 chars max)
- No scope prefix needed — this is a single-app repo
