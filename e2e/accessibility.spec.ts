import { test, expect } from "@playwright/test";

test.describe("Accessibility — landmarks and headings", () => {
  test("landing page has correct landmark structure", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Should have a main landmark
    const main = page.locator("main");
    expect(await main.count()).toBeGreaterThanOrEqual(1);

    // Should have nav landmark
    const nav = page.locator("nav");
    expect(await nav.count()).toBeGreaterThanOrEqual(1);

    // Should have exactly one h1
    const h1s = page.locator("h1");
    expect(await h1s.count()).toBe(1);
  });

  test("heading hierarchy has no skips on key pages", async ({ page }) => {
    const routes = ["/", "/features", "/how-it-works", "/about"];

    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const headingLevels = await page.evaluate(() => {
        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        return Array.from(headings).map((h) =>
          parseInt(h.tagName.replace("H", ""), 10),
        );
      });

      // Verify no heading level is skipped (e.g., h1 → h3 with no h2)
      for (let i = 1; i < headingLevels.length; i++) {
        const jump = headingLevels[i] - headingLevels[i - 1];
        // A heading can go to same level, deeper by 1, or any shallower level
        expect(jump).toBeLessThanOrEqual(1);
      }
    }
  });
});

test.describe("Accessibility — keyboard navigation", () => {
  test("wizard preview is keyboard navigable", async ({ page }) => {
    await page.goto("/how-it-works", { waitUntil: "networkidle" });

    // Find wizard preview
    const wizard = page.locator("text=Try the wizard").first();
    if (!(await wizard.isVisible())) return;
    await wizard.scrollIntoViewIfNeeded();

    // Tab through the wizard step indicators
    // The step buttons should receive focus
    const stepButtons = page
      .locator("button")
      .filter({ hasText: /^(1|2|3|4|Context|Architecture|Scenarios|Preview)$/i });

    if ((await stepButtons.count()) > 0) {
      // Click the first step button to ensure we're focused in the area
      await stepButtons.first().focus();
      await expect(stepButtons.first()).toBeFocused();

      // Tab to Next button
      let foundNext = false;
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press("Tab");
        const focused = page.locator(":focus");
        const text = await focused.textContent().catch(() => "");
        if (text?.includes("Next")) {
          foundNext = true;
          break;
        }
      }
      expect(foundNext).toBe(true);
    }
  });

  test("scenario explorer cards are keyboard accessible", async ({
    page,
  }) => {
    await page.goto("/use-cases/ecommerce", { waitUntil: "networkidle" });

    // Find scenario cards
    const cardButtons = page
      .locator("button")
      .filter({ has: page.locator("h3") });

    if ((await cardButtons.count()) > 0) {
      // Focus the first card
      await cardButtons.first().focus();
      await expect(cardButtons.first()).toBeFocused();

      // Press Enter to expand
      await page.keyboard.press("Enter");

      // Tabs inside should be visible
      await expect(
        page.getByRole("button", { name: /before/i }).first(),
      ).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe("Accessibility — html lang attribute", () => {
  test("html element has lang attribute", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBeTruthy();
    expect(lang).toBe("en");
  });
});
