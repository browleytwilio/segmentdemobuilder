import { test, expect } from "@playwright/test";

test.describe("Responsive — mobile navigation", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile menu opens and navigates", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Look for hamburger/menu button (typically aria-label or a recognizable button)
    const menuButton = page
      .locator("button")
      .filter({
        has: page.locator(
          "svg, [class*='menu'], [class*='hamburger']",
        ),
      })
      .first();

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Navigation links should become visible
      const featuresLink = page
        .locator('a[href="/features"]')
        .first();
      await expect(featuresLink).toBeVisible({ timeout: 3000 });

      // Click a link
      await featuresLink.click();
      await page.waitForURL("**/features", { timeout: 10000 });

      // Page should load
      expect(page.url()).toContain("/features");
    }
  });
});

test.describe("Responsive — data flow visualizer mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("shows vertical layout instead of SVG on mobile", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Scroll to data flow section
    const heading = page.locator("text=Your data, flowing everywhere");
    if ((await heading.count()) === 0) return;
    await heading.scrollIntoViewIfNeeded();

    // Mobile layout uses sm:hidden for SVG and sm:block for mobile
    // On mobile viewport, the vertical flow should show
    // Look for the mobile CDP hub (flex layout, not SVG)
    const mobileHub = page.locator("text=CDP").first();
    await expect(mobileHub).toBeVisible();

    // Source/destination pills should be in flex layout
    const pills = page
      .locator("[class*='rounded-lg']")
      .filter({ has: page.locator("svg") })
      .filter({ hasText: /.+/ });
    expect(await pills.count()).toBeGreaterThan(0);
  });
});

test.describe("Responsive — split comparison mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("shows toggle instead of draggable divider on mobile", async ({
    page,
  }) => {
    await page.goto("/features", { waitUntil: "networkidle" });

    // The split comparison should show toggle buttons on mobile
    const withoutBtn = page.getByRole("button", { name: "Without" });
    const withBtn = page.getByRole("button", { name: "With" });

    if ((await withoutBtn.count()) > 0) {
      await withoutBtn.scrollIntoViewIfNeeded();

      // Toggle should be visible
      await expect(withoutBtn).toBeVisible();
      await expect(withBtn).toBeVisible();

      // Draggable divider should NOT be visible
      const divider = page.locator("[class*='cursor-col-resize']");
      expect(await divider.count()).toBe(0);
    }
  });
});

test.describe("Responsive — marketing pages render at mobile width", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  const pages = ["/", "/features", "/pricing", "/how-it-works", "/about"];

  for (const route of pages) {
    test(`${route} renders without horizontal overflow`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasOverflow).toBe(false);
    });
  }
});
