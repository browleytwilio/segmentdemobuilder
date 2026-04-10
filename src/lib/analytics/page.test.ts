import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  setupMockAnalytics,
  removeMockAnalytics,
} from "@/__test-utils__/mocks/analytics";
import { trackPage } from "./page";

describe("trackPage", () => {
  let analytics: ReturnType<typeof setupMockAnalytics>;

  beforeEach(() => {
    analytics = setupMockAnalytics();
  });

  afterEach(() => {
    removeMockAnalytics();
  });

  it("calls analytics.page with name and properties", () => {
    trackPage("Dashboard", { total_playbooks: 5, drafts: 2, completed: 3 });
    expect(analytics.page).toHaveBeenCalledWith("Dashboard", {
      total_playbooks: 5,
      drafts: 2,
      completed: 3,
    });
  });

  it("calls analytics.page with no arguments", () => {
    trackPage();
    expect(analytics.page).toHaveBeenCalledWith(undefined, undefined);
  });

  it("does not throw when window.analytics is undefined", () => {
    removeMockAnalytics();
    expect(() => trackPage("Home")).not.toThrow();
  });

  it("handles undefined analytics gracefully", () => {
    removeMockAnalytics();
    expect(() => trackPage("Home", { playbook_id: "abc" })).not.toThrow();
  });
});
