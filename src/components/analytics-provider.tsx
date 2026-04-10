"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { loadAnalytics } from "@/lib/analytics/snippet";
import { trackPage } from "@/lib/analytics/page";
import { identifyUser, trackEvent } from "@/lib/analytics/events";
import { createClient } from "@/lib/supabase/client";

const WRITE_KEY = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY ?? "";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const loaded = useRef(false);
  const identified = useRef(false);

  // Load snippet once
  useEffect(() => {
    if (!WRITE_KEY || loaded.current) return;
    loadAnalytics(WRITE_KEY);
    loaded.current = true;
  }, []);

  // Fire page() on every route change
  useEffect(() => {
    if (!loaded.current) return;
    trackPage();
  }, [pathname]);

  // Identify user if authenticated (once on mount / after OAuth redirect)
  useEffect(() => {
    if (!loaded.current || identified.current) return;

    async function maybeIdentify() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          identifyUser(user.id, {
            email: user.email ?? "",
            created_at: user.created_at,
          });
          identified.current = true;

          // Fire Signed In for OAuth users returning from provider redirect
          if (document.cookie.includes("x-analytics-identify")) {
            const provider =
              user.app_metadata?.provider ?? user.identities?.[0]?.provider;
            trackEvent("Signed In", {
              method: "oauth" as const,
              provider: provider ?? "unknown",
            });
            document.cookie =
              "x-analytics-identify=; max-age=0; path=/; samesite=lax";
          }
        }
      } catch {
        // Auth check failed — will retry on next mount
      }
    }

    maybeIdentify();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
