import { MarketingNavbar } from "@/components/marketing/layout/marketing-navbar";
import { BlakeRowleyBanner } from "@/components/marketing/layout/blake-rowley-banner";
import { MarketingFooter } from "@/components/marketing/layout/marketing-footer";
import { EventTicker } from "@/components/marketing/layout/event-ticker";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <MarketingNavbar />
      <EventTicker />
      <BlakeRowleyBanner />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
