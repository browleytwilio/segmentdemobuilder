import { AppNavbar } from "@/components/app-navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNavbar />
      <main className="flex-1">{children}</main>
    </>
  );
}
