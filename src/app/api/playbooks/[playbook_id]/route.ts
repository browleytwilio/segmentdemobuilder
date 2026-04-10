import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ playbook_id: string }> }
) {
  const { playbook_id } = await params;

  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();

  let body: { generated_prompts: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.generated_prompts)) {
    return Response.json(
      { error: "generated_prompts must be an array" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("playbooks")
    .update({
      generated_prompts: body.generated_prompts,
      status: "completed" as const,
    })
    .eq("id", playbook_id)
    .eq("user_id", userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
