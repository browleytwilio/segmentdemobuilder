import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────────────────────────────
const mockLoadAnalytics = vi.fn();
const mockTrackPage = vi.fn();
const mockIdentifyUser = vi.fn();
const mockTrackEvent = vi.fn();
const mockGetUser = vi.fn(() =>
  Promise.resolve({ data: { user: null } }),
);

vi.mock("@/lib/analytics/snippet", () => ({
  loadAnalytics: (...args: unknown[]) => mockLoadAnalytics(...args),
}));

vi.mock("@/lib/analytics/page", () => ({
  trackPage: (...args: unknown[]) => mockTrackPage(...args),
}));

vi.mock("@/lib/analytics/events", () => ({
  identifyUser: (...args: unknown[]) => mockIdentifyUser(...args),
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

beforeEach(() => {
  mockLoadAnalytics.mockClear();
  mockTrackPage.mockClear();
  mockIdentifyUser.mockClear();
  mockTrackEvent.mockClear();
  mockGetUser.mockClear();
  mockGetUser.mockResolvedValue({ data: { user: null } });
  // Reset module registry so WRITE_KEY is re-evaluated on each import
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

  it("identifies an authenticated user via supabase", async () => {
    vi.stubEnv("NEXT_PUBLIC_SEGMENT_WRITE_KEY", "test-write-key");

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-abc",
          email: "test@example.com",
          created_at: "2024-01-01",
          app_metadata: {},
          identities: [],
        },
      },
    });

    const AnalyticsProvider = await importProvider();

    render(
      <AnalyticsProvider>
        <span>child</span>
      </AnalyticsProvider>,
    );

    await waitFor(() => {
      expect(mockIdentifyUser).toHaveBeenCalledWith("user-abc", {
        email: "test@example.com",
        created_at: "2024-01-01",
      });
    });
    vi.unstubAllEnvs();
  });

  it("does not identify user when supabase returns null user", async () => {
    vi.stubEnv("NEXT_PUBLIC_SEGMENT_WRITE_KEY", "test-write-key");

    mockGetUser.mockResolvedValue({ data: { user: null } });

    const AnalyticsProvider = await importProvider();

    render(
      <AnalyticsProvider>
        <span>child</span>
      </AnalyticsProvider>,
    );

    // Give the async identify flow time to settle
    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalled();
    });
    expect(mockIdentifyUser).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});
