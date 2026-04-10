/**
 * Loads the Segment analytics.js snippet from CDN.
 * Standard approach from Segment docs — stubs method calls into a queue,
 * then loads the real script asynchronously.
 */
export function loadAnalytics(writeKey: string): void {
  if (typeof window === "undefined") return;
  if (window.analytics && window.analytics.invoked) return;

  const analytics = (window.analytics = window.analytics || ([] as unknown as Window["analytics"]));
  analytics.invoked = true;
  analytics.methods = [
    "trackSubmit", "trackClick", "trackLink", "trackForm", "pageview",
    "identify", "reset", "group", "track", "ready", "alias", "debug",
    "page", "screen", "once", "off", "on", "addSourceMiddleware",
    "addIntegrationMiddleware", "setAnonymousId", "addDestinationMiddleware",
    "register",
  ];

  analytics.factory = function (method: string) {
    return function (...args: unknown[]) {
      args.unshift(method);
      (analytics as unknown as unknown[][]).push(args);
      return analytics;
    };
  };

  for (const method of analytics.methods) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (analytics as any)[method] = analytics.factory(method);
  }

  analytics.load = function (key: string, options?: Record<string, unknown>) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `https://cdn.segment.com/analytics.js/v1/${key}/analytics.min.js`;
    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(script, first);
    analytics._loadOptions = options;
  };

  analytics.SNIPPET_VERSION = "5.2.1";
  analytics.load(writeKey);
}
