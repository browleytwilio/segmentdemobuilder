"use client";

import Link from "next/link";
import { LogoMark } from "./logo";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function SidebarMobileHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-foreground"
      >
        <LogoMark size={20} />
        <span className="font-semibold text-sm">Demo Builder</span>
      </Link>
    </header>
  );
}
