import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ playbook_id: string }> }
) {
  const { playbook_id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

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
    .eq("user_id", user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
