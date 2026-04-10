"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
  useAnimationFrame,
} from "framer-motion";
import {
  Globe,
  Smartphone,
  Server,
  Terminal,
  BarChart3,
  PieChart,
  Send,
  Users,
  Cloud,
  Database,
  Snowflake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import {
  industryFlows,
  type FlowNode,
  type FlowEvent,
} from "@/lib/marketing/data/data-flow-events";

/* ------------------------------------------------------------------ */
/* Icon resolver                                                       */
/* ------------------------------------------------------------------ */

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Smartphone,
  Server,
  Terminal,
  BarChart3,
  PieChart,
  Send,
  Users,
  Cloud,
  Database,
  Snowflake,
};

function NodeIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? Globe;
  return <Icon className={className} />;
}

/* ------------------------------------------------------------------ */
/* Particle system                                                     */
/* ------------------------------------------------------------------ */

interface Particle {
  id: number;
  pathIndex: number;
  progress: number;
  speed: number;
  side: "source" | "destination";
}

function useParticles(
  pathCount: number,
  active: boolean,
  reduced: boolean | null
) {
  const particles = useRef<Particle[]>([]);
  const nextId = useRef(0);
  const [, tick] = useState(0);

  // Seed particles
  useEffect(() => {
    if (!active || reduced) return;
    particles.current = [];
    for (let i = 0; i < pathCount * 2; i++) {
      particles.current.push({
        id: nextId.current++,
        pathIndex: i % pathCount,
        progress: Math.random(),
        speed: 0.0015 + Math.random() * 0.001,
        side: i < pathCount ? "source" : "destination",
      });
    }
  }, [pathCount, active, reduced]);

  useAnimationFrame(() => {
    if (!active || reduced) return;
    let spawned = false;
    for (const p of particles.current) {
      p.progress += p.speed;
      if (p.progress > 1) {
        p.progress = -0.1 - Math.random() * 0.3;
        spawned = true;
      }
    }
    if (spawned) tick((t) => t + 1);
  });

  // Force periodic re-render for smooth motion
  useAnimationFrame(() => {
    if (active && !reduced) tick((t) => t + 1);
  });

  return particles.current;
}

/* ------------------------------------------------------------------ */
/* SVG path helpers                                                    */
/* ------------------------------------------------------------------ */

function sourcePath(
  nodeIndex: number,
  nodeCount: number,
  width: number,
  height: number
): string {
  const nodeY = getNodeY(nodeIndex, nodeCount, height);
  const midY = height / 2;
  const startX = 0;
  const endX = width / 2;
  const cp1x = width * 0.2;
  const cp2x = width * 0.35;
  return `M ${startX} ${nodeY} C ${cp1x} ${nodeY}, ${cp2x} ${midY}, ${endX} ${midY}`;
}

function destPath(
  nodeIndex: number,
  nodeCount: number,
  width: number,
  height: number
): string {
  const nodeY = getNodeY(nodeIndex, nodeCount, height);
  const midY = height / 2;
  const startX = width / 2;
  const endX = width;
  const cp1x = width * 0.65;
  const cp2x = width * 0.8;
  return `M ${startX} ${midY} C ${cp1x} ${midY}, ${cp2x} ${nodeY}, ${endX} ${nodeY}`;
}

function getNodeY(index: number, count: number, height: number): number {
  const pad = 40;
  const space = (height - pad * 2) / Math.max(count - 1, 1);
  return pad + index * space;
}

function getPointOnPath(
  pathEl: SVGPathElement | null,
  t: number
): { x: number; y: number } | null {
  if (!pathEl) return null;
  const clamped = Math.max(0, Math.min(1, t));
  const len = pathEl.getTotalLength();
  const pt = pathEl.getPointAtLength(clamped * len);
  return { x: pt.x, y: pt.y };
}

/* ------------------------------------------------------------------ */
/* Node column                                                         */
/* ------------------------------------------------------------------ */

