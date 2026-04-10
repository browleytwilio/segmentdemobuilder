import type { SegmentEventMap, SegmentUserTraits } from "./types";

/**
 * Type-safe wrapper around analytics.track().
 * Every call is compile-time checked against the SegmentEventMap.
 */
export function trackEvent<E extends keyof SegmentEventMap>(
  event: E,
  properties: SegmentEventMap[E],
): void {
  if (typeof window !== "undefined" && window.analytics) {
    window.analytics.track(event, properties as Record<string, unknown>);
  }
}

/**
 * Identify the current user with Segment.
 */
export function identifyUser(
  userId: string,
  traits: SegmentUserTraits,
): void {
  if (typeof window !== "undefined" && window.analytics) {
    window.analytics.identify(userId, traits);
  }
}

/**
 * Reset analytics identity (call on logout).
 * Generates a new anonymous ID for subsequent events.
 */
export function resetAnalytics(): void {
  if (typeof window !== "undefined" && window.analytics) {
    window.analytics.reset();
  }
}
