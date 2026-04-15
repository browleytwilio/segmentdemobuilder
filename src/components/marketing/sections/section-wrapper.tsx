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
    <section id={id} className={cn("relative py-14 sm:py-20 lg:py-28", className)}>
      {background === "dots" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      )}
      {background === "gradient" && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-aurora absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-marketing-blue/[0.09] blur-[100px]" />
          <div className="animate-aurora-2 absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-marketing-purple/[0.09] blur-[100px]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marketing-cyan/[0.04] blur-[80px]" />
        </div>
      )}
      {background === "muted" && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-white/[0.015]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </>
      )}
      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-8">{children}</div>
    </section>
  );
}
