import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/share(.*)",
  "/unauthorized",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Backward compat: redirect /login to /sign-in
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isPublicRoute(req)) {
    // Redirect authenticated users away from auth pages
    const { userId } = await auth();
    if (
      userId &&
      (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return;
  }

  // Redirect root to dashboard for authenticated users
  if (pathname === "/") {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Protect all non-public routes
  const { userId, sessionClaims } = await auth.protect();

  // Belt-and-suspenders: reject non-Twilio emails even if webhook hasn't fired yet
  const email = sessionClaims?.email as string | undefined;
  if (email && !email.endsWith("@twilio.com")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
