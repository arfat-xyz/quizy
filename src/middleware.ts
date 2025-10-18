import authConfig from "@/lib/auth.config";
// import { Role } from "@prisma/client";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// const publicRoutes = ["/", "/auth/login", "/auth/register"];
const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/forget-password",
  "/verify-email",
];
const adminRoutes = ["/dashboard"];

export default auth(async req => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = adminRoutes.some(route =>
    nextUrl.pathname.startsWith(route),
  );

  // Allow API auth routes (login, register, etc.)
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    if (req.auth?.user?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    } else {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Protect private routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    } else if (req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
  }

  // Allow public routes
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
