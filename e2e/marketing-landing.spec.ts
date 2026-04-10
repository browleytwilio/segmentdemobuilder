import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders all core sections without errors", async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/", { waitUntil: "networkidle" });

    // Hero section
    await expect(page.locator("text=Segment Demo Builder").first()).toBeVisible();

    // Features section — look for the features heading or feature cards
    await expect(
      page.locator("h2").filter({ hasText: /feature/i }).first(),
    ).toBeVisible();

    // Data Flow Visualizer — look for CDP hub text or industry tabs
    await expect(page.locator("text=CDP").first()).toBeVisible();

    // How It Works
    await expect(
      page.locator("h2").filter({ hasText: /how it works/i }).first(),
    ).toBeVisible();

    // CTA Section
    await expect(
      page.locator("text=Sign In with Twilio").first(),
    ).toBeVisible();

    // No JS errors should have occurred (filter out known noise)
    const realErrors = errors.filter(
      (e) =>
        !e.includes("hydration") &&
        !e.includes("favicon") &&
        !e.includes("analytics"),
    );
    expect(realErrors).toHaveLength(0);
  });

  test("navbar renders with key links", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Sign-in CTA should be visible on desktop
    await expect(
      page.locator('a[href="/sign-in"]').first(),
    ).toBeVisible();
  });
});
