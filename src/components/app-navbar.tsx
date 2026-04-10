import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { LogoMark } from "./logo";
import { LayoutDashboardIcon, PlusCircleIcon, ShieldIcon } from "lucide-react";

export async function AppNavbar() {
  const { userId } = await auth();
  if (!userId) return null;

  const [user, supabase] = await Promise.all([currentUser(), createClient()]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const isAdmin = profile?.role === "super_admin";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Mobile menu */}
        <MobileNav isAdmin={isAdmin} />

        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-foreground hover:opacity-75 transition-opacity"
        >
          <LogoMark size={24} />
          <span className="hidden font-semibold text-sm sm:inline">Demo Builder</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          <NavLink href="/dashboard" icon={<LayoutDashboardIcon className="size-3.5" />}>
            Dashboard
          </NavLink>
          <NavLink href="/builder" icon={<PlusCircleIcon className="size-3.5" />}>
            New Playbook
          </NavLink>
          {isAdmin && (
            <NavLink href="/admin" icon={<ShieldIcon className="size-3.5" />}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <UserMenu email={user?.primaryEmailAddress?.emailAddress ?? ""} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
