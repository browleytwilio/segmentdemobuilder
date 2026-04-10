import { MarketingNavbar } from "@/components/marketing/layout/marketing-navbar";
import { BlakeRowleyBanner } from "@/components/marketing/layout/blake-rowley-banner";
import { MarketingFooter } from "@/components/marketing/layout/marketing-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <MarketingNavbar />
      <BlakeRowleyBanner />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
