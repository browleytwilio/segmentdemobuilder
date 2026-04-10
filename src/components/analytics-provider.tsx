"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { loadAnalytics } from "@/lib/analytics/snippet";
import { trackPage } from "@/lib/analytics/page";
import { identifyUser } from "@/lib/analytics/events";

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

  // Identify user if authenticated
  useEffect(() => {
    if (!loaded.current || !isLoaded || identified.current) return;
    if (user) {
      identifyUser(user.id, {
        email: user.primaryEmailAddress?.emailAddress ?? "",
        created_at: user.createdAt?.toISOString() ?? "",
      });
      identified.current = true;
    }
  }, [user, isLoaded]);

  return <>{children}</>;
}
