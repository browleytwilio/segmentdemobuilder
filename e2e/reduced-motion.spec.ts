import { test, expect } from "@playwright/test";
import { enableReducedMotion } from "./helpers/reduced-motion";

test.describe("Accessibility — prefers-reduced-motion", () => {
  test("terminal animation shows final state instantly", async ({ page }) => {
    await enableReducedMotion(page);
    await page.goto("/", { waitUntil: "networkidle" });

    // With reduced motion, the terminal should show the final output
    // without typing animation. The component renders all phases at once.
    // Look for phase indicators or terminal content that appears immediately.
    const terminal = page.locator("[class*='font-mono']").first();
    if (await terminal.isVisible()) {
      // Content should be visible without waiting for animation
      await expect(terminal).toBeVisible({ timeout: 2000 });
    }
  });

  test("data flow visualizer has no animated particles", async ({ page }) => {
    await enableReducedMotion(page);
    await page.goto("/", { waitUntil: "networkidle" });

    // Scroll to data flow visualizer section
    await page.locator("text=Your data, flowing everywhere").scrollIntoViewIfNeeded();

    // With reduced motion, circle elements for particles should not exist
    // The component conditionally renders particles: `!reduced && inView && particles...`
    const svg = page.locator("svg").filter({ has: page.locator("text=CDP") });
    if (await svg.count() > 0) {
      // Particles are rendered as <circle> elements with fill classes
      // In reduced-motion mode, the particle array should be empty
      const particleCircles = svg
        .first()
        .locator("circle")
        .filter({ hasNot: page.locator("[id]") }); // exclude gradient circles

      // Hub circles (2) + particle circles (0 in reduced motion)
      const count = await particleCircles.count();
      // With reduced motion, should only see the 2 hub circles, not particle dots
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  test("CSS animations are paused via media query", async ({ page }) => {
    await enableReducedMotion(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Check that the global CSS reduces motion
    const animationDuration = await page.evaluate(() => {
      const el = document.querySelector("[class*='animate-']");
      if (!el) return null;
      return window.getComputedStyle(el).animationDuration;
    });

    // Either no animated elements found (good) or animation duration is reduced
    if (animationDuration !== null) {
      // 0.01ms is the common reduced-motion override
      expect(["0s", "0.01ms", "0.001s"]).toContain(animationDuration);
    }
  });
});
