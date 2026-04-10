import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { LogoMark } from "./logo";

export async function AppNavbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/dashboard"
          className="text-foreground hover:opacity-75 transition-opacity"
        >
          <LogoMark size={24} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/builder">New Playbook</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <UserMenu email={user.email ?? ""} />
        </div>
      </div>
    </header>
  );
}
