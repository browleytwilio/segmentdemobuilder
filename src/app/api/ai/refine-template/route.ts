import { streamText } from "ai";
import { MODELS } from "@/lib/ai/config";
import { requireAuthForAI } from "@/lib/ai/auth";
import { aiGenerateRatelimit } from "@/lib/ai/rate-limit";
import { buildRefineTemplateSystemPrompt } from "@/lib/ai/system-prompts";

export const maxDuration = 60;

interface RefineRequestBody {
  templateContent: string;
  instruction: string;
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

  const { templateContent, instruction } =
    (await req.json()) as RefineRequestBody;

  const result = streamText({
    model: MODELS.chat,
    system: buildRefineTemplateSystemPrompt(),
    prompt: `## Current Template\n\n${templateContent}\n\n## Instruction\n\n${instruction}`,
  });

  return result.toUIMessageStreamResponse();
}
