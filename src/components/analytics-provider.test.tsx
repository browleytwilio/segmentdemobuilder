import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────────────────────────────
const mockLoadAnalytics = vi.fn();
const mockTrackPage = vi.fn();
const mockIdentifyUser = vi.fn();

let mockClerkUser: { id: string; primaryEmailAddress?: { emailAddress: string }; createdAt?: Date } | null = null;
let mockClerkIsLoaded = true;

vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(() => ({ user: mockClerkUser, isLoaded: mockClerkIsLoaded })),
}));

vi.mock("@/lib/analytics/snippet", () => ({
  loadAnalytics: (...args: unknown[]) => mockLoadAnalytics(...args),
}));

vi.mock("@/lib/analytics/page", () => ({
  trackPage: (...args: unknown[]) => mockTrackPage(...args),
}));

vi.mock("@/lib/analytics/events", () => ({
  identifyUser: (...args: unknown[]) => mockIdentifyUser(...args),
}));

beforeEach(() => {
  mockLoadAnalytics.mockClear();
  mockTrackPage.mockClear();
  mockIdentifyUser.mockClear();
  mockClerkUser = null;
  mockClerkIsLoaded = true;
  vi.resetModules();
});

// Helper: dynamically import the component so WRITE_KEY picks up the
// env var that was set *before* the import.
async function importProvider() {
  const mod = await import("./analytics-provider");
  return mod.AnalyticsProvider;
}

describe("AnalyticsProvider", () => {
  it("renders children content", async () => {
    const AnalyticsProvider = await importProvider();
    render(
      <AnalyticsProvider>
        <p>hello world</p>
      </AnalyticsProvider>,
    );
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("calls loadAnalytics with the write key when env var is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SEGMENT_WRITE_KEY", "test-write-key");
    const AnalyticsProvider = await importProvider();

    render(
      <AnalyticsProvider>
        <span>child</span>
      </AnalyticsProvider>,
    );

    await waitFor(() => {
      expect(mockLoadAnalytics).toHaveBeenCalledWith("test-write-key");
    });
    vi.unstubAllEnvs();
  });

  it("does not call loadAnalytics when env var is empty", async () => {
    vi.stubEnv("NEXT_PUBLIC_SEGMENT_WRITE_KEY", "");
    const AnalyticsProvider = await importProvider();

    render(
      <AnalyticsProvider>
        <span>child</span>
      </AnalyticsProvider>,
    );

    expect(mockLoadAnalytics).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("identifies an authenticated user via Clerk", async () => {
    vi.stubEnv("NEXT_PUBLIC_SEGMENT_WRITE_KEY", "test-write-key");

    mockClerkUser = {
      id: "user-abc",
      primaryEmailAddress: { emailAddress: "test@example.com" },
      createdAt: new Date("2024-01-01"),
    };

    const AnalyticsProvider = await importProvider();

    render(
      <AnalyticsProvider>
        <span>child</span>
      </AnalyticsProvider>,
    );

    await waitFor(() => {
      expect(mockIdentifyUser).toHaveBeenCalledWith("user-abc", {
        email: "test@example.com",
        created_at: new Date("2024-01-01").toISOString(),
      });
    });
    vi.unstubAllEnvs();
  });

  it("does not identify user when Clerk returns null user", async () => {
    vi.stubEnv("NEXT_PUBLIC_SEGMENT_WRITE_KEY", "test-write-key");

    mockClerkUser = null;

    const AnalyticsProvider = await importProvider();

    render(
      <AnalyticsProvider>
        <span>child</span>
      </AnalyticsProvider>,
    );

    // Give the identify flow time to settle
    await waitFor(() => {
      expect(mockClerkIsLoaded).toBe(true);
    });
    expect(mockIdentifyUser).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});
