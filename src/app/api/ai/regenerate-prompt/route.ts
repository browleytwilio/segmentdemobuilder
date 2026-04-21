import { generateText } from "ai";
import { z } from "zod/v4";
import { MODELS } from "@/lib/ai/config";
import { requireAuthForAI } from "@/lib/ai/auth";
import { aiGenerateRatelimit } from "@/lib/ai/rate-limit";

export const maxDuration = 60;

const bodySchema = z.object({
  prompt: z.object({
    stepNumber: z.number(),
    title: z.string(),
    promptText: z.string(),
    expectedOutput: z.string(),
  }),
  context: z.object({
    persona: z.string(),
    industry: z.string(),
    customerName: z.string(),
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

  const body = bodySchema.safeParse(await req.json());
  if (!body.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { prompt, context } = body.data;

  try {
    const { text } = await generateText({
      model: MODELS.fast,
      system: `You are an expert Segment CDP Solutions Engineer. You write step-by-step build prompts for AI coding agents. The prompt must be technically precise, include exact code, and follow the same format as the original.`,
      prompt: `Regenerate the following build prompt for a ${context.industry} demo targeting a ${context.persona}. Customer: ${context.customerName}.${context.productName ? ` Product: ${context.productName}.` : ""}${context.tagline ? ` Tagline: "${context.tagline}".` : ""}

Step ${prompt.stepNumber}: ${prompt.title}
Expected output: ${prompt.expectedOutput}

Original prompt:
${prompt.promptText}

Write an improved version of this prompt. Keep the same step number, title, and expected output. Improve the clarity, accuracy, and completeness of the instructions.`,
      providerOptions: {
        gateway: { user: auth.userId!, tags: ["regeneration"] },
      },
    });

    return Response.json({
      prompt: {
        ...prompt,
        promptText: text,
      },
    });
  } catch (err) {
    console.error("[ai/regenerate-prompt] Error:", err);
    return Response.json({ error: "Regeneration failed" }, { status: 502 });
  }
}
