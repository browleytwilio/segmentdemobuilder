import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function LogoMark({ className, size = 28 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Three swept arc segments — fading inward, evoking data segmentation */}
      {/* Outer arc: full opacity */}
      <path
        d="M14 2.5 A11.5 11.5 0 1 1 2.5 14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Middle arc: 55% opacity, slightly inset */}
      <path
        d="M14 6.5 A7.5 7.5 0 1 1 6.5 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      {/* Inner arc: 22% opacity, most inset */}
      <path
        d="M14 10.5 A3.5 3.5 0 1 1 10.5 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.22"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
    </span>
  );
}
