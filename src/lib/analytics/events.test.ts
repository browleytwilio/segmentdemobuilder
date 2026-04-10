import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  setupMockAnalytics,
  removeMockAnalytics,
} from "@/__test-utils__/mocks/analytics";
import { trackEvent, identifyUser, resetAnalytics } from "./events";

describe("trackEvent", () => {
  let analytics: ReturnType<typeof setupMockAnalytics>;

  beforeEach(() => {
    analytics = setupMockAnalytics();
  });

  afterEach(() => {
    removeMockAnalytics();
  });

  it("calls analytics.track with event name and properties", () => {
    trackEvent("CTA Clicked", { cta: "hero", location: "header" });
    expect(analytics.track).toHaveBeenCalledWith("CTA Clicked", {
      cta: "hero",
      location: "header",
    });
  });

  it("does not throw when window.analytics is undefined", () => {
    removeMockAnalytics();
    expect(() =>
      trackEvent("CTA Clicked", { cta: "hero", location: "header" }),
    ).not.toThrow();
  });

  it("does not throw when window.analytics is missing entirely", () => {
    removeMockAnalytics();
    expect(() =>
      trackEvent("Theme Toggled", { theme: "dark" }),
    ).not.toThrow();
  });
});

describe("identifyUser", () => {
  let analytics: ReturnType<typeof setupMockAnalytics>;

  beforeEach(() => {
    analytics = setupMockAnalytics();
  });

  afterEach(() => {
    removeMockAnalytics();
  });

  it("calls analytics.identify with userId and traits", () => {
    identifyUser("user-123", { email: "test@example.com", role: "user" });
    expect(analytics.identify).toHaveBeenCalledWith("user-123", {
      email: "test@example.com",
      role: "user",
    });
  });

  it("does not throw when window.analytics is undefined", () => {
    removeMockAnalytics();
    expect(() =>
      identifyUser("user-123", { email: "test@example.com" }),
    ).not.toThrow();
  });
});

describe("resetAnalytics", () => {
  let analytics: ReturnType<typeof setupMockAnalytics>;

  beforeEach(() => {
    analytics = setupMockAnalytics();
  });

  afterEach(() => {
    removeMockAnalytics();
  });

  it("calls analytics.reset", () => {
    resetAnalytics();
    expect(analytics.reset).toHaveBeenCalled();
  });

  it("does not throw when window.analytics is undefined", () => {
    removeMockAnalytics();
    expect(() => resetAnalytics()).not.toThrow();
  });

  it("does not throw when window.analytics is missing", () => {
    removeMockAnalytics();
    expect(() => resetAnalytics()).not.toThrow();
  });
});
