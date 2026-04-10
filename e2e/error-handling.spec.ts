import { test, expect } from "@playwright/test";

test.describe("Error handling — invalid routes", () => {
  test("non-existent playbook ID shows error or 404", async ({ page }) => {
    const response = await page.goto(
      "/playbooks/00000000-0000-0000-0000-000000000000",
      { waitUntil: "domcontentloaded" },
    );

    // Should either 404, redirect to sign-in (auth required), or show error
    const status = response?.status() ?? 0;
    const url = page.url();
    const isHandled =
      status === 404 ||
      status === 307 ||
      url.includes("/sign-in") ||
      url.includes("clerk");

    expect(isHandled).toBe(true);
  });

  test("non-existent share link shows error or 404", async ({ page }) => {
    const response = await page.goto(
      "/share/00000000-0000-0000-0000-000000000000",
      { waitUntil: "domcontentloaded" },
    );

    const status = response?.status() ?? 0;
    // Should be a 404 or show a "not found" message
    const hasError =
      status === 404 ||
      (await page.locator("text=/not found|doesn't exist|error/i").count()) >
        0;

    expect(hasError).toBe(true);
  });
});

test.describe("Error handling — marketing page navigation", () => {
  const marketingRoutes = [
    "/",
    "/features",
    "/how-it-works",
    "/pricing",
    "/about",
    "/integrations",
    "/security",
    "/blog",
    "/changelog",
    "/careers",
    "/contact",
    "/customers",
    "/use-cases",
    "/walkthrough",
  ];

  for (const route of marketingRoutes) {
    test(`${route} loads without server errors`, async ({ page }) => {
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
      });

      expect(response?.status()).toBeLessThan(500);
      expect(response?.status()).not.toBe(404);
    });
  }
});

test.describe("Error handling — console errors", () => {
  test("landing page has no critical JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/", { waitUntil: "networkidle" });

    // Filter known non-critical errors
    const critical = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("analytics") &&
        !e.includes("hydration") &&
        !e.includes("Clerk") &&
        !e.includes("chunk") &&
        !e.includes("net::ERR"),
    );

    expect(critical).toHaveLength(0);
  });
});
