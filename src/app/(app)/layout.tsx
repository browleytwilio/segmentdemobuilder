import { AppNavbar } from "@/components/app-navbar";
import { CopilotWrapper } from "@/components/ai/copilot-wrapper";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNavbar />
      <main className="flex-1">{children}</main>
      <CopilotWrapper />
    </>
  );
}
