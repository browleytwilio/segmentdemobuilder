"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics/events";
import { updateMyName } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Shield,
  Calendar,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  Pencil,
} from "lucide-react";

interface ProfileCardProps {
  fullName: string;
  email: string;
  imageUrl: string;
  role: string;
  memberSince: string;
  playbookCount: number;
  completedCount: number;
}

/* ------------------------------------------------------------------ */
/* Edit Name (uses server action — no Clerk client hooks)              */
/* ------------------------------------------------------------------ */

function EditNameSection({ currentName }: { currentName: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const parts = currentName.split(" ");
  const [firstName, setFirstName] = useState(parts[0] ?? "");
  const [lastName, setLastName] = useState(parts.slice(1).join(" "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const result = await updateMyName(firstName.trim(), lastName.trim());
    if (result.success) {
      trackEvent("Profile Updated", { field: "name" });
      setSuccess(true);
      setEditing(false);
      router.refresh(); // re-fetch server data to update the displayed name
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error ?? "Failed to update name.");
    }
    setLoading(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Name</p>
          <p className="text-sm">{currentName || "Not set"}</p>
        </div>
        <div className="flex items-center gap-2">
          {success && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <CheckCircle className="h-3 w-3" />
              Saved
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="h-8 text-xs"
          >
            <Pencil className="mr-1.5 h-3 w-3" />
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">Name</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-xs">
            First name
          </Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-xs">
            Last name
          </Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={loading} className="h-8 text-xs">
          {loading && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditing(false);
            setError(null);
          }}
          className="h-8 text-xs"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Profile Card                                                   */
/* ------------------------------------------------------------------ */

export function ProfileCard({
  fullName,
  email,
  imageUrl,
  role,
  memberSince,
  playbookCount,
  completedCount,
}: ProfileCardProps) {
  const formattedDate = memberSince
    ? new Date(memberSince).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  return (
    <div className="mt-6 space-y-6">
      {/* Identity card */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-start gap-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-16 w-16 rounded-full border"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-app-accent-subtle text-2xl font-bold text-app-accent">
              {(fullName || email).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {fullName || email.split("@")[0]}
            </h2>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {email}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span className="capitalize">{role.replace("_", " ")}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Member since {formattedDate}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Total Playbooks</span>
          </div>
          <p className="mt-2 text-3xl font-bold">{playbookCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Completed</span>
          </div>
          <p className="mt-2 text-3xl font-bold">{completedCount}</p>
        </div>
      </div>

      {/* Account settings */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="border-b px-6 py-4">
          <h3 className="text-sm font-semibold">Account Settings</h3>
        </div>
        <div className="px-6 py-4">
          <EditNameSection currentName={fullName} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Password and connected accounts are managed through your identity
        provider (Google or GitHub OAuth).
      </p>
    </div>
  );
}
