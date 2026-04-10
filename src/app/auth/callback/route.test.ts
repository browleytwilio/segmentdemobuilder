// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockExchangeCodeForSession = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}));

import { GET } from "./route";

function makeRequest(url = "http://localhost:3000/auth/callback?code=test-code") {
  return new Request(url);
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: exchange succeeds
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it("exchanges code for session and redirects to /dashboard on success", async () => {
    const response = await GET(makeRequest());

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("test-code");
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/dashboard");
  });

  it("sets x-analytics-identify cookie on success", async () => {
    const response = await GET(makeRequest());

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain("x-analytics-identify");
    expect(setCookie).toContain("1");
  });

  it("redirects to /login with error when exchange fails", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: { message: "exchange-failed" },
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("error=");
  });

  it("redirects to /login with error when code is missing", async () => {
    const response = await GET(makeRequest("http://localhost:3000/auth/callback"));

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("error=");
  });

  it("preserves request origin in redirect URL", async () => {
    const response = await GET(
      makeRequest("https://my-app.example.com/auth/callback?code=abc")
    );

    const location = response.headers.get("location");
    expect(location).toMatch(/^https:\/\/my-app\.example\.com\//);
  });

  it("sets cookie with correct options (httpOnly false, sameSite lax)", async () => {
    const response = await GET(makeRequest());

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    // httpOnly: false means the HttpOnly flag should NOT be present
    expect(setCookie!.toLowerCase()).not.toContain("httponly");
    expect(setCookie!.toLowerCase()).toContain("samesite=lax");
  });
});
