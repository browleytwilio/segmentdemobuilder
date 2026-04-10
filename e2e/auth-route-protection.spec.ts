import { test, expect } from "@playwright/test";

test.describe("Route protection — unauthenticated users", () => {
  const protectedRoutes = [
    "/dashboard",
    "/builder",
    "/admin",
    "/admin/users",
    "/admin/prompts",
    "/admin/config",
    "/admin/analytics",
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects to sign-in`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });

      // Should redirect to sign-in (Clerk middleware)
      // Accept either a redirect response or landing on a sign-in page
      const url = page.url();
      const redirected =
        url.includes("/sign-in") || url.includes("clerk") || response?.status() === 307;

      expect(redirected).toBe(true);
    });
  }

  test("marketing pages remain publicly accessible", async ({ page }) => {
    const publicRoutes = ["/", "/features", "/pricing", "/about"];

    for (const route of publicRoutes) {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(400);
      expect(page.url()).not.toContain("/sign-in");
    }
  });
});
