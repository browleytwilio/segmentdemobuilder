import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarMobileHeader } from "@/components/sidebar-mobile-header";
import { CommandPalette } from "@/components/command-palette";
import { CopilotWrapper } from "@/components/ai/copilot-wrapper";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const [user, supabase, cookieStore] = await Promise.all([
    currentUser(),
    createClient(),
    cookies(),
  ]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId!)
    .maybeSingle();

  const isAdmin = profile?.role === "super_admin";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const sidebarCookie = cookieStore.get("sidebar_state");
  const defaultOpen = sidebarCookie ? sidebarCookie.value === "true" : true;

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar isAdmin={isAdmin} userEmail={email} />
        <SidebarInset>
          <SidebarMobileHeader />
          <div className="flex-1 app-bg-pattern">{children}</div>
        </SidebarInset>
        <CommandPalette isAdmin={isAdmin} />
      </SidebarProvider>
      <CopilotWrapper />
    </TooltipProvider>
  );
}
