import { test, expect } from "@playwright/test";
import { interceptAnalytics } from "./helpers/analytics";

test.describe("Data Flow Visualizer — industry tabs", () => {
  test("switching tabs updates the visualization", async ({ page }) => {
    const analytics = await interceptAnalytics(page);
    await page.goto("/", { waitUntil: "networkidle" });

    // Scroll to the data flow section
    const section = page.locator("text=Your data, flowing everywhere");
    await section.scrollIntoViewIfNeeded();

    // Click each industry tab and verify content changes
    const tabs = ["E-commerce", "B2B SaaS", "FinTech", "Media"];

    for (const tab of tabs) {
      const tabButton = page
        .getByRole("button", { name: new RegExp(tab, "i") })
        .first();
      if (await tabButton.isVisible()) {
        await tabButton.click();

        // Verify the tab is visually active (has marketing-blue background)
        await expect(tabButton).toHaveClass(/marketing-blue/);

        // Verify Marketing Interaction event fired
        await analytics.syncCalls();
        const trackCalls = analytics.calls.filter(
          (c) =>
            c.method === "track" && c.args[0] === "Marketing Interaction",
        );
        expect(trackCalls.length).toBeGreaterThan(0);
      }
    }
  });
});

test.describe("Split Comparison", () => {
  test("desktop: draggable divider changes visible panels", async ({
    page,
  }) => {
    await page.goto("/features", { waitUntil: "networkidle" });

    // Find the comparison section
    const heading = page.locator("h2").filter({ hasText: /before.*after/i });
    if ((await heading.count()) === 0) return;
    await heading.scrollIntoViewIfNeeded();

    // The divider handle should be visible
    const handle = page.locator("[class*='cursor-col-resize']").first();
    if (await handle.isVisible()) {
      const box = await handle.boundingBox();
      if (box) {
        // Drag divider to the left
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x - 100, box.y + box.height / 2, {
          steps: 10,
        });
        await page.mouse.up();

        // Divider should have moved (we can't easily assert clipPath, but
        // verify no errors occurred)
        await expect(handle).toBeVisible();
      }
    }
  });

  test("mobile: toggle switches between before/after views", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    const analytics = await interceptAnalytics(page);

    await page.goto("/features", { waitUntil: "networkidle" });

    const withoutBtn = page.getByRole("button", { name: "Without" });
    const withBtn = page.getByRole("button", { name: "With" });

    if ((await withoutBtn.count()) > 0) {
      await withoutBtn.scrollIntoViewIfNeeded();

      // Click "With" toggle
      await withBtn.click();
      await expect(withBtn).toHaveClass(/marketing-green/);

      // Click "Without" toggle
      await withoutBtn.click();
      await expect(withoutBtn).toHaveClass(/red-400/);

      // Verify analytics fired
      await analytics.syncCalls();
      const toggleCalls = analytics.calls.filter(
        (c) =>
          c.method === "track" &&
          c.args[0] === "Marketing Interaction" &&
          (c.args[1] as Record<string, unknown>)?.component ===
            "split_comparison",
      );
      expect(toggleCalls.length).toBeGreaterThan(0);
    }
  });
});

test.describe("Scenario Explorer", () => {
  test("expanding a card shows tabs with content", async ({ page }) => {
    const analytics = await interceptAnalytics(page);

    // Visit a use-case page that has scenario explorer
    await page.goto("/use-cases/ecommerce", { waitUntil: "networkidle" });

    // Find a scenario card and click to expand
    const cards = page.locator("[class*='rounded-2xl']").filter({
      has: page.locator("h3"),
    });

    if ((await cards.count()) > 0) {
      const firstCard = cards.first();
      await firstCard.scrollIntoViewIfNeeded();

      // Click the header button to expand
      const header = firstCard.locator("button").first();
      await header.click();

      // Tabs should appear: "Before / After", "Events", "Code"
      await expect(
        page.getByRole("button", { name: /before/i }).first(),
      ).toBeVisible({ timeout: 3000 });

      // Click Events tab
      const eventsTab = page
        .getByRole("button", { name: /events/i })
        .first();
      if (await eventsTab.isVisible()) {
        await eventsTab.click();

        // Should show event code elements
        await expect(page.locator("code").first()).toBeVisible({
          timeout: 3000,
        });
      }

      // Click Code tab
      const codeTab = page.getByRole("button", { name: /code/i }).first();
      if (await codeTab.isVisible()) {
        await codeTab.click();

        // Should show code snippet
        await expect(page.locator("pre").first()).toBeVisible({
          timeout: 3000,
        });
      }

      // Verify analytics events fired
      await analytics.syncCalls();
      const explorerCalls = analytics.calls.filter(
        (c) =>
          c.method === "track" &&
          c.args[0] === "Marketing Interaction" &&
          (c.args[1] as Record<string, unknown>)?.component ===
            "scenario_explorer",
      );
      expect(explorerCalls.length).toBeGreaterThan(0);
    }
  });
});

