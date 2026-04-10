"use client";

import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { trackEvent, resetAnalytics } from "@/lib/analytics/events";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutIcon, LayoutDashboardIcon, ShieldIcon, UserIcon } from "lucide-react";

interface UserMenuProps {
  email: string;
  isAdmin?: boolean;
}

export function UserMenu({ email, isAdmin }: UserMenuProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const initial = email.charAt(0).toUpperCase();

  async function handleLogout() {
    trackEvent("Signed Out", { method: "manual" });
    resetAnalytics();
    await signOut();
    router.push("/sign-in");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-primary/10 text-primary"
          />
        }
      >
        <span className="text-xs font-semibold">{initial}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <LayoutDashboardIcon className="size-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <UserIcon className="size-4" />
          Profile
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin")}>
              <ShieldIcon className="size-4" />
              Admin Panel
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
