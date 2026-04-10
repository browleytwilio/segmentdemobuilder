import { type Page, expect } from "@playwright/test";

/**
 * Intercepts window.analytics calls by injecting a stub before the page loads.
 * Returns helpers to assert which calls were made.
 */
export async function interceptAnalytics(page: Page) {
  const calls: { method: string; args: unknown[] }[] = [];

  await page.addInitScript(() => {
    const _calls: { method: string; args: unknown[] }[] = [];
    (window as unknown as Record<string, unknown>).__analyticsCalls = _calls;

    const stub = new Proxy(
      {},
      {
        get(_target, prop: string) {
          return (...args: unknown[]) => {
            _calls.push({ method: prop, args });
          };
        },
      },
    );
    (window as unknown as Record<string, unknown>).analytics = stub;
  });

  // After each navigation, sync calls from the page context
  const syncCalls = async () => {
    const pageCalls = await page.evaluate(
      () =>
        (window as unknown as Record<string, unknown>).__analyticsCalls as {
          method: string;
          args: unknown[];
        }[],
    );
    calls.length = 0;
    calls.push(...(pageCalls ?? []));
  };

  return {
    calls,
    syncCalls,

    async expectPageCall(namePattern?: string | RegExp) {
      await syncCalls();
      const pageCalls = calls.filter((c) => c.method === "page");
      expect(pageCalls.length).toBeGreaterThan(0);
      if (namePattern) {
        const match = pageCalls.some((c) => {
          const arg = String(c.args[0] ?? "");
          return namePattern instanceof RegExp
            ? namePattern.test(arg)
            : arg.includes(namePattern);
        });
        expect(match).toBe(true);
      }
    },

    async expectTrackCall(
      eventName: string,
      propsSubset?: Record<string, unknown>,
    ) {
      await syncCalls();
      const trackCalls = calls.filter(
        (c) => c.method === "track" && c.args[0] === eventName,
      );
      expect(trackCalls.length).toBeGreaterThan(0);
      if (propsSubset) {
        const match = trackCalls.some((c) => {
          const props = c.args[1] as Record<string, unknown>;
          return Object.entries(propsSubset).every(
            ([k, v]) => props[k] === v,
          );
        });
        expect(match).toBe(true);
      }
    },

    async expectIdentifyCall() {
      await syncCalls();
      const identifyCalls = calls.filter((c) => c.method === "identify");
      expect(identifyCalls.length).toBeGreaterThan(0);
    },
  };
}
