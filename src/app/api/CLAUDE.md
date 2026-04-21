# API Route Conventions

## Zod Import Rule

- **AI routes** (`api/ai/*`): `import { z } from "zod/v4"` — required by AI SDK v6 for `Output.object()` structured output
- **Everything else** (form schemas, non-AI routes): `import { z } from "zod"` — standard Zod

Mixing these up causes runtime schema errors. The AI SDK validates that the schema is a Zod v4 instance.

## AI Route Pattern

All 7 routes in `api/ai/` follow this structure:

```typescript
export const maxDuration = 120;  // or 60 for lighter routes

const bodySchema = z.object({ /* ... */ });

export async function POST(req: Request) {
  // 1. Auth guard
  const auth = await requireAuthForAI();
  if (auth.error) return Response.json({ error: auth.error }, { status: 401 });

  // 2. Rate limit
  if (aiGenerateRatelimit) {
    const { success } = await aiGenerateRatelimit.limit(auth.userId!);
    if (!success) return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  // 3. Validate body
  const body = bodySchema.safeParse(await req.json());
  if (!body.success) return Response.json({ error: "Invalid request body" }, { status: 400 });

  // 4. AI call (try/catch)
  try {
    // generateText or streamText with gateway tags
  } catch (err) {
    console.error("[ai/route-name] Error:", err);
    return Response.json({ error: "..." }, { status: 502 });
  }
}
```

## Clerk Webhook

`api/webhooks/clerk/route.ts` handles `user.created` events. It verifies the Svix signature, enforces `@twilio.com` domain, and upserts the `profiles` table with the Clerk user ID (TEXT, not UUID).

## Non-AI Routes

- `api/playbooks/[playbook_id]` — PATCH to update generated_prompts
- `api/dependencies/versions` — fetches latest NPM versions for compilation
- `api/segment/provision` — provisions Segment sources/destinations
