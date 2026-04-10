"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useInView,
  useAnimate,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { GripVertical, FileText, StickyNote, Terminal as TermIcon, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";

/* ------------------------------------------------------------------ */
/* "Before" side — chaotic desktop mockup                              */
/* ------------------------------------------------------------------ */

function BeforeSide() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a12] p-5">
      {/* Heading */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-semibold text-red-400/80">
          Without Demo Builder
        </span>
      </div>

      {/* Scattered sticky notes */}
      <div className="absolute left-4 top-14 w-28 rotate-[-3deg] rounded-md border border-yellow-500/20 bg-yellow-500/[0.08] p-2">
        <div className="flex items-center gap-1 text-[9px] text-yellow-500/50">
          <StickyNote className="h-2.5 w-2.5" />
          reminder.txt
        </div>
        <div className="mt-1 space-y-1">
          <div className="h-1.5 w-full rounded bg-yellow-500/15" />
          <div className="h-1.5 w-3/4 rounded bg-yellow-500/10" />
        </div>
      </div>

      <div className="absolute right-6 top-16 w-24 rotate-[2deg] rounded-md border border-orange-400/20 bg-orange-400/[0.06] p-2">
        <div className="flex items-center gap-1 text-[9px] text-orange-400/50">
          <StickyNote className="h-2.5 w-2.5" />
          TODO
        </div>
        <div className="mt-1 space-y-1">
          <div className="h-1.5 w-full rounded bg-orange-400/15" />
          <div className="h-1.5 w-1/2 rounded bg-orange-400/10" />
        </div>
      </div>

      {/* Browser tab mockup */}
      <div className="absolute left-6 top-[105px] w-[70%] rotate-[-1deg] rounded-lg border border-white/[0.06] bg-white/[0.03]">
        <div className="flex items-center gap-1.5 border-b border-white/[0.05] px-2 py-1.5">
          <Globe className="h-2.5 w-2.5 text-white/20" />
          <div className="h-1.5 w-20 rounded bg-white/[0.06]" />
          <div className="h-1.5 w-12 rounded bg-white/[0.04]" />
        </div>
        <div className="space-y-1.5 p-2">
          <div className="h-1.5 w-full rounded bg-white/[0.05]" />
          <div className="h-1.5 w-4/5 rounded bg-white/[0.04]" />
          <div className="h-1.5 w-3/5 rounded bg-white/[0.03]" />
        </div>
      </div>

      {/* Terminal fragment */}
      <div className="absolute bottom-12 left-8 w-[60%] rounded-md border border-white/[0.06] bg-black/60 p-2">
        <div className="flex items-center gap-1 text-[9px] text-white/30">
          <TermIcon className="h-2.5 w-2.5" />
          demo-prep.sh
        </div>
        <div className="mt-1.5 space-y-1 font-mono text-[8px] text-white/20">
          <div>$ npm install @segment/analytics-next</div>
          <div>$ cp -r ../old-demo/src .</div>
          <div className="text-red-400/40">ERROR: outdated dependencies</div>
        </div>
      </div>

      {/* Markdown file */}
      <div className="absolute bottom-8 right-4 w-28 rotate-[1deg] rounded-md border border-white/[0.06] bg-white/[0.03] p-2">
        <div className="flex items-center gap-1 text-[9px] text-white/30">
          <FileText className="h-2.5 w-2.5" />
          notes-v3-FINAL.md
        </div>
        <div className="mt-1 space-y-1">
          <div className="h-1.5 w-full rounded bg-white/[0.04]" />
          <div className="h-1.5 w-3/4 rounded bg-white/[0.03]" />
        </div>
      </div>

      {/* Time label */}
      <div className="absolute bottom-3 left-4 text-[10px] text-red-400/50">
        4+ hours of manual prep
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* "After" side — clean Demo Builder UI mockup                         */
/* ------------------------------------------------------------------ */

function AfterSide() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a12] p-5">
      {/* Heading */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-semibold text-marketing-green">
          With Demo Builder
        </span>
      </div>

      {/* Clean window chrome */}
      <div className="rounded-lg border border-marketing-green/15 bg-white/[0.03] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/[0.05] bg-white/[0.02] px-3 py-2">
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-white/[0.08]" />
            <div className="h-2 w-2 rounded-full bg-white/[0.08]" />
            <div className="h-2 w-2 rounded-full bg-white/[0.08]" />
          </div>
          <div className="flex items-center gap-1 rounded bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/40">
            <div className="h-1.5 w-1.5 rounded-full bg-marketing-green/60" />
            app.demobuilder.io/playbooks
          </div>
        </div>

        {/* Playbook list */}
        <div className="space-y-2 p-3">
          {[
            {
              name: "Acme Corp — CMO Demo",
              industry: "E-commerce",
              status: "completed",
            },
            {
              name: "TechStart — CTO Demo",
              industry: "B2B SaaS",
              status: "completed",
            },
            {
              name: "FinServ Global — Compliance",
              industry: "FinTech",
              status: "draft",
            },
          ].map((pb) => (
            <div
              key={pb.name}
              className="flex items-center justify-between rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gradient-to-br from-marketing-blue/30 to-marketing-purple/30" />
                <div>
                  <div className="text-[10px] text-white/70">{pb.name}</div>
                  <div className="text-[8px] text-white/30">{pb.industry}</div>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[8px]",
                  pb.status === "completed"
                    ? "bg-marketing-green/15 text-marketing-green/70"
                    : "bg-marketing-blue/15 text-marketing-blue/70"
                )}
              >
                {pb.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { value: "5 min", label: "Avg creation" },
          { value: "12", label: "Playbooks" },
          { value: "3.2x", label: "Engagement" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-md border border-white/[0.05] bg-white/[0.02] p-2 text-center"
          >
            <div className="text-[11px] font-semibold text-marketing-green/80">
              {s.value}
            </div>
            <div className="text-[8px] text-white/30">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Time label */}
      <div className="absolute bottom-3 left-4 text-[10px] text-marketing-green/60">
        15 minutes, done
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Split comparison with draggable divider                             */
/* ------------------------------------------------------------------ */

export function SplitComparison({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate();
  const inView = useInView(containerRef, { once: true, margin: "-100px" });
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"before" | "after">("before");

  // Divider position as percentage (0-100)
  const dividerPct = useMotionValue(50);
  const leftClip = useTransform(dividerPct, (v) => `inset(0 ${100 - v}% 0 0)`);
  const rightClip = useTransform(dividerPct, (v) => `inset(0 0 0 ${v}%)`);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Hint animation: slide divider to 35%, then back to 50%
  useEffect(() => {
    if (!inView || reduced || isMobile) return;
    const timer = setTimeout(() => {
      animate(scope.current, {}, { duration: 0 }); // ensure scope is mounted
      const run = async () => {
        // Animate via raw motionValue
        const steps = [
          { target: 35, duration: 800 },
          { target: 50, duration: 600 },
        ];
        for (const step of steps) {
          const start = dividerPct.get();
          const startTime = performance.now();
          await new Promise<void>((resolve) => {
            const tick = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / step.duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
              dividerPct.set(start + (step.target - start) * eased);
              if (progress < 1) requestAnimationFrame(tick);
              else resolve();
            };
            requestAnimationFrame(tick);
          });
        }
      };
      run();
    }, 500);
    return () => clearTimeout(timer);
  }, [inView, reduced, isMobile, animate, scope, dividerPct]);

  // Handle drag
  const onDrag = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    trackEvent("Marketing Interaction", { component: "split_comparison", interaction: "divider_dragged" });
    const rect = containerRef.current.getBoundingClientRect();
    const onMove = (ev: PointerEvent) => {
      const x = ev.clientX - rect.left;
      const pct = Math.max(10, Math.min(90, (x / rect.width) * 100));
      dividerPct.set(pct);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className={cn("mx-auto max-w-4xl", className)}>
      <h2 className="mb-8 text-center text-3xl font-bold text-foreground sm:text-4xl">
        Before vs. After
      </h2>

      {/* Mobile: toggle cards */}
      {isMobile && (
        <div>
          <div className="mb-4 flex justify-center">
            <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
              <button
                onClick={() => { trackEvent("Marketing Interaction", { component: "split_comparison", interaction: "toggled", properties: { view: "before" } }); setMobileView("before"); }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                  mobileView === "before"
                    ? "bg-red-400/20 text-red-400"
                    : "text-white/40"
                )}
              >
                Without
              </button>
              <button
                onClick={() => { trackEvent("Marketing Interaction", { component: "split_comparison", interaction: "toggled", properties: { view: "after" } }); setMobileView("after"); }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                  mobileView === "after"
                    ? "bg-marketing-green/20 text-marketing-green"
                    : "text-white/40"
                )}
              >
                With
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]" style={{ height: 340 }}>
            <AnimatePresence mode="wait">
              {mobileView === "before" ? (
                <motion.div
                  key="before"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <BeforeSide />
                </motion.div>
              ) : (
                <motion.div
                  key="after"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <AfterSide />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Desktop: draggable split */}
      {!isMobile && (
        <div
          ref={(el) => {
            (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            // scope ref for useAnimate
            if (el) (scope as { current: HTMLDivElement | null }).current = el;
          }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08]"
          style={{ height: 340 }}
        >
          {/* Before layer */}
          <motion.div className="absolute inset-0" style={{ clipPath: leftClip }}>
            <BeforeSide />
          </motion.div>

          {/* After layer */}
          <motion.div className="absolute inset-0" style={{ clipPath: rightClip }}>
            <AfterSide />
          </motion.div>

          {/* Divider handle */}
          <motion.div
            className="absolute top-0 z-20 flex h-full cursor-col-resize items-center"
            style={{ left: useTransform(dividerPct, (v) => `${v}%`), x: "-50%" }}
            onPointerDown={onDrag}
          >
            <div className="relative flex h-full w-6 items-center justify-center">
              {/* Vertical line */}
              <div className="absolute h-full w-px bg-white/20" />
              {/* Grip handle */}
              <div className="relative z-10 flex h-10 w-6 items-center justify-center rounded-full border border-white/20 bg-[#0c0c14] shadow-lg">
                <GripVertical className="h-3.5 w-3.5 text-white/50" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground/50">
        {isMobile
          ? "Toggle to compare"
          : "Drag the handle to compare"}
      </p>
    </div>
  );
}
