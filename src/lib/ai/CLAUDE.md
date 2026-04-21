# AI Integration

## Models

Configured in `config.ts`:
- `MODELS.chat` — `gpt-5.4` via `@ai-sdk/openai`. Used for streaming responses (demo scripts, copilot chat)
- `MODELS.fast` — `gpt-5.4-nano`. Used for structured generation (enrichment, parse-intent, recommendations, regeneration)

## AI SDK Patterns

This project uses Vercel AI SDK v6. Key imports:
- `import { generateText, streamText, convertToModelMessages, Output } from "ai"`
- `import { useChat } from "@ai-sdk/react"` (client-side)
- `import { DefaultChatTransport } from "ai"` (client-side transport)

Structured output: `Output.object({ schema: zodSchema })` with `zod/v4` schemas.

All AI calls include gateway tags for observability: `providerOptions: { gateway: { user: userId, tags: ["tag-name"] } }`

## Auth & Rate Limiting

- `requireAuthForAI()` — guards all AI routes. Returns `{ userId, error }`. Check error first, return 401 if present
- `aiChatRatelimit` — 30 requests/min per user (sliding window). Used by streaming routes
- `aiGenerateRatelimit` — 10 requests/min per user. Used by generation routes
- Both rate limiters are `null` if Upstash Redis is not configured (graceful degradation)

## System Prompt Builders

All in `system-prompts.ts`. Each appends to shared `SEGMENT_DOMAIN_KNOWLEDGE` context:
- `buildCopilotSystemPrompt(context?)` — AI chat assistant with playbook context
- `buildScriptSystemPrompt(playbook)` — demo script generation with persona-adapted tone
- `buildEnrichmentSystemPrompt(persona, industry, brand?)` — prompt enrichment with brand colors/tone
- `buildRecommendationSystemPrompt()` — scenario recommendation with impact scoring
- `buildParseIntentSystemPrompt()` — NL description to structured config extraction
- `buildRefineTemplateSystemPrompt()` — admin template editing assistant

## Segment Knowledge Tool

`tools/segment-knowledge.ts` provides a tool definition for the AI chat that surfaces Segment CDP domain knowledge (sources, destinations, protocols, unify, engage, functions, computed traits, privacy).
