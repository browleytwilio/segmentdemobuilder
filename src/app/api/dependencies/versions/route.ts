import { headers } from "next/headers";
import {
  FALLBACK_VERSIONS,
  TARGET_PACKAGES,
} from "@/lib/compiler/fallback-versions";
import { ratelimit } from "@/lib/rate-limit";

export const revalidate = 3600; // 1-hour ISR caching

async function fetchLatestVersion(
  pkg: string,
  signal: AbortSignal
): Promise<string> {
  const res = await fetch(`https://registry.npmjs.org/${pkg}`, { signal });
  if (!res.ok) throw new Error(`NPM returned ${res.status} for ${pkg}`);
  const data = await res.json();
  const latest = data?.["dist-tags"]?.latest;
  if (!latest) throw new Error(`No dist-tags.latest for ${pkg}`);
  return latest;
}

export async function GET() {
  // Rate limiting — 100 requests per 10 min per IP (skipped if Redis not configured)
  if (ratelimit) {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);
    if (!success) {
      return Response.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }
  }
  const versions: Record<string, string> = {};
  let usedFallback = false;

  const results = await Promise.allSettled(
    TARGET_PACKAGES.map(async (pkg) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const version = await fetchLatestVersion(pkg, controller.signal);
        return { pkg, version };
      } finally {
        clearTimeout(timeout);
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      versions[result.value.pkg] = result.value.version;
    } else {
      usedFallback = true;
    }
  }

  // Fill in any missing packages from fallback
  for (const pkg of TARGET_PACKAGES) {
    if (!versions[pkg]) {
      versions[pkg] = FALLBACK_VERSIONS[pkg];
    }
  }

  return Response.json({ versions, usedFallback });
}
