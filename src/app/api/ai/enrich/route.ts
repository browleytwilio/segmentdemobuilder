import { generateText } from "ai";
import { z } from "zod/v4";
import { MODELS } from "@/lib/ai/config";
import { requireAuthForAI } from "@/lib/ai/auth";
import { aiGenerateRatelimit } from "@/lib/ai/rate-limit";
import { buildEnrichmentSystemPrompt } from "@/lib/ai/system-prompts";
import type { CompiledPrompt } from "@/lib/compiler/types";

export const maxDuration = 120;

const enrichBodySchema = z.object({
  prompts: z.array(z.object({
    stepNumber: z.number(),
    title: z.string(),
    promptText: z.string(),
  }).passthrough()) as unknown as z.ZodType<CompiledPrompt[]>,
  context: z.object({
    persona: z.string(),
    industry: z.string(),
    customerName: z.string(),
    architecture: z.record(z.string(), z.unknown()),
    productName: z.string().optional(),
    tagline: z.string().optional(),
    primaryColor: z.string().optional(),
    accentColor: z.string().optional(),
    voiceTone: z.string().optional(),
  }),
});

export async function POST(req: Request) {
  const auth = await requireAuthForAI();
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: 401 });
  }

  if (aiGenerateRatelimit) {
    const { success } = await aiGenerateRatelimit.limit(auth.userId!);
    if (!success) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  const body = enrichBodySchema.safeParse(await req.json());
  if (!body.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { prompts, context } = body.data;
  const systemPrompt = buildEnrichmentSystemPrompt(context.persona, context.industry, {
    productName: context.productName,
    tagline: context.tagline,
    primaryColor: context.primaryColor,
    accentColor: context.accentColor,
    voiceTone: context.voiceTone,
  });

  try {
    const results = await Promise.allSettled(
      prompts.map(async (prompt) => {
        const { text } = await generateText({
          model: MODELS.fast,
          system: systemPrompt,
          prompt: `Enrich the following prompt for a ${context.industry} demo targeting a ${context.persona}. Customer: ${context.customerName}.${context.productName ? ` Product: ${context.productName}.` : ""}${context.tagline ? ` Tagline: "${context.tagline}".` : ""}\n\n---\n\n${prompt.promptText}`,
          providerOptions: {
            gateway: { user: auth.userId!, tags: ["enrichment"] },
          },
        });
        return { ...prompt, promptText: text };
      })
    );

    const enrichedPrompts = results.map((result, i) =>
      result.status === "fulfilled" ? result.value : prompts[i]
    );

    return Response.json({ enrichedPrompts });
  } catch (err) {
    console.error("[ai/enrich] Enrichment error:", err);
    return Response.json({ error: "Enrichment failed" }, { status: 502 });
  }
}
