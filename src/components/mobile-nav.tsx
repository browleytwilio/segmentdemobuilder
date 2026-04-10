"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogoMark } from "./logo";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";
import {
  MenuIcon,
  XIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  ShieldIcon,
} from "lucide-react";

interface MobileNavProps {
  isAdmin: boolean;
}

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/builder", label: "New Playbook", icon: PlusCircleIcon },
];

export function MobileNav({ isAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function handleOpen() {
    setOpen(true);
    trackEvent("Mobile Nav Toggled", { action: "open" });
  }

  function handleClose() {
    setOpen(false);
  }

  const allLinks = isAdmin
    ? [...links, { href: "/admin", label: "Admin", icon: ShieldIcon }]
    : links;

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={handleOpen} aria-label="Open menu">
        <MenuIcon className="size-5" />
      </Button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <nav className="relative z-10 flex w-72 flex-col bg-background border-r shadow-lg animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b px-4 h-14">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={handleClose}>
                <LogoMark size={22} />
                <span className="font-semibold text-sm">Demo Builder</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close menu">
                <XIcon className="size-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {allLinks.map(({ href, label, icon: Icon }) => {
                const isActive =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === href || pathname.startsWith(href + "/");

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
