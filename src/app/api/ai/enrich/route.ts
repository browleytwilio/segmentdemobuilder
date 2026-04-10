import { generateText } from "ai";
import { MODELS } from "@/lib/ai/config";
import { requireAuthForAI } from "@/lib/ai/auth";
import { aiGenerateRatelimit } from "@/lib/ai/rate-limit";
import { buildEnrichmentSystemPrompt } from "@/lib/ai/system-prompts";
import type { CompiledPrompt } from "@/lib/compiler/types";
import type { DemoArchitecture } from "@/lib/stores/builder-store";

export const maxDuration = 120;

interface EnrichRequestBody {
  prompts: CompiledPrompt[];
  context: {
    persona: string;
    industry: string;
    customerName: string;
    architecture: DemoArchitecture;
  };
}

export async function POST(req: Request) {
  const auth = await requireAuthForAI();
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: 401 });
  }

  if (aiGenerateRatelimit) {
    const { success } = await aiGenerateRatelimit.limit(auth.user!.id);
    if (!success) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  const { prompts, context } = (await req.json()) as EnrichRequestBody;
  const systemPrompt = buildEnrichmentSystemPrompt(context.persona, context.industry);

  const enrichedPrompts: CompiledPrompt[] = [];

  for (const prompt of prompts) {
    try {
      const { text } = await generateText({
        model: MODELS.fast,
        system: systemPrompt,
        prompt: `Enrich the following prompt for a ${context.industry} demo targeting a ${context.persona}. Customer: ${context.customerName}.\n\n---\n\n${prompt.promptText}`,
      });

      enrichedPrompts.push({
        ...prompt,
        promptText: text,
      });
    } catch {
      // If enrichment fails for one prompt, keep the original
      enrichedPrompts.push(prompt);
    }
  }

  return Response.json({ enrichedPrompts });
}
