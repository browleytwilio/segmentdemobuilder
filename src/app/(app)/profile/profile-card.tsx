"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { trackEvent } from "@/lib/analytics/events";
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
  KeyRound,
  Monitor,
  Smartphone,
  Trash2,
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
/* Edit Name                                                           */
/* ------------------------------------------------------------------ */

function EditNameSection({ currentName }: { currentName: string }) {
  const { user } = useUser();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await user.update({ firstName, lastName });
      trackEvent("Profile Updated", { field: "name" });
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { errors?: Array<{ longMessage?: string }> })?.errors?.[0]
          ?.longMessage ?? "Failed to update name.";
      setError(msg);
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
      {success && (
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <CheckCircle className="h-3 w-3" />
          Name updated
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
/* Change Password                                                     */
/* ------------------------------------------------------------------ */

function ChangePasswordSection() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleChange() {
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: false,
      });
      trackEvent("Profile Updated", { field: "password" });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 2000);
    } catch (err: unknown) {
      const msg =
        (err as { errors?: Array<{ longMessage?: string }> })?.errors?.[0]
          ?.longMessage ?? "Failed to update password.";
      setError(msg);
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Password</p>
          <p className="text-sm text-muted-foreground">••••••••</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-8 text-xs"
        >
          <KeyRound className="mr-1.5 h-3 w-3" />
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">Change Password</p>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword" className="text-xs">
            Current password
          </Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-xs">
            New password
          </Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
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
      {success && (
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <CheckCircle className="h-3 w-3" />
          Password updated
        </div>
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleChange}
          disabled={loading || !currentPassword || !newPassword}
          className="h-8 text-xs"
        >
          {loading && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
          Update Password
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setError(null);
            setCurrentPassword("");
            setNewPassword("");
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
/* Connected Accounts                                                  */
/* ------------------------------------------------------------------ */

function ConnectedAccountsSection() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accounts = user?.externalAccounts ?? [];

  async function handleDisconnect(accountId: string) {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return;
    setLoading(accountId);
    setError(null);
    try {
      await account.destroy();
      trackEvent("Profile Updated", { field: "connected_account_removed" });
    } catch (err: unknown) {
      const msg =
        (err as { errors?: Array<{ longMessage?: string }> })?.errors?.[0]
          ?.longMessage ?? "Failed to disconnect account.";
      setError(msg);
    }
    setLoading(null);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">
        Connected Accounts
      </p>
      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No connected accounts.</p>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium capitalize">
                  {account.provider?.replace("oauth_", "") ?? "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {account.emailAddress}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDisconnect(account.id)}
                disabled={loading === account.id}
                className="h-7 text-xs text-muted-foreground hover:text-red-400"
              >
                {loading === account.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Active Sessions                                                     */
/* ------------------------------------------------------------------ */

interface SessionInfo {
  id: string;
  lastActiveAt: Date;
  latestActivity?: {
    deviceType?: string;
    browserName?: string;
    isMobile?: boolean;
  };
  status: string;
}

function ActiveSessionsSection() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    user.getSessions().then((s) => {
      setSessions(
        s.map((sess) => ({
          id: sess.id,
          lastActiveAt: sess.lastActiveAt,
          latestActivity: sess.latestActivity,
          status: sess.status,
        })),
      );
      setLoaded(true);
    });
  }, [user]);

  async function handleRevoke(sessionId: string) {
    if (!user) return;
    setRevoking(sessionId);
    try {
      const allSessions = await user.getSessions();
      const session = allSessions.find((s) => s.id === sessionId);
      if (session) {
        await session.revoke();
        trackEvent("Profile Updated", { field: "session_revoked" });
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch {
      // Session may have already expired
    }
    setRevoking(null);
  }

  if (!loaded) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Active Sessions</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading sessions...
        </div>
      </div>
    );
  }

  const activeSessions = sessions.filter((s) => s.status === "active");

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">
        Active Sessions ({activeSessions.length})
      </p>
      {activeSessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active sessions.</p>
      ) : (
        <div className="space-y-2">
          {activeSessions.map((session) => {
            const activity = session.latestActivity;
            const isMobile = activity?.isMobile;
            const browser = activity?.browserName ?? "Unknown browser";
            const device = activity?.deviceType ?? "Unknown device";
            const lastActive = new Date(session.lastActiveAt).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
            );

            return (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {isMobile ? (
                    <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm">
                      {browser} on {device}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active {lastActive}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(session.id)}
                  disabled={revoking === session.id}
                  className="h-7 text-xs text-muted-foreground hover:text-red-400"
                >
                  {revoking === session.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Revoke"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
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
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-16 w-16 rounded-full border"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-primary/10 text-2xl font-bold text-primary">
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
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Total Playbooks</span>
          </div>
          <p className="mt-2 text-3xl font-bold">{playbookCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Completed</span>
          </div>
          <p className="mt-2 text-3xl font-bold">{completedCount}</p>
        </div>
      </div>

      {/* Account settings */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-6 py-4">
          <h3 className="text-sm font-semibold">Account Settings</h3>
        </div>
        <div className="divide-y px-6">
          <div className="py-4">
            <EditNameSection currentName={fullName} />
          </div>
          <div className="py-4">
            <ChangePasswordSection />
          </div>
          <div className="py-4">
            <ConnectedAccountsSection />
          </div>
          <div className="py-4">
            <ActiveSessionsSection />
          </div>
        </div>
      </div>
    </div>
  );
}
