import { test, expect } from "@playwright/test";

const marketingPages: { route: string; titleContains: string }[] = [
  { route: "/about", titleContains: "About" },
  { route: "/features", titleContains: "Features" },
  { route: "/how-it-works", titleContains: "How It Works" },
  { route: "/pricing", titleContains: "Access" },
  { route: "/integrations", titleContains: "Integrations" },
  { route: "/security", titleContains: "Security" },
  { route: "/blog", titleContains: "Blog" },
  { route: "/changelog", titleContains: "Changelog" },
  { route: "/careers", titleContains: "Careers" },
  { route: "/contact", titleContains: "Contact" },
  { route: "/customers", titleContains: "Customers" },
  { route: "/use-cases", titleContains: "Use Cases" },
  { route: "/walkthrough", titleContains: "See It In Action" },
];

test.describe("SEO — meta tags on marketing pages", () => {
  for (const { route, titleContains } of marketingPages) {
    test(`${route} has title containing "${titleContains}"`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const title = await page.title();
      expect(title).toContain(titleContains);
      expect(title).toContain("Segment Demo Builder");
    });

    test(`${route} has meta description`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(20);
    });
  }

  test("home page has root fallback metadata", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const title = await page.title();
    expect(title).toContain("Segment Demo Builder");

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description).toBeTruthy();
  });

  test("all marketing pages have unique titles", async ({ page }) => {
    const titles: string[] = [];

    for (const { route } of marketingPages) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      titles.push(await page.title());
    }

    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });
});

test.describe("SEO — dynamic route metadata", () => {
  const useCaseSlugs = [
    { slug: "ecommerce", industry: "E-commerce" },
    { slug: "b2b-saas", industry: "B2B SaaS" },
    { slug: "fintech", industry: "FinTech" },
    { slug: "media", industry: "Media" },
  ];

  for (const { slug, industry } of useCaseSlugs) {
    test(`/use-cases/${slug} has title with "${industry}"`, async ({
      page,
    }) => {
      await page.goto(`/use-cases/${slug}`, {
        waitUntil: "domcontentloaded",
      });

      const title = await page.title();
      expect(title).toContain(industry);

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(description).toBeTruthy();
    });
  }

  const blogSlugs = [
    { slug: "why-demo-automation-matters", title: "Demo Automation" },
    { slug: "anatomy-of-a-winning-cdp-demo", title: "CDP Demo" },
  ];

  for (const { slug, title: expectedTitle } of blogSlugs) {
    test(`/blog/${slug} has title with "${expectedTitle}"`, async ({
      page,
    }) => {
      await page.goto(`/blog/${slug}`, { waitUntil: "domcontentloaded" });

      const title = await page.title();
      expect(title.toLowerCase()).toContain(expectedTitle.toLowerCase());
    });
  }
});

test.describe("SEO — error pages", () => {
  test("404 page returns proper status for non-existent route", async ({
    page,
  }) => {
    const response = await page.goto("/this-page-does-not-exist", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(404);
  });

  test("invalid use-case slug returns 404", async ({ page }) => {
    const response = await page.goto("/use-cases/nonexistent-industry", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(404);
  });

  test("invalid blog slug returns 404", async ({ page }) => {
    const response = await page.goto("/blog/nonexistent-post", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(404);
  });
});
