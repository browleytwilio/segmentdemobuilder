import { gateway } from "@ai-sdk/gateway";

export const MODELS = {
  chat: gateway("openai/gpt-5.4"),
  fast: gateway("openai/gpt-5.4-nano"),
} as const;
