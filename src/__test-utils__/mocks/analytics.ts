import { vi } from "vitest";

export function setupMockAnalytics() {
  const analytics = {
    track: vi.fn(),
    identify: vi.fn(),
    page: vi.fn(),
    reset: vi.fn(),
    ready: vi.fn(),
    load: vi.fn(),
  };
  Object.defineProperty(window, "analytics", {
    value: analytics,
    writable: true,
    configurable: true,
  });
  return analytics;
}

export function removeMockAnalytics() {
  Object.defineProperty(window, "analytics", {
    value: undefined,
    writable: true,
    configurable: true,
  });
}
