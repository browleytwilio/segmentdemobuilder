import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/builder(.*)",
  "/admin(.*)",
  "/playbooks(.*)",
  "/profile(.*)",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Backward compat: redirect /login to /sign-in
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(req)) {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return;
  }

  // Protect app routes — unauthenticated users redirected to /sign-in
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = await auth.protect();

    // Belt-and-suspenders: reject non-Twilio emails even if webhook hasn't fired yet
    const email = sessionClaims?.email as string | undefined;
    if (email && !email.endsWith("@twilio.com")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return;
  }

  // Everything else (marketing pages, share routes, API, webhooks) is public
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
