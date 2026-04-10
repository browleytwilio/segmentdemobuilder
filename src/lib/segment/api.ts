/**
 * Segment Public API client for managing computed traits and audiences.
 * Docs: https://docs.segmentapis.com
 */

const BASE_URL = "https://api.segmentapis.com";
const TOKEN = process.env.SEGMENT_PUBLIC_API_TOKEN ?? "";
const SPACE_ID = process.env.SEGMENT_SPACE_ID ?? "";

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SegmentApiResponse<T> {
  data: T;
}

export interface ComputedTraitSummary {
  id: string;
  spaceId: string;
  name: string;
  description: string;
  status: string;
}

export interface AudienceSummary {
  id: string;
  spaceId: string;
  name: string;
  description: string;
  status: string;
}

export interface ComputedTraitDefinition {
  name: string;
  description: string;
  definition: Record<string, unknown>;
  enabled: boolean;
}

export interface AudienceDefinition {
  name: string;
  description: string;
  definition: Record<string, unknown>;
  enabled: boolean;
}

export interface ProvisionResult {
  name: string;
  type: "computed_trait" | "audience";
  status: "created" | "skipped" | "failed";
  id?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Space
// ---------------------------------------------------------------------------

export async function getSpaces() {
  const res = await fetch(`${BASE_URL}/spaces`, { headers: headers() });
  if (!res.ok) throw new Error(`GET /spaces failed: ${res.status}`);
  return res.json() as Promise<SegmentApiResponse<{ spaces: { id: string; name: string }[] }>>;
}

// ---------------------------------------------------------------------------
// Computed Traits
// ---------------------------------------------------------------------------

export async function listComputedTraits(): Promise<ComputedTraitSummary[]> {
  const all: ComputedTraitSummary[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL(`${BASE_URL}/spaces/${SPACE_ID}/computed-traits`);
    url.searchParams.set("pagination.count", "200");
    if (cursor) url.searchParams.set("pagination.cursor", cursor);

    const res = await fetch(url.toString(), { headers: headers() });
    if (!res.ok) throw new Error(`GET computed-traits failed: ${res.status}`);

    const body = await res.json();
    const traits = body.data?.computedTraits ?? [];
    all.push(...traits);
    cursor = body.data?.pagination?.next;
  } while (cursor);

  return all;
}

export async function createComputedTrait(
  def: ComputedTraitDefinition
): Promise<{ id: string }> {
  const res = await fetch(`${BASE_URL}/spaces/${SPACE_ID}/computed-traits`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ computedTrait: def }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`POST computed-trait "${def.name}" failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return { id: json.data?.computedTrait?.id ?? "unknown" };
}

// ---------------------------------------------------------------------------
// Audiences
// ---------------------------------------------------------------------------

export async function listAudiences(): Promise<AudienceSummary[]> {
  const all: AudienceSummary[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL(`${BASE_URL}/spaces/${SPACE_ID}/audiences`);
    url.searchParams.set("pagination.count", "200");
    if (cursor) url.searchParams.set("pagination.cursor", cursor);

    const res = await fetch(url.toString(), { headers: headers() });
    if (!res.ok) throw new Error(`GET audiences failed: ${res.status}`);

    const body = await res.json();
    const audiences = body.data?.audiences ?? [];
    all.push(...audiences);
    cursor = body.data?.pagination?.next;
  } while (cursor);

  return all;
}

export async function createAudience(
  def: AudienceDefinition
): Promise<{ id: string }> {
  const res = await fetch(`${BASE_URL}/spaces/${SPACE_ID}/audiences`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ audience: def }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`POST audience "${def.name}" failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return { id: json.data?.audience?.id ?? "unknown" };
}
