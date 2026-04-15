import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { FadeIn } from "@/components/app/motion-wrappers";
import { AdminNavLink } from "./admin-nav-link";
import {
  UsersIcon,
  FileTextIcon,
  SettingsIcon,
  BarChart3Icon,
  BookOpenIcon,
  ScrollTextIcon,
  ActivityIcon,
} from "lucide-react";

const ADMIN_TABS = [
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/prompts", label: "Prompts", icon: FileTextIcon },
  { href: "/admin/config", label: "Config", icon: SettingsIcon },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3Icon },
  { href: "/admin/playbooks", label: "Playbooks", icon: BookOpenIcon },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollTextIcon },
  { href: "/admin/segment", label: "Segment", icon: ActivityIcon },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) notFound();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "super_admin") notFound();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <PageHeader
        title="Admin Panel"
        description="Manage users, templates, and platform configuration"
      />

      {/* Tab navigation with icons */}
      <nav className="flex gap-0.5 border-b flex-wrap overflow-x-auto scrollbar-none -mb-px">
        {ADMIN_TABS.map(({ href, label, icon: Icon }) => (
          <AdminNavLink key={href} href={href} icon={<Icon className="size-3.5" />}>
            {label}
          </AdminNavLink>
        ))}
      </nav>

      <FadeIn>
        <div>{children}</div>
      </FadeIn>
    </div>
  );
}
