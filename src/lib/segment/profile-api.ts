/**
 * Segment Profile API client for reading enriched user profiles.
 * Used to verify computed traits and audience memberships.
 * Docs: https://segment.com/docs/unify/profile-api/
 */

const BASE_URL = "https://profiles.segment.com/v1";
const ACCESS_TOKEN = process.env.SEGMENT_UNIFY_ACCESS_TOKEN ?? "";
const SPACE_ID = process.env.SEGMENT_SPACE_ID ?? "";

function headers() {
  return {
    Authorization: `Basic ${btoa(`${ACCESS_TOKEN}:`)}`,
    "Content-Type": "application/json",
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProfileTraits {
  [key: string]: unknown;
}

export interface ProfileAudiences {
  [audienceKey: string]: boolean;
}

export interface ProfileResponse {
  traits: ProfileTraits;
  cursor?: { has_more: boolean; next: string };
}

// ---------------------------------------------------------------------------
// Trait Lookup
// ---------------------------------------------------------------------------

/**
 * Fetch all traits (identify traits + computed traits) for a user.
 * Identifier format: "user_id:{clerkId}" or "email:{email}"
 */
export async function getUserTraits(
  identifier: string
): Promise<ProfileTraits> {
  const url = `${BASE_URL}/spaces/${SPACE_ID}/collections/users/profiles/${identifier}/traits`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });

  if (!res.ok) {
    if (res.status === 404) return {};
    throw new Error(`Profile API traits failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  return json.traits ?? {};
}

// ---------------------------------------------------------------------------
// Audience Membership
// ---------------------------------------------------------------------------

/**
 * Fetch all audience memberships for a user.
 * Returns an object of audience_key → boolean.
 */
export async function getUserAudiences(
  identifier: string
): Promise<ProfileAudiences> {
  const url = `${BASE_URL}/spaces/${SPACE_ID}/collections/users/profiles/${identifier}/audiences`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });

  if (!res.ok) {
    if (res.status === 404) return {};
    throw new Error(`Profile API audiences failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  return json.audiences ?? {};
}

/**
 * Fetch recent events for a user (for debugging/verification).
 */
export async function getUserEvents(
  identifier: string,
  limit = 20
): Promise<Record<string, unknown>[]> {
  const url = `${BASE_URL}/spaces/${SPACE_ID}/collections/users/profiles/${identifier}/events?limit=${limit}`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Profile API events failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  return json.data ?? [];
}
