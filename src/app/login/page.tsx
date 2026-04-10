"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { trackEvent, identifyUser } from "@/lib/analytics/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type AuthMode = "signin" | "signup";
type AuthMethod = "password" | "magic-link";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [method, setMethod] = useState<AuthMethod>("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track OAuth callback failures surfaced via redirect query param
  useEffect(() => {
    const callbackError = searchParams.get("error");
    if (callbackError) {
      trackEvent("Auth Callback Failed", { error: callbackError });
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  function clearMessages() {
    setError(null);
    setMessage(null);
  }

  async function handleEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (mode === "signup") {
      const { error: signUpError } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        trackEvent("Sign Up Failed", { method: "email", error: signUpError.message });
        setError(signUpError.message);
      } else {
        trackEvent("Signed Up", { method: "email" });
        setMessage("Check your email for a confirmation link.");
      }
    } else {
      const { error: signInError } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        trackEvent("Sign In Failed", { method: "email", error: signInError.message });
        setError(signInError.message);
      } else {
        const {
          data: { user },
        } = await getSupabase().auth.getUser();
        if (user) {
          identifyUser(user.id, {
            email: user.email ?? "",
            created_at: user.created_at,
          });
        }
        trackEvent("Signed In", { method: "email" as const });
        router.push("/dashboard");
        router.refresh();
        return;
      }
    }

    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    clearMessages();

    const { error: otpError } = await getSupabase().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    const emailDomain = email.split("@")[1] ?? "unknown";
    if (otpError) {
      trackEvent("Magic Link Failed", { error: otpError.message });
      setError(otpError.message);
    } else {
      trackEvent("Magic Link Requested", { email_domain: emailDomain });
      setMessage("Check your email for a magic link.");
    }

    setLoading(false);
  }

  async function handleOAuth(provider: "google" | "github") {
    setLoading(true);
    clearMessages();

    trackEvent("OAuth Started", { provider });
    const { error: oauthError } = await getSupabase().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      trackEvent("OAuth Failed", { provider, error: oauthError.message });
      setError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-marketing-blue/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 rounded-full bg-marketing-purple/6 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-marketing-blue to-marketing-purple">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-lg font-semibold text-foreground">
            DemoBuilder
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </div>

      {/* Main */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {mode === "signup"
                ? "Create your account"
                : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signup"
                ? "Start building demo playbooks in minutes."
                : "Sign in to continue building demos."}
            </p>
          </div>

          {/* OAuth buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]"
              disabled={loading}
              onClick={() => handleOAuth("google")}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]"
              disabled={loading}
              onClick={() => handleOAuth("github")}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground/60">
                or continue with email
              </span>
            </div>
          </div>

          {/* Method tabs */}
          <div className="mb-6 flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
            <button
              type="button"
              onClick={() => {
                setMethod("password");
                clearMessages();
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                method === "password"
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("magic-link");
                clearMessages();
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                method === "magic-link"
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Magic Link
            </button>
          </div>

          {/* Form */}
          {method === "password" ? (
            <form onSubmit={handleEmailPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-white/[0.1] bg-white/[0.03]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  className="border-white/[0.1] bg-white/[0.03]"
                />
              </div>

              {/* Messages */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              {message && (
                <div className="flex items-start gap-2 rounded-lg bg-green-500/10 px-3 py-2.5 text-sm text-green-400">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-90"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "signup" ? "Create Account" : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-white/[0.1] bg-white/[0.03]"
                />
              </div>

              {/* Messages */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              {message && (
                <div className="flex items-start gap-2 rounded-lg bg-green-500/10 px-3 py-2.5 text-sm text-green-400">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-90"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Magic Link
              </Button>
            </form>
          )}

          {/* Mode toggle */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-marketing-blue"
                  onClick={() => {
                    setMode("signin");
                    clearMessages();
                  }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-marketing-blue"
                  onClick={() => {
                    setMode("signup");
                    clearMessages();
                  }}
                >
                  Create one
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
