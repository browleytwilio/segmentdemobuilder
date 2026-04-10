import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import {
  listComputedTraits,
  createComputedTrait,
  listAudiences,
  createAudience,
  type ProvisionResult,
} from "@/lib/segment/api";
import { ALL_COMPUTED_TRAITS } from "@/lib/segment/definitions/computed-traits";
import { ALL_AUDIENCES } from "@/lib/segment/definitions/audiences";

/**
 * POST /api/segment/provision
 *
 * Idempotent provisioning of all computed traits and audiences.
 * Admin-only: requires super_admin role.
 *
 * Skips resources that already exist (matched by name).
 * Returns a summary of created / skipped / failed resources.
 *
 * Note: Computed traits may return 403 if the API token lacks
 * Engage Admin permissions — these are logged as failed with
 * a hint to create them via the Segment UI instead.
 */
export async function POST() {
  // Auth: require super_admin
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "super_admin") {
    return Response.json({ error: "Forbidden: admin only" }, { status: 403 });
  }

  if (!process.env.SEGMENT_SPACE_ID) {
    return Response.json(
      { error: "SEGMENT_SPACE_ID not configured" },
      { status: 500 },
    );
  }

  const results: ProvisionResult[] = [];

  // ------------------------------------------------------------------
  // Computed Traits
  // ------------------------------------------------------------------
  let existingTraits: Map<string, string>;
  try {
    const traits = await listComputedTraits();
    existingTraits = new Map(traits.map((t) => [t.name, t.id]));
  } catch (err) {
    // If listing fails with 403, skip all computed traits gracefully
    const msg = String(err);
    if (msg.includes("403")) {
      for (const def of ALL_COMPUTED_TRAITS) {
        results.push({
          name: def.name,
          type: "computed_trait",
          status: "failed",
          error: "403 Forbidden — token lacks Engage Admin permissions. Create via Segment UI.",
        });
      }
    } else {
      return Response.json(
        { error: `Failed to list computed traits: ${err}` },
        { status: 502 },
      );
    }
    existingTraits = new Map();
  }

  // Only attempt creation if listing succeeded
  if (results.filter((r) => r.type === "computed_trait").length === 0) {
    for (const def of ALL_COMPUTED_TRAITS) {
      if (existingTraits.has(def.name)) {
        results.push({
          name: def.name,
          type: "computed_trait",
          status: "skipped",
          id: existingTraits.get(def.name),
        });
        continue;
      }

      try {
        const { id } = await createComputedTrait({
          name: def.name,
          description: def.description,
          enabled: true,
          definition: { query: def.query },
        });
        results.push({
          name: def.name,
          type: "computed_trait",
          status: "created",
          id,
        });
      } catch (err) {
        const msg = String(err);
        results.push({
          name: def.name,
          type: "computed_trait",
          status: "failed",
          error: msg.includes("403")
            ? "403 Forbidden — create via Segment UI (Unify > Computed Traits)"
            : msg,
        });
      }
    }
  }

  // ------------------------------------------------------------------
  // Audiences
  // ------------------------------------------------------------------
  let existingAudiences: Map<string, string>;
  try {
    const audiences = await listAudiences();
    existingAudiences = new Map(audiences.map((a) => [a.name, a.id]));
  } catch (err) {
    return Response.json(
      { error: `Failed to list audiences: ${err}` },
      { status: 502 },
    );
  }

  for (const def of ALL_AUDIENCES) {
    if (existingAudiences.has(def.name)) {
      results.push({
        name: def.name,
        type: "audience",
        status: "skipped",
        id: existingAudiences.get(def.name),
      });
      continue;
    }

    try {
      const { id } = await createAudience(def);
      results.push({
        name: def.name,
        type: "audience",
        status: "created",
        id,
      });
    } catch (err) {
      results.push({
        name: def.name,
        type: "audience",
        status: "failed",
        error: String(err),
      });
    }
  }

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  const summary = {
    total: results.length,
    created: results.filter((r) => r.status === "created").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
  };

  return Response.json({ summary, results });
}
