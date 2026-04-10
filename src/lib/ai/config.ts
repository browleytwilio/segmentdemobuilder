import { openai } from "@ai-sdk/openai";

export const MODELS = {
  chat: openai("gpt-5.4"),
  fast: openai("gpt-5.4-nano"),
} as const;