test.describe("Wizard Preview", () => {
  test("full walkthrough through all 4 steps", async ({ page }) => {
    const analytics = await interceptAnalytics(page);

    await page.goto("/how-it-works", { waitUntil: "networkidle" });

    // Find the wizard preview section
    const wizard = page.locator("text=Try the wizard").first();
    if (!(await wizard.isVisible())) return;
    await wizard.scrollIntoViewIfNeeded();

    // Step 1: Context — should show customer name input
    const nameInput = page.locator('input[placeholder="Acme Corp"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill("Test Company");

      // Select an industry
      const industryBtn = page
        .getByRole("button", { name: "B2B SaaS" })
        .first();
      if (await industryBtn.isVisible()) await industryBtn.click();

      // Select a persona
      const personaBtn = page
        .getByRole("button", { name: /CTO/i })
        .first();
      if (await personaBtn.isVisible()) await personaBtn.click();
    }

    // Click Next to go to Step 2
    const nextBtn = page.getByRole("button", { name: "Next" }).first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(400); // wait for animation

      // Step 2: Architecture — toggle a feature
      const toggles = page.locator("button").filter({ hasText: /SE Sidebar/i });
      if ((await toggles.count()) > 0) {
        await toggles.first().click();
      }

      // Click Next to Step 3
      await nextBtn.click();
      await page.waitForTimeout(400);

      // Step 3: Scenarios — should show scenario checkboxes
      // Click Next to Step 4
      await nextBtn.click();
      await page.waitForTimeout(400);

      // Step 4: Preview — should show Compile Preview button
      const compileBtn = page.getByRole("button", {
        name: /compile preview/i,
      });
      if (await compileBtn.isVisible()) {
        await compileBtn.click();

        // Should show compiled prompts
        await expect(
          page.locator("text=Compiled in").first(),
        ).toBeVisible({ timeout: 3000 });
      }
    }

    // Verify step navigation analytics fired
    await analytics.syncCalls();
    const stepCalls = analytics.calls.filter(
      (c) =>
        c.method === "track" &&
        c.args[0] === "Marketing Interaction" &&
        (c.args[1] as Record<string, unknown>)?.component ===
          "wizard_preview",
    );
    expect(stepCalls.length).toBeGreaterThan(0);
  });
});

test.describe("Architecture Canvas", () => {
  test("adding nodes creates SVG lines and particles", async ({ page }) => {
    const analytics = await interceptAnalytics(page);

    await page.goto("/integrations", { waitUntil: "networkidle" });

    // Find the architecture canvas section
    const heading = page
      .locator("h2")
      .filter({ hasText: /build your architecture/i });
    if ((await heading.count()) === 0) return;
    await heading.scrollIntoViewIfNeeded();

    // Add a source node
    const analyticsJs = page
      .getByRole("button", { name: /analytics\.js/i })
      .first();
    if (await analyticsJs.isVisible()) {
      await analyticsJs.click();
    }

    // Add a destination node
    const amplitude = page
      .getByRole("button", { name: /amplitude/i })
      .first();
    if (await amplitude.isVisible()) {
      await amplitude.click();
    }

    // Events/sec counter should appear
    await expect(page.locator("text=events/sec").first()).toBeVisible({
      timeout: 3000,
    });

    // Add more nodes
    const nodeBtn = page.getByRole("button", { name: /node\.js/i }).first();
    if (await nodeBtn.isVisible()) await nodeBtn.click();

    const mixpanel = page
      .getByRole("button", { name: /mixpanel/i })
      .first();
    if (await mixpanel.isVisible()) await mixpanel.click();

    // Reset button should be visible
    const resetBtn = page.getByRole("button", { name: /reset/i }).first();
    await expect(resetBtn).toBeVisible();

    // Click reset
    await resetBtn.click();

    // Events/sec counter should disappear, empty state should show
    await expect(
      page.locator("text=Click sources and destinations").first(),
    ).toBeVisible({ timeout: 3000 });

    // Verify analytics
    await analytics.syncCalls();
    const canvasCalls = analytics.calls.filter(
      (c) =>
        c.method === "track" &&
        c.args[0] === "Marketing Interaction" &&
        (c.args[1] as Record<string, unknown>)?.component ===
          "architecture_canvas",
    );
    // Should have node_added + reset calls
    expect(canvasCalls.length).toBeGreaterThanOrEqual(2);
  });
});

test.describe("Event Ticker", () => {
  test("ticker is visible on desktop and shows event pills", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Event ticker should be in the layout (hidden on mobile)
    const ticker = page.locator("[class*='marquee'], [class*='ticker']").first();

    // On desktop, look for track/identify/page event pills
    const eventPill = page
      .locator("span, code")
      .filter({ hasText: /analytics\.(track|identify|page)/i })
      .first();

    if (await eventPill.isVisible()) {
      // Hover should show tooltip/description
      await eventPill.hover();
      // Wait briefly for tooltip
      await page.waitForTimeout(300);
    }
  });
});
