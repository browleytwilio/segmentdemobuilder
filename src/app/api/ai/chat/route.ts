import { streamText, convertToModelMessages, stepCountIs } from "ai";
import type { UIMessage } from "ai";
import { z } from "zod/v4";
import { MODELS } from "@/lib/ai/config";
import { requireAuthForAI } from "@/lib/ai/auth";
import { aiChatRatelimit } from "@/lib/ai/rate-limit";
import { buildCopilotSystemPrompt } from "@/lib/ai/system-prompts";
import { segmentKnowledgeTool } from "@/lib/ai/tools/segment-knowledge";
import type { DemoArchitecture } from "@/lib/stores/builder-store";

export const maxDuration = 60;

const chatBodySchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().optional(),
    parts: z.array(z.record(z.string(), z.unknown())).optional(),
  }).passthrough()) as unknown as z.ZodType<UIMessage[]>,
  context: z.object({
    customerName: z.string().optional(),
    industry: z.string().optional(),
    persona: z.string().optional(),
    architecture: z.record(z.string(), z.boolean()).optional(),
    selectedScenarios: z.array(z.string()).optional(),
  }).optional(),
});

export async function POST(req: Request) {
  const auth = await requireAuthForAI();
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: 401 });
  }

  if (aiChatRatelimit) {
    const { success } = await aiChatRatelimit.limit(auth.userId!);
    if (!success) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  const body = chatBodySchema.safeParse(await req.json());
  if (!body.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { messages, context } = body.data;

  try {
    const result = streamText({
      model: MODELS.chat,
      system: buildCopilotSystemPrompt(
        context
          ? { ...context, architecture: context.architecture as DemoArchitecture | undefined }
          : undefined
      ),
      messages: await convertToModelMessages(messages),
      tools: { segmentKnowledge: segmentKnowledgeTool },
      stopWhen: stepCountIs(3),
      providerOptions: {
        gateway: { user: auth.userId!, tags: ["chat"] },
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[ai/chat] Streaming error:", err);
    return Response.json({ error: "AI service unavailable" }, { status: 502 });
  }
}
