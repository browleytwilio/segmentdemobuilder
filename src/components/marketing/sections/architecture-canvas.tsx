"use client";

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useReducedMotion,
  useAnimationFrame,
} from "framer-motion";
import {
  Globe,
  Server,
  Smartphone,
  Terminal,
  BarChart3,
  PieChart,
  Send,
  Users,
  Cloud,
  Database,
  Snowflake,
  Plus,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/* Types and data                                                      */
/* ------------------------------------------------------------------ */

interface NodeDef {
  id: string;
  label: string;
  icon: string;
  side: "source" | "destination";
}

const availableNodes: NodeDef[] = [
  // Sources
  { id: "analytics-js", label: "Analytics.js", icon: "Globe", side: "source" },
  { id: "node", label: "Node.js", icon: "Server", side: "source" },
  { id: "ios", label: "iOS SDK", icon: "Smartphone", side: "source" },
  { id: "python", label: "Python", icon: "Terminal", side: "source" },
  // Destinations
  { id: "amplitude", label: "Amplitude", icon: "BarChart3", side: "destination" },
  { id: "mixpanel", label: "Mixpanel", icon: "PieChart", side: "destination" },
  { id: "braze", label: "Braze", icon: "Send", side: "destination" },
  { id: "hubspot", label: "HubSpot", icon: "Users", side: "destination" },
  { id: "salesforce", label: "Salesforce", icon: "Cloud", side: "destination" },
  { id: "bigquery", label: "BigQuery", icon: "Database", side: "destination" },
  { id: "snowflake", label: "Snowflake", icon: "Snowflake", side: "destination" },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Server,
  Smartphone,
  Terminal,
  BarChart3,
  PieChart,
  Send,
  Users,
  Cloud,
  Database,
  Snowflake,
};

interface PlacedNode {
  id: string;
  label: string;
  icon: string;
  side: "source" | "destination";
  y: number; // vertical position (0-based index)
}

/* ------------------------------------------------------------------ */
/* Particle animation on SVG lines                                     */
/* ------------------------------------------------------------------ */

function useLineParticles(lineCount: number, active: boolean, reduced: boolean | null) {
  const particles = useRef<{ lineIndex: number; progress: number; speed: number }[]>([]);
  const [, tick] = useState(0);

  // Seed particles per line
  if (particles.current.length === 0 && lineCount > 0 && active && !reduced) {
    for (let i = 0; i < lineCount * 2; i++) {
      particles.current.push({
        lineIndex: i % lineCount,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.002,
      });
    }
  }

  useAnimationFrame(() => {
    if (!active || reduced || particles.current.length === 0) return;
    for (const p of particles.current) {
      p.progress += p.speed;
      if (p.progress > 1) p.progress = -0.2;
    }
    tick((t) => t + 1);
  });

  return particles.current;
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function ArchitectureCanvas() {
  const reduced = useReducedMotion();
  const [sources, setSources] = useState<PlacedNode[]>([]);
  const [destinations, setDestinations] = useState<PlacedNode[]>([]);

  const addNode = useCallback(
    (node: NodeDef) => {
      if (node.side === "source") {
        setSources((prev) => {
          if (prev.some((n) => n.id === node.id)) return prev;
          trackEvent("Marketing Interaction", { component: "architecture_canvas", interaction: "node_added", properties: { node_id: node.id, side: node.side, total: prev.length + 1 } });
          return [...prev, { ...node, y: prev.length }];
        });
      } else {
        setDestinations((prev) => {
          if (prev.some((n) => n.id === node.id)) return prev;
          trackEvent("Marketing Interaction", { component: "architecture_canvas", interaction: "node_added", properties: { node_id: node.id, side: node.side, total: prev.length + 1 } });
          return [...prev, { ...node, y: prev.length }];
        });
      }
    },
    []
  );

  const reset = () => {
    trackEvent("Marketing Interaction", { component: "architecture_canvas", interaction: "reset" });
    setSources([]);
    setDestinations([]);
  };

  const totalLines = sources.length + destinations.length;
  const eventsPerSec = totalLines * 120;
  const particles = useLineParticles(totalLines, totalLines > 0, reduced);

  // Layout constants
  const CANVAS_H = 260;
  const HUB_X = 300;
  const HUB_Y = CANVAS_H / 2;
  const SRC_X = 60;
  const DST_X = 540;

  const getY = (index: number, count: number) => {
    if (count <= 1) return HUB_Y;
    const pad = 40;
    const space = (CANVAS_H - pad * 2) / (count - 1);
    return pad + index * space;
  };

  const availableSources = availableNodes.filter(
    (n) => n.side === "source" && !sources.some((s) => s.id === n.id)
  );
  const availableDestinations = availableNodes.filter(
    (n) => n.side === "destination" && !destinations.some((d) => d.id === n.id)
  );

  return (
    <div>
      <h2 className="mb-4 text-center text-3xl font-bold text-foreground">
        Build your architecture
      </h2>
      <p className="mb-8 text-center text-muted-foreground">
        Tap sources and destinations to connect them through Segment.
      </p>

      {/* Palette */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {availableNodes
          .filter(
            (n) =>
              !sources.some((s) => s.id === n.id) &&
              !destinations.some((d) => d.id === n.id)
          )
          .map((node) => {
            const Icon = iconMap[node.icon] ?? Globe;
            return (
              <motion.button
                key={node.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addNode(node)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors",
                  node.side === "source"
                    ? "border-marketing-blue/20 bg-marketing-blue/[0.06] text-marketing-blue/80 hover:bg-marketing-blue/10"
                    : "border-marketing-purple/20 bg-marketing-purple/[0.06] text-marketing-purple/80 hover:bg-marketing-purple/10"
                )}
              >
                <Plus className="h-3 w-3" />
                <Icon className="h-3 w-3" />
                {node.label}
              </motion.button>
            );
          })}
        {sources.length + destinations.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-xs text-white/30 hover:text-white/60"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <svg viewBox={`0 0 600 ${CANVAS_H}`} className="w-full" style={{ height: CANVAS_H }}>
          {/* Source lines */}
          {sources.map((src, i) => {
            const y = getY(i, sources.length);
            return (
              <motion.line
                key={`sl-${src.id}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                x1={SRC_X + 30}
                y1={y}
                x2={HUB_X - 20}
                y2={HUB_Y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1.5}
              />
            );
          })}

          {/* Destination lines */}
          {destinations.map((dst, i) => {
            const y = getY(i, destinations.length);
            return (
              <motion.line
                key={`dl-${dst.id}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                x1={HUB_X + 20}
                y1={HUB_Y}
                x2={DST_X - 30}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1.5}
              />
            );
          })}

          {/* Particles */}
          {!reduced &&
            particles
              .filter((p) => p.progress >= 0 && p.progress <= 1)
              .map((p, i) => {
                const isSource = p.lineIndex < sources.length;
                let x: number, y: number;
                if (isSource) {
                  const srcY = getY(p.lineIndex, sources.length);
                  x = (SRC_X + 30) + ((HUB_X - 20) - (SRC_X + 30)) * p.progress;
                  y = srcY + (HUB_Y - srcY) * p.progress;
                } else {
                  const dstIdx = p.lineIndex - sources.length;
                  if (dstIdx >= destinations.length) return null;
                  const dstY = getY(dstIdx, destinations.length);
                  x = (HUB_X + 20) + ((DST_X - 30) - (HUB_X + 20)) * p.progress;
                  y = HUB_Y + (dstY - HUB_Y) * p.progress;
                }
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={2.5}
                    fill={isSource ? "oklch(0.7 0.18 260 / 0.6)" : "oklch(0.6 0.22 290 / 0.6)"}
                    opacity={0.8 - Math.abs(p.progress - 0.5) * 0.8}
                  />
                );
              })}

          {/* Central hub */}
          <circle
            cx={HUB_X}
            cy={HUB_Y}
            r={20}
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
          <circle
            cx={HUB_X}
            cy={HUB_Y}
            r={12}
            fill="url(#canvasHubGradient)"
            className={totalLines > 0 && !reduced ? "animate-glow-pulse" : ""}
          />
          <text
            x={HUB_X}
            y={HUB_Y + 1}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white/70 text-[8px] font-bold"
          >
            CDP
          </text>

          <defs>
            <radialGradient id="canvasHubGradient">
              <stop offset="0%" stopColor="oklch(0.7 0.18 260 / 0.5)" />
              <stop offset="100%" stopColor="oklch(0.6 0.22 290 / 0.3)" />
            </radialGradient>
          </defs>

          {/* Source nodes */}
          {sources.map((src, i) => {
            const y = getY(i, sources.length);
            const Icon = iconMap[src.icon] ?? Globe;
            return (
              <motion.g
                key={`sn-${src.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <rect
                  x={SRC_X - 28}
                  y={y - 14}
                  width={56}
                  height={28}
                  rx={8}
                  fill="rgba(255,255,255,0.03)"
                  stroke="oklch(0.7 0.18 260 / 0.2)"
                  strokeWidth={1}
                />
                <foreignObject x={SRC_X - 24} y={y - 10} width={48} height={20}>
                  <div className="flex items-center gap-1 justify-center">
                    <Icon className="h-3 w-3 text-marketing-blue/70" />
                    <span className="text-[8px] text-white/50 truncate">{src.label}</span>
                  </div>
                </foreignObject>
              </motion.g>
            );
          })}

          {/* Destination nodes */}
          {destinations.map((dst, i) => {
            const y = getY(i, destinations.length);
            const Icon = iconMap[dst.icon] ?? Globe;
            return (
              <motion.g
                key={`dn-${dst.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <rect
                  x={DST_X - 28}
                  y={y - 14}
                  width={56}
                  height={28}
                  rx={8}
                  fill="rgba(255,255,255,0.03)"
                  stroke="oklch(0.6 0.22 290 / 0.2)"
                  strokeWidth={1}
                />
                <foreignObject x={DST_X - 24} y={y - 10} width={48} height={20}>
                  <div className="flex items-center gap-1 justify-center">
                    <Icon className="h-3 w-3 text-marketing-purple/70" />
                    <span className="text-[8px] text-white/50 truncate">{dst.label}</span>
                  </div>
                </foreignObject>
              </motion.g>
            );
          })}

          {/* Empty state labels */}
          {sources.length === 0 && (
            <text x={SRC_X} y={HUB_Y} textAnchor="middle" dominantBaseline="central" className="fill-white/15 text-[10px]">
              Add sources
            </text>
          )}
          {destinations.length === 0 && (
            <text x={DST_X} y={HUB_Y} textAnchor="middle" dominantBaseline="central" className="fill-white/15 text-[10px]">
              Add destinations
            </text>
          )}
        </svg>
      </div>

      {/* Counter */}
      {totalLines > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <span className="text-xs text-white/40">
            <span className="font-mono text-marketing-blue">
              {eventsPerSec.toLocaleString()}
            </span>{" "}
            events/sec flowing through your architecture
          </span>
        </motion.div>
      )}

      {totalLines === 0 && (
        <p className="mt-4 text-center text-xs text-white/20">
          Click sources and destinations above to build your data pipeline
        </p>
      )}
    </div>
  );
}
