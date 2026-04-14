"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
  UserIcon,
  AlertCircleIcon,
  Loader2Icon,
} from "lucide-react";
import {
  fetchProfileData,
  type ProfileData,
} from "@/app/(app)/playbooks/profile-actions";

interface ProfileInspectorProps {
  playbookId: string;
}

export function ProfileInspector({ playbookId }: ProfileInspectorProps) {
  const [expanded, setExpanded] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"traits" | "audiences" | "events">("traits");

  function handleLookup() {
    if (!identifier.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await fetchProfileData(identifier.trim());
      if (result.error) {
        setError(result.error);
        setProfile(null);
      } else if (result.data) {
        setProfile(result.data);
        setError(null);
      }
    });
  }

  return (
    <div className="rounded-lg border bg-card print:hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <UserIcon className="size-4 text-muted-foreground" />
          Profile Inspector
        </div>
        {expanded ? (
          <ChevronUpIcon className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-3">
          {/* Search */}
          <div className="flex gap-2">
            <Input
              placeholder="user_id:xxx or email:user@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLookup();
              }}
              className="text-sm"
            />
            <Button
              size="sm"
              onClick={handleLookup}
              disabled={isPending || !identifier.trim()}
            >
              {isPending ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <SearchIcon className="size-3.5" />
              )}
              Lookup
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Enter a Segment identity. Prefix with <code>user_id:</code>, <code>email:</code>, or <code>anonymous_id:</code>. Plain values default to <code>user_id:</code>.
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircleIcon className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Results */}
          {profile && (
            <div className="space-y-2">
              {/* Tab switcher */}
              <div className="flex gap-1 border-b">
                {(["traits", "audiences", "events"] as const).map((tab) => {
                  const count =
                    tab === "traits"
                      ? Object.keys(profile.traits).length
                      : tab === "audiences"
                        ? Object.keys(profile.audiences).length
                        : profile.events.length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === tab
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
                      <span className="text-muted-foreground">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="max-h-64 overflow-y-auto rounded-md bg-muted/30 text-xs">
                {activeTab === "traits" && (
                  <TraitsView traits={profile.traits} />
                )}
                {activeTab === "audiences" && (
                  <AudiencesView audiences={profile.audiences} />
                )}
                {activeTab === "events" && (
                  <EventsView events={profile.events} />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TraitsView({ traits }: { traits: Record<string, unknown> }) {
  const entries = Object.entries(traits);
  if (entries.length === 0) {
    return <p className="p-3 text-muted-foreground">No traits found</p>;
  }
  return (
    <table className="w-full">
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key} className="border-b last:border-0">
            <td className="px-3 py-1.5 font-mono text-muted-foreground whitespace-nowrap align-top">
              {key}
            </td>
            <td className="px-3 py-1.5 font-mono break-all">
              {formatValue(value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AudiencesView({ audiences }: { audiences: Record<string, boolean> }) {
  const entries = Object.entries(audiences);
  if (entries.length === 0) {
    return <p className="p-3 text-muted-foreground">No audiences found</p>;
  }
  return (
    <div className="p-3 space-y-1">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${
              value ? "bg-emerald-500" : "bg-muted-foreground/30"
            }`}
          />
          <span className="font-mono">{key}</span>
        </div>
      ))}
    </div>
  );
}

function EventsView({ events }: { events: Record<string, unknown>[] }) {
  if (events.length === 0) {
    return <p className="p-3 text-muted-foreground">No recent events</p>;
  }
  return (
    <div className="divide-y">
      {events.map((evt, i) => (
        <div key={i} className="px-3 py-2 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {(evt.event as string) ?? (evt.type as string) ?? "Unknown"}
            </span>
            {typeof evt.timestamp === "string" && (
              <span className="text-muted-foreground">
                {new Date(evt.timestamp).toLocaleString()}
              </span>
            )}
          </div>
          {evt.properties != null && (
            <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap break-all">
              {JSON.stringify(evt.properties, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