function NodeColumn({
  nodes,
  side,
  height,
}: {
  nodes: FlowNode[];
  side: "left" | "right";
  height: number;
}) {
  return (
    <div
      className={cn(
        "absolute top-0 z-10 flex flex-col justify-between py-[28px]",
        side === "left" ? "left-0" : "right-0"
      )}
      style={{ height }}
    >
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="group relative flex items-center gap-2"
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm transition-all",
              "group-hover:border-marketing-blue/30 group-hover:bg-marketing-blue/[0.08]",
              side === "right" && "order-2"
            )}
          >
            <NodeIcon name={node.icon} className="h-4 w-4 text-white/60 group-hover:text-marketing-blue transition-colors" />
          </div>
          <span
            className={cn(
              "text-xs text-white/50 group-hover:text-white/80 transition-colors whitespace-nowrap",
              side === "right" && "order-1 text-right"
            )}
          >
            {node.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function DataFlowVisualizer() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeIndustry, setActiveIndustry] = useState(0);
  const flow = industryFlows[activeIndustry];

  // SVG dimensions
  const SVG_W = 600;
  const SVG_H = 220;

  // Build path refs
  const sourcePathRefs = useRef<(SVGPathElement | null)[]>([]);
  const destPathRefs = useRef<(SVGPathElement | null)[]>([]);

  // Source + dest paths as strings
  const sourcePaths = useMemo(
    () =>
      flow.sources.map((_, i) => sourcePath(i, flow.sources.length, SVG_W, SVG_H)),
    [flow.sources]
  );
  const destPaths = useMemo(
    () =>
      flow.destinations.map((_, i) =>
        destPath(i, flow.destinations.length, SVG_W, SVG_H)
      ),
    [flow.destinations]
  );

  const particles = useParticles(
    Math.max(flow.sources.length, flow.destinations.length),
    inView,
    reduced
  );

  return (
    <SectionWrapper background="gradient">
        <div className="mx-auto max-w-2xl text-center">
          <GradientHeading as="h2" gradient="default">
            Your data, flowing everywhere
          </GradientHeading>
          <p className="mt-4 text-base text-muted-foreground">
            See how Segment routes events from every source to every destination
            — in real time.
          </p>
        </div>

        {/* Industry tabs */}
        <div className="mt-10 flex justify-center gap-2">
          {industryFlows.map((f, i) => (
            <button
              key={f.industry}
              onClick={() => {
                trackEvent("Marketing Interaction", { component: "data_flow_visualizer", interaction: "industry_changed", properties: { industry: f.industry } });
                setActiveIndustry(i);
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                activeIndustry === i
                  ? "bg-marketing-blue/20 text-white border border-marketing-blue/30"
                  : "text-white/40 hover:text-white/70 border border-transparent hover:border-white/[0.08]"
              )}
            >
              {f.industry}
            </button>
          ))}
        </div>

        {/* Visualization */}
        <div ref={containerRef} className="relative mt-10">
          {/* Event labels floating above */}
          <div className="flex justify-center gap-4 mb-6">
            <AnimatePresence mode="wait">
              {flow.events.map((ev: FlowEvent) => (
                <motion.span
                  key={`${activeIndustry}-${ev.label}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] text-white/50"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      `bg-${ev.color}`
                    )}
                  />
                  {ev.label}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Desktop: full SVG flow */}
          <div className="hidden sm:block">
            <div className="relative mx-auto" style={{ maxWidth: SVG_W + 200 }}>
              {/* Source nodes */}
              <NodeColumn nodes={flow.sources} side="left" height={SVG_H} />

              {/* SVG canvas */}
              <div className="mx-[100px]">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                  className="w-full"
                  style={{ height: SVG_H }}
                >
                  {/* Source paths */}
                  {sourcePaths.map((d, i) => (
                    <path
                      key={`sp-${i}`}
                      ref={(el) => { sourcePathRefs.current[i] = el; }}
                      d={d}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={1.5}
                    />
                  ))}
                  {/* Destination paths */}
                  {destPaths.map((d, i) => (
                    <path
                      key={`dp-${i}`}
                      ref={(el) => { destPathRefs.current[i] = el; }}
                      d={d}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={1.5}
                    />
                  ))}

                  {/* Central hub */}
                  <circle
                    cx={SVG_W / 2}
                    cy={SVG_H / 2}
                    r={24}
                    fill="rgba(255,255,255,0.03)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={1}
                  />
                  <circle
                    cx={SVG_W / 2}
                    cy={SVG_H / 2}
                    r={14}
                    fill="url(#hubGradient)"
                    className={reduced ? "" : "animate-glow-pulse"}
                  />

                  {/* Hub gradient def */}
                  <defs>
                    <radialGradient id="hubGradient">
                      <stop offset="0%" stopColor="oklch(0.7 0.18 260 / 0.5)" />
                      <stop offset="100%" stopColor="oklch(0.6 0.22 290 / 0.3)" />
                    </radialGradient>
                  </defs>

                  {/* Particles */}
                  {!reduced &&
                    inView &&
                    particles
                      .filter((p) => p.progress >= 0 && p.progress <= 1)
                      .map((p) => {
                        const refs =
                          p.side === "source"
                            ? sourcePathRefs
                            : destPathRefs;
                        const pt = getPointOnPath(
                          refs.current[p.pathIndex] ?? null,
                          p.progress
                        );
                        if (!pt) return null;
                        const evIndex =
                          p.id % flow.events.length;
                        return (
                          <circle
                            key={p.id}
                            cx={pt.x}
                            cy={pt.y}
                            r={3}
                            className={`fill-${flow.events[evIndex].color}`}
                            opacity={
                              0.8 -
                              Math.abs(p.progress - 0.5) * 0.6
                            }
                          />
                        );
                      })}

                  {/* Hub label */}
                  <text
                    x={SVG_W / 2}
                    y={SVG_H / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white/70 text-[9px] font-bold tracking-wider"
                  >
                    CDP
                  </text>
                </svg>
              </div>

              {/* Destination nodes */}
              <NodeColumn
                nodes={flow.destinations}
                side="right"
                height={SVG_H}
              />
            </div>
          </div>

          {/* Mobile: vertical simplified flow */}
          <div className="sm:hidden flex flex-col items-center gap-6">
            {/* Sources */}
            <div className="flex flex-wrap justify-center gap-3">
              {flow.sources.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2"
                >
                  <NodeIcon name={node.icon} className="h-3.5 w-3.5 text-white/50" />
                  <span className="text-[11px] text-white/50">{node.label}</span>
                </div>
              ))}
            </div>

            {/* Arrow down */}
            <div className="flex flex-col items-center gap-1">
              <div className="h-8 w-px bg-gradient-to-b from-marketing-blue/40 to-transparent" />
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-marketing-blue/30 bg-marketing-blue/[0.1]">
                <span className="text-[10px] font-bold text-white/70">CDP</span>
              </div>
              <div className="h-8 w-px bg-gradient-to-b from-transparent to-marketing-purple/40" />
            </div>

            {/* Destinations */}
            <div className="flex flex-wrap justify-center gap-3">
              {flow.destinations.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2"
                >
                  <NodeIcon name={node.icon} className="h-3.5 w-3.5 text-white/50" />
                  <span className="text-[11px] text-white/50">{node.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
    </SectionWrapper>
  );
}
