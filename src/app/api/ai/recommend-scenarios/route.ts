import { generateText, Output } from "ai";
import { z } from "zod/v4";
import { MODELS } from "@/lib/ai/config";
import { requireAuthForAI } from "@/lib/ai/auth";
import { aiGenerateRatelimit } from "@/lib/ai/rate-limit";
import { buildRecommendationSystemPrompt } from "@/lib/ai/system-prompts";

export const maxDuration = 30;

const recommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      scenarioSlug: z.string(),
      reasoning: z.string(),
      impactScore: z.number().min(1).max(10),
    })
  ),
  summary: z.string(),
});

const recommendBodySchema = z.object({
  customerName: z.string().max(200),
  industry: z.string().max(100),
  persona: z.string().max(100),
  architecture: z.record(z.string(), z.boolean()),
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

  const body = recommendBodySchema.safeParse(await req.json());
  if (!body.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { customerName, industry, persona, architecture } = body.data;

  const features = Object.entries(architecture)
    .filter(([, v]) => v)
    .map(([k]) => k);

  try {
    const { output } = await generateText({
      model: MODELS.fast,
      system: buildRecommendationSystemPrompt(),
      prompt: `Recommend demo scenarios for:
- Customer: ${customerName || "Unknown"}
- Industry: ${industry}
- Persona: ${persona}
- Enabled architecture: ${features.join(", ") || "defaults only"}

Return the best scenarios for this prospect with reasoning.`,
      output: Output.object({ schema: recommendationSchema }),
      providerOptions: {
        gateway: { user: auth.user!.id, tags: ["recommendations"] },
      },
    });

    if (!output) {
      return Response.json(
        { error: "Failed to generate recommendations" },
        { status: 502 }
      );
    }

    return Response.json(output);
  } catch (err) {
    console.error("[ai/recommend-scenarios] Error:", err);
    return Response.json(
      { error: "Failed to generate recommendations" },
      { status: 502 }
    );
  }
}
