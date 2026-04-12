import type { VersionMap } from "./types";
import type { DatabaseProvider } from "./providers";
import { DATABASE_PROVIDERS } from "./providers";

/** Base packages shared across all database providers */
const BASE_VERSIONS: VersionMap = {
  next: "16.2.3",
  react: "19.2.4",
  "react-dom": "19.2.4",
  tailwindcss: "4.0.0",
  "framer-motion": "12.38.0",
  "@segment/analytics-next": "1.76.0",
  "lucide-react": "1.8.0",
};

/** Fallback versions for provider-specific packages */
const PROVIDER_VERSIONS: Record<string, string> = {
  "@supabase/supabase-js": "2.103.0",
  "@supabase/ssr": "0.10.2",
  "@neondatabase/serverless": "1.0.0",
  "drizzle-orm": "0.44.0",
  "drizzle-kit": "0.31.0",
  pg: "8.16.0",
  "@types/pg": "8.11.0",
};

/**
 * Returns the fallback version map for a given database provider.
 * Merges base packages with provider-specific packages.
 */
export function getFallbackVersions(databaseProvider: DatabaseProvider): VersionMap {
  const providerPackages = DATABASE_PROVIDERS[databaseProvider].packages;
  const versions: VersionMap = { ...BASE_VERSIONS };
  for (const pkg of providerPackages) {
    versions[pkg] = PROVIDER_VERSIONS[pkg] ?? "latest";
  }
  return versions;
}

/**
 * Returns the list of packages to resolve for a given database provider.
 */
export function getTargetPackages(databaseProvider: DatabaseProvider): string[] {
  return Object.keys(getFallbackVersions(databaseProvider));
}

/** @deprecated Backward-compat alias — equivalent to getFallbackVersions("supabase") */
export const FALLBACK_VERSIONS: VersionMap = getFallbackVersions("supabase");

/** @deprecated Backward-compat alias — equivalent to getTargetPackages("supabase") */
export const TARGET_PACKAGES = Object.keys(FALLBACK_VERSIONS);
