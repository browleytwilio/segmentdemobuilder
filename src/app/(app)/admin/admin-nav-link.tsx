"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";

interface AdminNavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function AdminNavLink({ href, children, icon }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={() => {
        const tab = href.split("/").pop() ?? "";
        trackEvent("Admin Tab Navigated", { tab });
      }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-2 text-sm transition-colors -mb-px whitespace-nowrap",
        isActive
          ? "border-b-2 border-app-accent text-app-accent font-medium"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
