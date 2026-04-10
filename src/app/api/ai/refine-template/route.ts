import { generateText } from "ai";
import { z } from "zod/v4";
import { MODELS } from "@/lib/ai/config";
import { requireAuthForAI } from "@/lib/ai/auth";
import { aiGenerateRatelimit } from "@/lib/ai/rate-limit";
import { buildRefineTemplateSystemPrompt } from "@/lib/ai/system-prompts";

export const maxDuration = 60;

const refineBodySchema = z.object({
  templateContent: z.string().min(1).max(50000),
  instruction: z.string().min(1).max(1000),
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

  const body = refineBodySchema.safeParse(await req.json());
  if (!body.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const result = await generateText({
      model: MODELS.fast,
      system: buildRefineTemplateSystemPrompt(),
      prompt: `## Current Template\n\n${body.data.templateContent}\n\n## Instruction\n\n${body.data.instruction}`,
      providerOptions: {
        gateway: { user: auth.user!.id, tags: ["refine-template"] },
      },
    });

    return Response.json({ refinedContent: result.text });
  } catch (err) {
    console.error("[ai/refine-template] Error:", err);
    return Response.json(
      { error: "Failed to refine template" },
      { status: 502 }
    );
  }
}
