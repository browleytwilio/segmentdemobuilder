"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Profile page error:", error);
  }, [error]);

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center space-y-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <p className="font-semibold text-lg">Unable to load profile</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Something went wrong loading your profile. This is usually
            temporary.
          </p>
        </div>
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
