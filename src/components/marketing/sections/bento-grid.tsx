import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  span?: "default" | "wide" | "tall";
}

export function BentoItem({ children, className, span = "default" }: BentoItemProps) {
  return (
    <div
      className={cn(
        span === "wide" && "sm:col-span-2",
        span === "tall" && "sm:row-span-2",
        className
      )}
    >
      {children}
    </div>
  );
}
