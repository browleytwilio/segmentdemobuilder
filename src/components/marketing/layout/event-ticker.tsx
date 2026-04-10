"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";
import {
  sampleEvents,
  callTypeColors,
  callTypeDescriptions,
  type SampleEvent,
} from "@/lib/marketing/data/sample-events";

function EventPill({ event }: { event: SampleEvent }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      className="relative flex shrink-0 items-center gap-2 px-3"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          callTypeColors[event.type]
        )}
      />
      <code className="whitespace-nowrap text-[11px] text-white/50 transition-colors group-hover/ticker:text-white/50">
        {event.call}
      </code>

      {/* Tooltip */}
      {showTooltip && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md border border-white/[0.08] bg-[#0c0c14] px-3 py-2 text-[11px] leading-tight text-white/70 shadow-lg whitespace-nowrap">
          <span className="mb-1 block font-medium text-white/90">
            {callTypeDescriptions[event.type]}
          </span>
          {event.tooltip}
        </span>
      )}
    </span>
  );
}

export function EventTicker({ className }: { className?: string }) {
  const doubled = [...sampleEvents, ...sampleEvents];

  return (
    <Link
      href="/how-it-works"
      onClick={() => trackEvent("CTA Clicked", { cta: "Event Ticker", location: "event_ticker" })}
      className={cn(
        "group/ticker block overflow-hidden border-b border-white/[0.05] bg-background/80 backdrop-blur-xl",
        "hidden sm:fixed sm:top-16 sm:left-0 sm:right-0 sm:z-40",
        className
      )}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" />

      <div className="flex animate-marquee items-center py-2 hover:[animation-play-state:paused]">
        {doubled.map((event, i) => (
          <EventPill key={`${event.type}-${i}`} event={event} />
        ))}
      </div>
    </Link>
  );
}
