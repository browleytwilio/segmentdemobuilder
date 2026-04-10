import { streamText, convertToModelMessages, stepCountIs } from "ai";
import type { UIMessage } from "ai";
import { MODELS } from "@/lib/ai/config";
import { requireAuthForAI } from "@/lib/ai/auth";
import { aiChatRatelimit } from "@/lib/ai/rate-limit";
import { buildCopilotSystemPrompt } from "@/lib/ai/system-prompts";
import { segmentKnowledgeTool } from "@/lib/ai/tools/segment-knowledge";
import type { DemoArchitecture } from "@/lib/stores/builder-store";

export const maxDuration = 60;

interface ChatRequestBody {
  messages: UIMessage[];
  context?: {
    customerName?: string;
    industry?: string;
    persona?: string;
    architecture?: DemoArchitecture;
    selectedScenarios?: string[];
  };
}

export async function POST(req: Request) {
  const auth = await requireAuthForAI();
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: 401 });
  }

  if (aiChatRatelimit) {
    const { success } = await aiChatRatelimit.limit(auth.user!.id);
    if (!success) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  const { messages, context } = (await req.json()) as ChatRequestBody;

  const result = streamText({
    model: MODELS.chat,
    system: buildCopilotSystemPrompt(context),
    messages: await convertToModelMessages(messages),
    tools: { segmentKnowledge: segmentKnowledgeTool },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
