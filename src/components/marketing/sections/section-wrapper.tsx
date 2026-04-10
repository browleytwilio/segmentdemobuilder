import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "default" | "muted" | "dots" | "gradient";
}

export function SectionWrapper({
  children,
  className,
  id,
  background = "default",
}: SectionWrapperProps) {
  return (
    <section id={id} className={cn("relative py-24 lg:py-32", className)}>
      {background === "dots" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      )}
      {background === "gradient" && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-marketing-blue/10 blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-marketing-purple/10 blur-3xl" />
        </div>
      )}
      {background === "muted" && (
        <div className="pointer-events-none absolute inset-0 bg-white/[0.02]" />
      )}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">{children}</div>
    </section>
  );
}
