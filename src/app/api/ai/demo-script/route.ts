import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { z } from "zod/v4";
import { MODELS } from "@/lib/ai/config";
import { requireAuthForAI } from "@/lib/ai/auth";
import { aiGenerateRatelimit } from "@/lib/ai/rate-limit";
import { buildScriptSystemPrompt } from "@/lib/ai/system-prompts";
import type { DemoArchitecture } from "@/lib/stores/builder-store";

export const maxDuration = 60;

const scriptBodySchema = z.object({
  messages: z.array(z.record(z.string(), z.unknown())) as unknown as z.ZodType<UIMessage[]>,
  playbook: z.object({
    customerName: z.string(),
    persona: z.string(),
    industry: z.string(),
    scenarioSlugs: z.record(z.string(), z.string()),
    architecture: z.record(z.string(), z.boolean()) as unknown as z.ZodType<DemoArchitecture>,
  }),
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

  const body = scriptBodySchema.safeParse(await req.json());
  if (!body.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { messages, playbook } = body.data;

  try {
    const result = streamText({
      model: MODELS.chat,
      system: buildScriptSystemPrompt(playbook),
      messages: await convertToModelMessages(messages),
      providerOptions: {
        gateway: { user: auth.user!.id, tags: ["demo-script"] },
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[ai/demo-script] Streaming error:", err);
    return Response.json({ error: "AI service unavailable" }, { status: 502 });
  }
}
