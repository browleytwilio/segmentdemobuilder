/**
 * Server-side Segment tracking via the HTTP Tracking API.
 * Used for events that originate in API routes / webhooks where
 * the browser analytics.js snippet is unavailable.
 */

import type { SegmentEventMap } from "./types";

const WRITE_KEY = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY;
const SEGMENT_API = "https://api.segment.io/v1/track";

/**
 * Fire a Segment track() call from the server.
 * Accepts the same typed event map as the client-side `trackEvent`.
 *
 * - If a `userId` is available, pass it.
 * - For pre-auth events (e.g. signup rejection), pass `anonymousId` instead.
 */
export async function trackServerEvent<E extends keyof SegmentEventMap>(
  event: E,
  properties: SegmentEventMap[E],
  identity: { userId: string } | { anonymousId: string },
): Promise<void> {
  if (!WRITE_KEY) return;

  try {
    await fetch(SEGMENT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${WRITE_KEY}:`)}`,
      },
      body: JSON.stringify({
        ...identity,
        event,
        properties,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Best-effort — don't let tracking failures break server logic
    console.warn(`[Segment] Failed to track server event: ${event}`);
  }
}
