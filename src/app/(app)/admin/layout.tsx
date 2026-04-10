import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AdminNavLink } from "./admin-nav-link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <PageHeader title="Admin" />
      <nav className="flex gap-1 border-b">
        <AdminNavLink href="/admin/users">Users</AdminNavLink>
        <AdminNavLink href="/admin/prompts">Prompts</AdminNavLink>
        <AdminNavLink href="/admin/config">Config</AdminNavLink>
      </nav>
      <div>{children}</div>
    </div>
  );
}
