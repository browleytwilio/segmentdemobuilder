import { describe, it, expect, beforeEach } from "vitest";
import { loadAnalytics } from "./snippet";

describe("loadAnalytics", () => {
  beforeEach(() => {
    // Start each test with no analytics on window
    Object.defineProperty(window, "analytics", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    // Remove any injected script tags
    document.querySelectorAll("script").forEach((s) => s.remove());
  });

  it("sets invoked to true", () => {
    loadAnalytics("test-key");
    expect(window.analytics.invoked).toBe(true);
  });

  it("creates method stubs for all expected methods", () => {
    loadAnalytics("test-key");
    const expectedMethods = [
      "trackSubmit",
      "trackClick",
      "trackLink",
      "trackForm",
      "pageview",
      "identify",
      "reset",
      "group",
      "track",
      "ready",
      "alias",
      "debug",
      "page",
      "screen",
      "once",
      "off",
      "on",
      "addSourceMiddleware",
      "addIntegrationMiddleware",
      "setAnonymousId",
      "addDestinationMiddleware",
      "register",
    ];
    for (const method of expectedMethods) {
      expect(typeof (window.analytics as any)[method]).toBe("function");
    }
  });

  it("sets SNIPPET_VERSION to 5.2.1", () => {
    loadAnalytics("test-key");
    expect(window.analytics.SNIPPET_VERSION).toBe("5.2.1");
  });

  it("injects a script tag pointing to the Segment CDN", () => {
    // Add a dummy script so getElementsByTagName("script")[0] returns something
    const dummy = document.createElement("script");
    document.head.appendChild(dummy);

    loadAnalytics("my-write-key");

    const scripts = document.querySelectorAll("script");
    const segmentScript = Array.from(scripts).find((s) =>
      s.src.includes("cdn.segment.com"),
    );
    expect(segmentScript).toBeDefined();
    expect(segmentScript!.src).toBe(
      "https://cdn.segment.com/analytics.js/v1/my-write-key/analytics.min.js",
    );
    expect(segmentScript!.async).toBe(true);
  });

  it("prevents double-loading when called twice", () => {
    const dummy = document.createElement("script");
    document.head.appendChild(dummy);

    loadAnalytics("key-1");
    loadAnalytics("key-2");

    const scripts = document.querySelectorAll("script");
    const segmentScripts = Array.from(scripts).filter((s) =>
      s.src.includes("cdn.segment.com"),
    );
    expect(segmentScripts).toHaveLength(1);
  });

  it("stores methods array on analytics object", () => {
    loadAnalytics("test-key");
    expect(window.analytics.methods).toEqual(
      expect.arrayContaining(["track", "identify", "page", "reset"]),
    );
  });
});
