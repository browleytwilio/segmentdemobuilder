import { Webhook } from "svix";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { clerkClient, type WebhookEvent } from "@clerk/nextjs/server";
import { trackServerEvent } from "@/lib/analytics/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyWebhook(req: Request): Promise<WebhookEvent> {
  const body = await req.text();
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error("Missing svix headers");
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  return wh.verify(body, {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  }) as WebhookEvent;
}

function getPrimaryEmail(
  data: { email_addresses?: Array<{ id: string; email_address: string }>; primary_email_address_id?: string | null }
): string | undefined {
  return data.email_addresses?.find(
    (e) => e.id === data.primary_email_address_id
  )?.email_address;
}

export async function POST(req: Request) {
  let event: WebhookEvent;
  try {
    event = await verifyWebhook(req);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  switch (event.type) {
    case "user.created": {
      const clerkId = event.data.id;
      const email = getPrimaryEmail(event.data);

      // Reject non-Twilio signups
      if (!email?.endsWith("@twilio.com")) {
        const clerk = await clerkClient();
        await clerk.users.deleteUser(clerkId);
        console.warn(`Signup rejected: non-Twilio email (${email ?? "unknown"})`);
        await trackServerEvent(
          "Signup Rejected",
          { email_domain: email?.split("@")[1] ?? "unknown" },
          { anonymousId: clerkId },
        );
        return Response.json({ rejected: "domain_not_allowed" });
      }

      // Check for existing profile with the same email (migration path)
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (existing) {
        // Migrate: update profile ID from old UUID to Clerk ID
        // ON UPDATE CASCADE propagates to playbooks.user_id
        await supabaseAdmin
          .from("profiles")
          .update({ id: clerkId })
          .eq("id", existing.id);
      } else {
        // New user: insert profile row
        // promote_prime_admin trigger fires on INSERT and handles super_admin promotion
        await supabaseAdmin
          .from("profiles")
          .insert({ id: clerkId, email });
      }
      break;
    }

    case "user.updated": {
      const clerkId = event.data.id;
      const email = getPrimaryEmail(event.data);
      if (email) {
        await supabaseAdmin
          .from("profiles")
          .update({ email })
          .eq("id", clerkId);
      }
      break;
    }

    case "user.deleted": {
      const clerkId = event.data.id;
      if (clerkId) {
        // ON DELETE CASCADE removes playbooks automatically
        await supabaseAdmin.from("profiles").delete().eq("id", clerkId);
      }
      break;
    }
  }

  return Response.json({ received: true });
}
