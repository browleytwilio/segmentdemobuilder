import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminNavLink } from "./admin-nav-link";

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
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <PageHeader title="Admin" />
      <nav className="flex gap-1 border-b flex-wrap">
        <AdminNavLink href="/admin/users">Users</AdminNavLink>
        <AdminNavLink href="/admin/prompts">Prompts</AdminNavLink>
        <AdminNavLink href="/admin/config">Config</AdminNavLink>
        <AdminNavLink href="/admin/analytics">Analytics</AdminNavLink>
        <AdminNavLink href="/admin/playbooks">Playbooks</AdminNavLink>
        <AdminNavLink href="/admin/audit">Audit Log</AdminNavLink>
        <AdminNavLink href="/admin/segment">Segment</AdminNavLink>
      </nav>
      <div>{children}</div>
    </div>
  );
}
