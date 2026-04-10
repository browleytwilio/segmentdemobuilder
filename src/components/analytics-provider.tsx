"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { loadAnalytics } from "@/lib/analytics/snippet";
import { trackPage } from "@/lib/analytics/page";
import { identifyUser } from "@/lib/analytics/events";
import { getMyRole } from "@/app/(app)/profile/actions";

const WRITE_KEY = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY ?? "";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
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

  // Identify user if authenticated (includes role from Supabase)
  useEffect(() => {
    if (!loaded.current || !isLoaded || identified.current) return;
    if (user) {
      identified.current = true;
      const email = user.primaryEmailAddress?.emailAddress ?? "";
      const created_at = user.createdAt?.toISOString() ?? "";

      // Identify immediately with known traits, then enrich with role
      identifyUser(user.id, { email, created_at });
      getMyRole().then((role) => {
        if (role) {
          identifyUser(user.id, { email, created_at, role });
        }
      });
    }
  }, [user, isLoaded]);

  return <>{children}</>;
}
