"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Command } from "cmdk";
import { useHotkey } from "@/hooks/use-hotkey";
import { useSidebar } from "@/components/ui/sidebar";
import { trackEvent } from "@/lib/analytics/events";
import {
  LayoutDashboardIcon,
  PlusCircleIcon,
  UserIcon,
  ShieldIcon,
  SunIcon,
  MoonIcon,
  PanelLeftIcon,
  SearchIcon,
} from "lucide-react";

interface CommandPaletteProps {
  isAdmin: boolean;
}

export function CommandPalette({ isAdmin }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { toggleSidebar } = useSidebar();

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) trackEvent("Command Palette Opened", { trigger: "keyboard" });
      return next;
    });
  }, []);

  useHotkey("k", toggle, { meta: true });

  function runAction(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2">
        <div className="overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-elevated">
          <div className="flex items-center border-b px-3">
            <SearchIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-1">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigation"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              <CommandItem
                icon={<LayoutDashboardIcon />}
                onSelect={() => runAction(() => router.push("/dashboard"))}
              >
                Dashboard
              </CommandItem>
              <CommandItem
                icon={<PlusCircleIcon />}
                onSelect={() => runAction(() => router.push("/builder"))}
              >
                New Playbook
              </CommandItem>
              <CommandItem
                icon={<UserIcon />}
                onSelect={() => runAction(() => router.push("/profile"))}
              >
                Profile
              </CommandItem>
              {isAdmin && (
                <CommandItem
                  icon={<ShieldIcon />}
                  onSelect={() => runAction(() => router.push("/admin"))}
                >
                  Admin Panel
                </CommandItem>
              )}
            </Command.Group>

            <Command.Separator className="mx-1 my-1 h-px bg-border" />

            <Command.Group
              heading="Actions"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              <CommandItem
                icon={resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
                onSelect={() =>
                  runAction(() => {
                    const next = resolvedTheme === "dark" ? "light" : "dark";
                    setTheme(next);
                    trackEvent("Theme Toggled", { theme: next });
                  })
                }
              >
                Toggle Theme
              </CommandItem>
              <CommandItem
                icon={<PanelLeftIcon />}
                onSelect={() => runAction(toggleSidebar)}
              >
                Toggle Sidebar
              </CommandItem>
            </Command.Group>
          </Command.List>
        </div>
      </div>
    </Command.Dialog>
  );
}

function CommandItem({
  children,
  icon,
  onSelect,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground data-[selected=true]:[&_svg]:text-accent-foreground"
    >
      {icon}
      {children}
    </Command.Item>
  );
}
