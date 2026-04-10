import { generateText, Output } from "ai";
import { z } from "zod";
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
  suggestedScenarios: z.array(z.string()),
});

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

  const { description } = (await req.json()) as { description: string };

  const { output } = await generateText({
    model: MODELS.fast,
    system: buildParseIntentSystemPrompt(),
    prompt: description,
    output: Output.object({ schema: intentSchema }),
  });

  return Response.json(output);
}
