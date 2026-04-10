import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const origin = new URL(request.url).origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectUrl = new URL("/dashboard", origin);
      const response = NextResponse.redirect(redirectUrl);
      // Set short-lived cookie for client-side identify after OAuth redirect
      response.cookies.set("x-analytics-identify", "1", {
        maxAge: 30,
        httpOnly: false,
        path: "/",
        sameSite: "lax",
      });
      return response;
    }

    const errorParam = encodeURIComponent(error.message || "code-exchange-failed");
    return NextResponse.redirect(new URL(`/login?error=${errorParam}`, origin));
  }

  return NextResponse.redirect(new URL("/login?error=missing-auth-code", origin));
}
