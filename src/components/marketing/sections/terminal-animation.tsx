"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

interface Phase {
  label: string;
  lines: string[];
  durationMs: number;
}

const phases: Phase[] = [
  {
    label: "Fetching dependency versions",
    lines: [
      "$ npm view @segment/analytics-next version",
      "  @segment/analytics-next@1.76.0",
      "  @supabase/supabase-js@2.49.8",
      "  next@16.2.0  react@19.2.4",
    ],
    durationMs: 2400,
  },
  {
    label: "Compiling prompts",
    lines: [
      "  Loading 5 prompt templates...",
      "  Injecting {{CUSTOMER_NAME}} → Acme Corp",
      "  Injecting {{INDUSTRY}} → E-commerce",
      "  Compiled 5 prompts (3 foundation + 2 scenario)",
    ],
    durationMs: 2800,
  },
  {
    label: "Enhancing prompts with AI",
    lines: [
      "  Enriching prompt 1/5 for CMO persona...",
      "  Enriching prompt 2/5 with retail context...",
      "  All prompts enriched successfully",
    ],
    durationMs: 2600,
  },
  {
    label: "Saving playbook",
    lines: [
      "  Sanitizing credentials → {{SEGMENT_WRITE_KEY}}",
      "  Saving to database... done",
    ],
    durationMs: 1400,
  },
  {
    label: "Playbook ready",
    lines: [
      "  5 prompts compiled in 3.2s",
      "  Demo script auto-generated",
      '  Ready to build with Claude Code  \u2728',
    ],
    durationMs: 2000,
  },
];

const CHAR_DELAY_MS = 18;
const PHASE_GAP_MS = 600;
const LOOP_PAUSE_MS = 3000;

export function TerminalAnimation() {
  const prefersReduced = useReducedMotion();
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [activePhase, setActivePhase] = useState(0);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const pausedRef = useRef(false);
  const cancelRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep ref in sync for use in async loop
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  const sleep = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (cancelRef.current) return;
          if (pausedRef.current) {
            requestAnimationFrame(tick);
            return;
          }
          if (Date.now() - start >= ms) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    []
  );

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    cancelRef.current = false;

    if (prefersReduced) {
      // Show final state for reduced motion
      setCompletedPhases(phases.map((_, i) => i));
      setActivePhase(phases.length - 1);
      setVisibleLines(phases.flatMap((p) => [`\u2713 ${p.label}`, ...p.lines]));
      setCurrentLine("");
      setShowCursor(false);
      return;
    }

    async function run() {
      while (!cancelRef.current) {
        // Reset state for loop
        setCompletedPhases([]);
        setVisibleLines([]);
        setCurrentLine("");
        setShowCursor(true);

        for (let pi = 0; pi < phases.length; pi++) {
          if (cancelRef.current) return;
          setActivePhase(pi);

          const phase = phases[pi];
          for (const line of phase.lines) {
            if (cancelRef.current) return;
            // Type out the line character by character
            for (let ci = 0; ci <= line.length; ci++) {
              if (cancelRef.current) return;
              setCurrentLine(line.slice(0, ci));
              await sleep(CHAR_DELAY_MS);
            }
            // Commit the finished line
            setVisibleLines((prev) => [...prev, line]);
            setCurrentLine("");
            scrollToBottom();
            await sleep(80);
          }

          // Mark phase complete
          setCompletedPhases((prev) => [...prev, pi]);
          await sleep(PHASE_GAP_MS);
        }

        // Pause before looping
        setShowCursor(false);
        await sleep(LOOP_PAUSE_MS);
        setShowCursor(true);
      }
    }

    run();
    return () => {
      cancelRef.current = true;
    };
  }, [prefersReduced, sleep, scrollToBottom]);

  // Auto-scroll as new lines appear
  useEffect(() => {
    scrollToBottom();
  }, [visibleLines, currentLine, scrollToBottom]);

  return (
    <div
      className="h-full w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Phase indicators */}
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 px-1">
        {phases.map((phase, i) => (
          <div
            key={phase.label}
            className="flex items-center gap-1.5 text-[11px]"
          >
            <AnimatePresence mode="wait">
              {completedPhases.includes(i) ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-marketing-green/20"
                >
                  <Check className="h-2.5 w-2.5 text-marketing-green" />
                </motion.span>
              ) : activePhase === i ? (
                <motion.span
                  key="active"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="h-2 w-2 rounded-full bg-marketing-blue animate-glow-pulse"
                />
              ) : (
                <span className="h-2 w-2 rounded-full bg-white/[0.12]" />
              )}
            </AnimatePresence>
            <span
              className={
                completedPhases.includes(i)
                  ? "text-white/50"
                  : activePhase === i
                    ? "text-white/80"
                    : "text-white/25"
              }
            >
              {phase.label}
            </span>
          </div>
        ))}
      </div>

      {/* Terminal output */}
      <div
        ref={scrollRef}
        className="h-[160px] overflow-y-auto overflow-x-hidden rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-[1.7] scrollbar-thin"
      >
        {visibleLines.map((line, i) => (
          <div key={i} className={lineColor(line)}>
            {line}
          </div>
        ))}
        {currentLine !== "" && (
          <div className={lineColor(currentLine)}>
            {currentLine}
            {showCursor && (
              <span className="animate-cursor-blink ml-px inline-block h-3.5 w-[5px] translate-y-[1px] bg-marketing-blue/80" />
            )}
          </div>
        )}
        {currentLine === "" && showCursor && visibleLines.length > 0 && (
          <div>
            <span className="animate-cursor-blink ml-px inline-block h-3.5 w-[5px] translate-y-[1px] bg-marketing-blue/80" />
          </div>
        )}
      </div>
    </div>
  );
}

function lineColor(line: string): string {
  if (line.startsWith("$")) return "text-marketing-cyan/80";
  if (line.includes("\u2713") || line.includes("done") || line.includes("Ready"))
    return "text-marketing-green/80";
  if (line.includes("@") || line.includes("version"))
    return "text-marketing-blue/70";
  return "text-white/40";
}
