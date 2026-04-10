import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { MODELS } from "@/lib/ai/config";
import { requireAuthForAI } from "@/lib/ai/auth";
import { aiGenerateRatelimit } from "@/lib/ai/rate-limit";
import { buildScriptSystemPrompt } from "@/lib/ai/system-prompts";
import type { DemoArchitecture } from "@/lib/stores/builder-store";

export const maxDuration = 60;

interface ScriptRequestBody {
  messages: UIMessage[];
  playbook: {
    customerName: string;
    persona: string;
    industry: string;
    scenarioSlugs: Record<string, string>;
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

  const { messages, playbook } = (await req.json()) as ScriptRequestBody;

  const result = streamText({
    model: MODELS.chat,
    system: buildScriptSystemPrompt(playbook),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
