import { type Page } from "@playwright/test";

/**
 * Emulate prefers-reduced-motion: reduce for the given page.
 */
export async function enableReducedMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
}
