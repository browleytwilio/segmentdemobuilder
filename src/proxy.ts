import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/proxy";

const protectedPrefixes = ["/builder", "/dashboard", "/playbooks", "/admin"];

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Auth check failed — treat as unauthenticated
  }

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login and marketing homepage
  if ((pathname === "/login" || pathname === "/") && user) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
