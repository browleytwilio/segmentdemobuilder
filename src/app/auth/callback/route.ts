import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const response = NextResponse.redirect(new URL("/dashboard", origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers
              .get("cookie")
              ?.split("; ")
              .map((c) => {
                const [name, ...rest] = c.split("=");
                return { name, value: rest.join("=") };
              }) ?? [];
          },
          setAll(cookiesToSet, headers) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
            Object.entries(headers).forEach(([key, value]) =>
              response.headers.set(key, value)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
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
