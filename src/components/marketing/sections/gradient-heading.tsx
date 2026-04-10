import { cn } from "@/lib/utils";

interface GradientHeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  gradient?: "default" | "blue" | "purple";
}

const gradients = {
  default: "from-white via-white/80 to-white/50",
  blue: "from-marketing-blue via-white to-marketing-cyan",
  purple: "from-marketing-purple via-white to-marketing-blue",
};

export function GradientHeading({
  children,
  as: Tag = "h2",
  className,
  gradient = "default",
}: GradientHeadingProps) {
  return (
    <Tag
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        gradients[gradient],
        Tag === "h1" && "text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl",
        Tag === "h2" && "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl",
        Tag === "h3" && "text-2xl font-semibold tracking-tight sm:text-3xl",
        className
      )}
    >
      {children}
    </Tag>
  );
}
