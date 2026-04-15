import { generateText, Output } from "ai";
import { z } from "zod/v4";
import { MODELS } from "@/lib/ai/config";
import { requireAuthForAI } from "@/lib/ai/auth";
import { aiGenerateRatelimit } from "@/lib/ai/rate-limit";
import { buildParseIntentSystemPrompt } from "@/lib/ai/system-prompts";

export const maxDuration = 30;

const intentSchema = z.object({
  customerName: z.string(),
  industry: z.enum([
    "E-commerce / Retail",
    "B2B SaaS",
    "FinTech",
    "Media & Entertainment",
  ]),
  persona: z.enum(["CMO", "CTO / Engineering", "Product Manager", "Data Team"]),
  architecture: z.object({
    enableSESidebar: z.boolean(),
    enableSeededProfiles: z.boolean(),
    enableProfileAPI: z.boolean(),
    enableIntentPredictions: z.boolean(),
    enableSecondPagePers: z.boolean(),
  }),
  databaseProvider: z.enum(["supabase", "neon", "generic-postgres"]),
  authProvider: z.enum(["none", "clerk", "nextauth", "supabase-auth", "better-auth"]),
  suggestedScenarios: z.array(z.string()),
});

const parseIntentBodySchema = z.object({
  description: z.string().min(1).max(2000),
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

  const body = parseIntentBodySchema.safeParse(await req.json());
  if (!body.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { output } = await generateText({
      model: MODELS.fast,
      system: buildParseIntentSystemPrompt(),
      prompt: body.data.description,
      output: Output.object({ schema: intentSchema }),
      providerOptions: {
        gateway: { user: auth.userId!, tags: ["parse-intent"] },
      },
    });

    if (!output) {
      return Response.json(
        { error: "Could not parse description" },
        { status: 502 }
      );
    }

    return Response.json(output);
  } catch (err) {
    console.error("[ai/parse-intent] Error:", err);
    return Response.json(
      { error: "Could not parse description" },
      { status: 502 }
    );
  }
}
