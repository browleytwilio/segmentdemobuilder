import type { SegmentPageProperties } from "./types";

/**
 * Fire an analytics.page() call.
 * Called automatically by AnalyticsProvider on route changes.
 */
export function trackPage(
  name?: string,
  properties?: SegmentPageProperties,
): void {
  if (typeof window !== "undefined" && window.analytics) {
    window.analytics.page(name, properties);
  }
}
