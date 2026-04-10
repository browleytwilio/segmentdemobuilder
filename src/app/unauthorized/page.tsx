"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ShieldAlertIcon } from "lucide-react";

export default function UnauthorizedPage() {
  const { signOut } = useClerk();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <ShieldAlertIcon className="mb-6 size-12 text-muted-foreground/50" />
      <h1 className="text-2xl font-bold tracking-tight">Access Restricted</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        DemoBuilder is available to Twilio employees only. Please sign in with
        your <span className="font-medium text-foreground">@twilio.com</span>{" "}
        email address.
      </p>
      <div className="mt-6 flex gap-3">
        <Button
          variant="outline"
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
        >
          Sign out &amp; try again
        </Button>
      </div>
    </div>
  );
}
