// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockSupabaseClient,
} from "@/__test-utils__/mocks/supabase";

const { client: mockClient } = createMockSupabaseClient();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

import { GET } from "./route";

function makeRequest(url = "http://localhost:3000/auth/callback?code=test-code") {
  return new Request(url);
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: exchange succeeds
    mockClient.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it("exchanges code for session and redirects to /dashboard on success", async () => {
    const response = await GET(makeRequest());

    expect(mockClient.auth.exchangeCodeForSession).toHaveBeenCalledWith("test-code");
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
    mockClient.auth.exchangeCodeForSession.mockResolvedValue({
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
