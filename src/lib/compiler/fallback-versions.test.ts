import { describe, it, expect } from "vitest";
import {
  FALLBACK_VERSIONS,
  TARGET_PACKAGES,
} from "@/lib/compiler/fallback-versions";

describe("FALLBACK_VERSIONS", () => {
  it("has an entry for every TARGET_PACKAGES key", () => {
    for (const pkg of TARGET_PACKAGES) {
      expect(FALLBACK_VERSIONS).toHaveProperty(pkg);
    }
  });

  it("has non-empty version strings for every entry", () => {
    for (const pkg of TARGET_PACKAGES) {
      expect(FALLBACK_VERSIONS[pkg]).toBeTruthy();
      expect(typeof FALLBACK_VERSIONS[pkg]).toBe("string");
      expect(FALLBACK_VERSIONS[pkg].length).toBeGreaterThan(0);
    }
  });

  it("has TARGET_PACKAGES that match FALLBACK_VERSIONS keys exactly", () => {
    const versionKeys = Object.keys(FALLBACK_VERSIONS).sort();
    const targetKeys = [...TARGET_PACKAGES].sort();
    expect(targetKeys).toEqual(versionKeys);
  });

  it("contains all expected packages", () => {
    const expectedPackages = [
      "next",
      "react",
      "react-dom",
      "tailwindcss",
      "framer-motion",
      "@segment/analytics-next",
      "@supabase/supabase-js",
      "lucide-react",
      "@supabase/ssr",
    ];
    for (const pkg of expectedPackages) {
      expect(TARGET_PACKAGES).toContain(pkg);
    }
    expect(TARGET_PACKAGES).toHaveLength(expectedPackages.length);
  });
});
